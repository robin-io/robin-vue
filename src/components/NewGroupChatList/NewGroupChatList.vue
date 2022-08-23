<script lang="tsx">
import {
  ref,
  reactive,
  defineComponent,
  computed,
  onBeforeUpdate,
} from 'vue-demi';
import { Robin } from 'robin.io-js';
import useEmitter from '@/utilities/index';
import { Hashmap } from '@/utilities/types';
import store from '@/store/index';
import IconButton from '../IconButton/IconButton.vue';
import Content from '../Content/Content.vue';
import SearchBar from '../SearchBar/SearchBar.vue';
import Button from '../Button/Button.vue';
import Avatar from '../Avatar/Avatar.vue';
import CheckBox from '../CheckBox/CheckBox.vue';
import AlphabetBlock from '../AlphabetBlock/AlphabetBlock.vue';

export default defineComponent({
  name: 'NewGroupChatList',
  props: {
    groupName: {
      type: String,
      default: '',
    },
    groupIcon: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    Content,
    SearchBar,
    Button,
    Avatar,
    IconButton,
    CheckBox,
    AlphabetBlock,
  },
  setup(props, context) {
    const { expose } = context;
    const popUpBody = ref();
    let contacts = reactive({} as Hashmap);
    const users = ref([] as Array<Hashmap>);
    const searchData = ref([] as Array<Hashmap>);
    const checkBoxKeyState = ref(0);
    const key = ref(0);
    const conversationId = ref('');
    const isLoading = ref(false);
    const isUploading = ref(false);
    const modalOpen = ref(false);
    const updatingParticipants = ref(false);
    let checkboxComponents = [] as Array<any>;

    const robin = computed(() => store.state.robin as Robin);
    const robinUsers = computed(
      () => store.state.robin_users as Array<Hashmap>
    );
    const senderName = computed(
      () => store.state.robin_users as Array<Hashmap>
    );
    const userToken = computed(() => store.state.user_token as string);
    const { emit, listen } = useEmitter();

    onBeforeUpdate(() => {
      checkboxComponents = [];
    });

    const closeModal = (): void => {
      modalOpen.value = false;
      users.value = [];
      checkBoxKeyState.value += 1;
    };

    const openModal = (): void => {
      modalOpen.value = true;

      checkBoxKeyState.value += 1;
    };

    const getContacts = (searchText: string): void => {
      contacts.value = reactive({});

      if (searchText.trim() === '') {
        robinUsers.value.forEach((user: any) => {
          contacts.value[getContactKey(user.userName)] =
            robinUsers.value.filter(
              (item: any) =>
                item.userToken !== userToken &&
                validateContact(item.userName, user.userName)
            );
        });

        for (const key in contacts.value) {
          if (contacts.value[key].length === 0) {
            delete contacts[key].value;
          }
        }

        sortContacts();
      } else {
        searchData.value.forEach((user: any) => {
          contacts.value[getContactKey(user.userName)] =
            searchData.value.filter(
              (item: any) =>
                item.userToken !== userToken &&
                validateContact(item.userName, user.userName)
            );
        });
      }
    };

    const toggleCheckAction = (val: boolean, user: Object): void => {
      if (!val) {
        addUser(user);
      } else {
        removeUser(user);
      }
    };

    const toggleSelectAllCheckAction = (val: boolean) => {
      if (!val) {
        users.value = [...robinUsers.value];

        for (let i = 0; i < checkboxComponents.length; i += 1) {
          checkboxComponents[i].checked = true;
        }
      } else {
        users.value = [];

        for (let i = 0; i < checkboxComponents.length; i += 1) {
          checkboxComponents[i].checked = false;
        }
      }
    };

    const createGroupConversation = async (): Promise<void> => {
      const moderator = {
        user_token: userToken.value,
        meta_data: {
          display_name: senderName.value,
        },
      };

      const userData = users.value.map((user) => {
        return {
          user_token: user.userToken,
          meta_data: {
            profile_image: user.profileImage,
            display_name: user.userName,
          },
        };
      });

      isUploading.value = true;
      const res = await robin.value.createGroupConversation(
        props.groupName,
        moderator,
        userData
      );

      if (res && !res.error) {
        if (props.groupIcon.file) {
          uploadGroupIcon(res.data).then(() => {
            context.emit('changesidebartype', 'primary');
            context.emit('closemodal');
            context.emit('reset-groupname');
            toggleSelectAllCheckAction(true);
            isUploading.value = false;
          });
        } else {
          context.emit('changesidebartype', 'primary');
          context.emit('closemodal');
          context.emit('reset-groupname');
          isUploading.value = false;
        }
      } else {
        // context.toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
        isUploading.value = false;
      }
    };

    const uploadGroupIcon = async (conversation: any): Promise<void> => {
      const res = await robin.value.uploadGroupIcon(
        conversation._id,
        props.groupIcon.file
      );

      if (res && !res.error) {
        context.emit('reset-groupicon');
      }
    };

    const addGroupParticipants = () => {
      const userData = users.value.map((user) => {
        return {
          user_token: user.userToken,
          meta_data: {
            profile_image: user.profileImage,
            display_name: user.userName,
          },
        };
      });

      isUploading.value = true;
      const res = await robin.value.addGroupParticipants(
        conversationId.value,
        userData
      );

      if (res && !res.error) {
        conversationId.value = '';
        isUploading.value = false;
        context.emit('changesidebartype', 'primary');
        context.emit('closemodal');
        context.emit('reset-groupname');
        toggleSelectAllCheckAction(true);

        emit('update.group.conversation', res.data);
      } else {
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
        isUploading.value = false;
      }
    };

    const handleAddGroupParticipants = () => {
      listen('edit.participants.group', (details: any) => {
        conversationId.value = details.conversation_id;

        updatingParticipants.value = true;
      });
    };

    const addUser = (user: Object): void => {
      users.value.push(user);
    };

    const removeUser = (user: any): void => {
      const userIndex = users.value.findIndex(
        (item) => item.userToken === user.userToken
      );
      users.value.splice(userIndex, 1);

      if (users.value.length < 1) {
        closeModal();
      }
    };

    const addIndexToCheckBoxState = (
      index: any,
      checkBoxKeyState: number
    ): number => {
      return parseInt(index) + checkBoxKeyState;
    };

    const searchContacts = (searchText: string): void => {
      isLoading.value = true;

      const data = robinUsers.value.filter((obj: any) => {
        let stopSearch = false;
        Object.values(obj).forEach((val) => {
          const filter = String(val)
            .toLowerCase()
            .includes(searchText.toLowerCase());
          if (filter) {
            stopSearch = true;
          }
        });
        if (stopSearch) {
          return obj;
        }
      });

      searchData.value = [...data];
      getContacts(searchText);
      setTimeout(() => {
        isLoading.value = false;
      }, 300);
    };

    const sortContacts = (): void => {
      contacts = reactive(
        Object.keys(contacts.value)
          .sort()
          .reduce((result: any, key: string) => {
            result[key] = contacts[key];
            return result;
          }, {})
      );
    };

    const getContactKey = (username: any): string => {
      return username !== '' && isNaN(parseInt(username[0]))
        ? username[0].toUpperCase()
        : '*';
    };

    const validateContact = (usernameVal: any, username: any): boolean => {
      if (!usernameVal[0] && !username[0]) {
        return usernameVal.trim() === username.trim();
      }

      if (usernameVal[0] && username[0]) {
        return usernameVal[0].toUpperCase() === username[0].toUpperCase();
      }

      return false;
    };

    const openPreviousModal = (): void => {
      if (!updatingParticipants.value) {
        context.emit('closemodal', 'newgroup');
      } else {
        context.emit('changesidebartype', 'primary');
        context.emit('closemodal');

        toggleSelectAllCheckAction(true);
      }
      updatingParticipants.value = false;
      setTimeout(() => {
        refresh();
      }, 300);
    };

    const refresh = (): void => {
      key.value += 1;
    };

    handleAddGroupParticipants();

    expose({ popUpBody });

    return {
      popUpBody,
      updatingParticipants,
      users,
      checkBoxKeyState,
      isLoading,
      isUploading,
      checkboxComponents,
      contacts,
      toggleCheckAction,
      searchContacts,
      openPreviousModal,
      createGroupConversation,
      addIndexToCheckBoxState,
      addGroupParticipants,
      toggleSelectAllCheckAction,
    };
  },
  render() {
    return (
      <div class="robin-new-group-chat-list" ref={this.popUpBody}>
        <header class="robin-header">
          <IconButton
            name="remove"
            onClose={() => this.openPreviousModal()}
            emit="close"
            to-emit={true}
            to-click-away={false}
          />

          <Content font-weight="400" font-size={16} class="robin-ml-12">
            {() =>
              !this.updatingParticipants
                ? 'New Group Chat'
                : 'Add Group Participants'
            }
          </Content>

          <div class="robin-ml-auto">
            <Button
              emit="done"
              onDone={
                !this.updatingParticipants
                  ? this.createGroupConversation()
                  : this.addGroupParticipants()
              }
              v-show={this.users.length > 0 && !this.isUploading}
              class="robin-pulse-2"
            >
              {() => 'Done'}
            </Button>
            <div class="robin-spinner" v-show={this.isUploading}></div>
          </div>
        </header>

        <div class="robin-w-100 robin-pl-16 robin-pr-16">
          <SearchBar
            onUserTyping={(event: string) => this.searchContacts(event)}
            loading={this.isLoading}
            placeholder="Search"
          />
        </div>

        <div class="robin-select robin-flex robin-flex-align-center robin-flex-justify-end robin-w-100 robin-pl-16 robin-pr-16 robin-pt-24 robin-pb-23">
          <Content color="#9999BC"> {() => 'Select All'} </Content>
          <CheckBox
            class="robin-ml-8"
            onClicked={(event: boolean) =>
              this.toggleSelectAllCheckAction(event)
            }
            data-testid="select-all-button"
          />
        </div>

        <div class="robin-contact-container robin-overflow-y-auto">
          {Object.entries(this.contacts).map(([key, contact], index) => {
            <div key={`contact-${index}`}>
              <div class="robin-w-100" v-show={key.toString() != '*'}>
                <AlphabetBlock text={key} />
              </div>
              <div class="robin-card-container robin-flex robin-flex-column">
                {contact.map((user: Hashmap, userIndex: number) => {
                  <div
                    class="robin-card robin-flex robin-flex-align-center"
                    key={user.userToken}
                  >
                    <div class="robin-card-info robin-mr-12">
                      <Avatar
                        img-url={user.profileImage}
                        sender-token={user.userToken}
                      />
                    </div>

                    <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1">
                      <div class="robin-flex">
                        <Content
                          font-size={14}
                          line-height={18}
                          data-testid="content"
                        >
                          {() => user.userName}
                        </Content>
                      </div>
                      <div class="robin-ml-auto">
                        <CheckBox
                          key={this.addIndexToCheckBoxState(
                            userIndex,
                            this.checkBoxKeyState
                          )}
                          onClicked={(event: boolean) =>
                            this.toggleCheckAction(event, user)
                          }
                          ref={(element: HTMLElement) =>
                            this.checkboxComponents.push(element)
                          }
                          data-testid="checkbox"
                        />
                      </div>
                    </div>
                  </div>;
                })}
              </div>
            </div>;
          })}
        </div>
      </div>
    );
  },
});
</script>
