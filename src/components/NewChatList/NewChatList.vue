<script lang="tsx">
import {
  defineComponent,
  ref,
  computed,
  PropType,
  h,
  reactive,
  watch
} from 'vue-demi';
import { Robin } from 'robin.io-js';
import useEmitter from '@/utilities/index';
import { Hashmap } from '@/utilities/types';
import store from '@/store/index';
import AlphabetBlock from '../AlphabetBlock/AlphabetBlock.vue';
import Content from '../Content/Content.vue';
import IconButton from '../IconButton/IconButton.vue';
import SearchBar from '../SearchBar/SearchBar.vue';
import Avatar from '../Avatar/Avatar.vue';
import Button from '../Button/Button.vue';
import './NewChatList.css';

export default defineComponent({
  name: 'NewChatList',
  components: {
    Avatar,
    Content,
    IconButton,
    SearchBar,
    Button,
    // SvgIcon,
    AlphabetBlock
  },
  setup(props, { expose }) {
    let contacts = reactive({} as Hashmap);
    const searchData = ref([] as Array<Hashmap>);
    const isLoading = ref(false);
    const key = ref(0);
    const popupBody = ref();
    const robinUsers = computed(
      () => store.state.robin_users as Array<Hashmap>
    );

    const { emit } = useEmitter();

    watch(robinUsers, () => {
      getContacts('');
    });

    const robin = computed(() => store.state.robin as Robin);
    const senderName = computed(() => store.state.sender_name as string);
    const conversations = computed(
      () => store.state.conversations as Array<Hashmap>
    );
    const userToken = computed(() => store.state.user_token as string);

    const getContacts = (searchText: string) => {
      contacts = reactive({});

      if (searchText.trim() === '') {
        robinUsers.value.forEach((user: any) => {
          contacts[getContactKey(user.userName)] = robinUsers.value.filter(
            (item: any) =>
              item.userToken !== userToken &&
              validateContact(item.userName, user.userName)
          );
        });

        for (const key in contacts) {
          if (contacts[key].length === 0) {
            delete contacts[key];
          }
        }

        sortContacts();
      } else {
        searchData.value.forEach((user: any) => {
          contacts[getContactKey(user.userName)] = searchData.value.filter(
            (item: any) =>
              item.userToken !== userToken &&
              validateContact(item.userName, user.userName)
          );
        });
      }
    };

    const sortContacts = (): void => {
      contacts = Object.keys(contacts)
        .sort()
        .reduce((result: any, key: string) => {
          result[key] = contacts[key];
          return result;
        }, {});
    };

    const getContactKey = (username: string): string => {
      if (username && username.trim() !== '' && isNaN(parseInt(username[0]))) {
        return username[0].toUpperCase();
      }
      return '*';
    };

    const validateContact = (usernameVal: any, username: any): boolean => {
      if (!usernameVal[0] && !username[0]) {
        return usernameVal?.trim() === username.trim();
      }

      if (usernameVal[0] && username[0]) {
        return usernameVal[0].toUpperCase() === username[0].toUpperCase();
      }

      return false;
    };

    const createConversation = async (user: Hashmap) => {
      const res = await robin.value.createConversation({
        sender_name: senderName.value,
        sender_token: userToken.value,
        receiver_token: user.userToken,
        receiver_name: user.userName
      });

      if (res && !res.error) {
        if (!checkConversations(res.data)) {
          conversations.value.push(res.data);
        }

        emit('conversation-opened', res.data);
        emit('open-conversation');
        openPreviousModal();
      } else {
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    const checkConversations = (convo: Hashmap): Boolean => {
      let res = false;
      conversations.value.forEach((conversation: Hashmap) => {
        if (conversation._id === convo._id) {
          res = true;
        }
      });
      return res;
    };

    const openPreviousModal = (): void => {
      emit('closemodal', 'primary');
      setTimeout(() => {
        refresh();
      }, 300);
    };

    const openGroupChat = (): void => {
      emit('openmodal', 'newgroup');
      setTimeout(() => {
        refresh();
      }, 300);
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

    const refresh = (): void => {
      key.value += 1;
    };

    getContacts('');

    expose({ popupBody });

    return {
      key,
      isLoading,
      contacts,
      popupBody,
      robinUsers,
      openPreviousModal,
      openGroupChat,
      searchContacts,
      createConversation
    };
  },
  render() {
    return (
      <div
        class="robin-new-chat-list"
        ref={(element) => (this.popupBody = element)}
      >
        <header class="robin-header">
          <IconButton
            name="remove"
            onClose={() => this.openPreviousModal()}
            emit="close"
            to-emit={true}
            to-click-away={false}
          />

          <Content font-weight="400" font-size={16} class="robin-ml-12">
            {() => 'New Chat'}
          </Content>
        </header>

        <div class="robin-w-100 robin-pl-16 robin-pr-16">
          <SearchBar
            onUserTyping={(event: string) => this.searchContacts(event)}
            loading={this.isLoading}
            key={this.key}
            placeholder="Search or start new chat"
          />
        </div>

        <div class="robin-w-100 robin-create-group robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pl-16 robin-pr-16 robin-flex-1 robin-mt-31 robin-pb-16">
          <Button
            color="#15AE73"
            font-size={14}
            emit="newgroupchat"
            onNewGroupChat={() => this.openGroupChat()}
            class="robin-flex robin-flex-align-center"
          >
            <Content class="robin-ml-5" color="#15AE73">
              {() => 'Create Group Chat'}
            </Content>
          </Button>
        </div>

        <div class="robin-contact-container robin-overflow-y-auto">
          {Object.entries(this.contacts).map(([key, contact], index) => {
            return (
              <div key={`contact-${index}`}>
                <AlphabetBlock text={key} v-show={key.toString() != '*'} />

                <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-grey-200">
                  <div
                    class="robin-card robin-flex robin-flex-align-center robin-clickable"
                    key={contact.userToken}
                    onClick={() => this.createConversation(contact)}
                  >
                    <div class="robin-card-info robin-mr-12">
                      <Avatar
                        robinUsers={this.robinUsers}
                        imgUrl={contact.profileImage}
                        sender-token={contact.userToken}
                      />
                    </div>

                    <div class="robin-card-info robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1">
                      <div class="robin-flex">
                        <Content font-size={14} line-height={18}>
                          {() => contact.userName}
                        </Content>
                      </div>
                    </div>
                  </div>
                  ;
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});
</script>
