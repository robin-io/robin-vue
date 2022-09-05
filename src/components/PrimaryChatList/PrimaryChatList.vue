<script lang="tsx">
import {
  ref,
  nextTick,
  defineComponent,
  watchEffect,
  watch,
  computed,
  onMounted,
  useSlots
} from 'vue-demi';
import moment from 'moment';
import store from '@/store/index';
import { RobinType, Hashmap } from '@/utilities/types';
import useEventsBus from '@/utilities/index';
import assets from '@/asset-url.json';
import Content from '../Content/Content.vue';
import IconButton from '../IconButton/IconButton.vue';
import SearchBar from '../SearchBar/SearchBar.vue';
import SvgIcon from '../SvgIcon/SvgIcon.vue';
import Button from '../Button/Button.vue';
import Avatar from '../Avatar/Avatar.vue';
import GroupAvatar from '../GroupAvatar/GroupAvatar.vue';
import UnreadMessageCount from '../UnreadMessageCount/UnreadMessageCount.vue';
import ChatListPopOver from '../ChatListPopOver/ChatListPopOver.vue';
import './PrimaryChatList.css';

export default defineComponent({
  name: 'PrimaryChatList',
  components: {
    Content,
    IconButton,
    SvgIcon,
    SearchBar,
    Button,
    Avatar,
    GroupAvatar,
    UnreadMessageCount,
    ChatListPopOver
  },
  props: {
    regularConversations: {
      type: Array,
      default: (): Array<any> => []
    },
    archivedConversations: {
      type: Array,
      default: (): Array<any> => []
    }
  },
  setup(props) {
    const slots = useSlots();
    const conversations = ref([] as Array<Hashmap>);
    let popUpStates = ref([] as Array<Hashmap>);
    const chatListContainers = ref([] as Array<HTMLElement>);
    const chatListPopUp = ref([] as Array<HTMLElement>);
    const avatarKey = ref(0);
    const key = ref(0);
    const screenWidth = ref(0);
    const isLoading = ref(false);
    const scroll = ref(false);

    const { emit, listen } = useEventsBus();

    listen('group.icon.update', (conversation: Hashmap) => {
      onGroupIconUpdate(conversation);
    });

    const robin = computed(() => store.state.robin as RobinType) as any;
    const robinUsers = computed(
      () => store.state.robin_users as Array<Hashmap>
    );
    const userToken = computed(() => store.state.user_token as string);

    const isPageLoading = computed(() => store.state.isPageLoading);
    const currentConversation = computed(() => store.state.currentConversation);
    const isCreateChatEnabled = computed(() => store.state.createChatEnabled);
    const isArchiveChatEnabled = computed(() => store.state.archiveChatEnabled);
    const logo = computed(() => store.state.logo);

    watchEffect(() => {
      if (props.regularConversations.length) {
        conversations.value = [...props.regularConversations].sort(
          (a: any, b: any) => {
            const dateA = moment(
              a.last_message ? a.last_message.timestamp : a.updated_at
            ).valueOf();
            const dateB = moment(
              b.last_message ? b.last_message.timestamp : b.updated_at
            ).valueOf();

            if (dateA > dateB) {
              return -1;
            }

            if (dateB < dateA) {
              return 1;
            }

            return 0;
          }
        ) as Array<Hashmap>;

        popUpStates.value = [];
        conversations.value.forEach((val: Hashmap) => {
          popUpStates.value.push({
            opened: false,
            _id: val._id
          });
        });
      }
    });

    watch(
      () => robinUsers.value,
      (users) => {
        if (users) {
          avatarKey.value += 1;
        }
      }
    );

    onMounted(() => {
      nextTick(function () {
        onResize();
      });

      window.addEventListener('resize', onResize);
    });

    const onGroupIconUpdate = (conversation: Hashmap): void => {
      const index = conversations.value.findIndex(
        (item: Hashmap) => item._id === conversation._id
      );

      conversations.value[index] = conversation;
    };

    const openConversation = (conversation: Hashmap): void => {
      store.setState('imagePreviewOpen', false);
      emit('conversation-opened', conversation);
      emit('open-conversation');
    };

    const archiveConversation = async (conversation: any): Promise<void> => {
      const res = await robin.value.archiveConversation(
        conversation._id,
        userToken.value
      );

      if (!res.error) {
        emit('regular-conversation.delete', conversation);
        emit('archived-conversation.add', conversation);
        // this.$toast.open({
        //   message: 'Conversation archived.',
        //   type: 'success',
        //   position: 'bottom-left'
        // })
        emit('refresh');
      }
    };

    const formatRecentMessageTime = (time: string): string => {
      const datetime = moment(time);

      return datetime.calendar(undefined, {
        sameDay: function () {
          return '[' + datetime.fromNow() + ']';
        },
        lastDay: function () {
          return '[' + datetime.fromNow() + ']';
        },
        lastWeek: function () {
          return '[' + datetime.fromNow() + ']';
        },
        sameElse: 'DD/MM/YYYY'
      });
    };

    const getProfileImage = (conversation: any) => {
      const index = robinUsers.value.findIndex(
        (user: any) => user.userToken === conversation.sender_token
      );

      return robinUsers.value[index]
        ? robinUsers.value[index].profileImage
        : null;
    };

    const searchConversation = (searchText: string) => {
      let searchData = [] as Array<any>;
      isLoading.value = true;
      // eslint-disable-next-line array-callback-return
      const data = props.regularConversations.filter((obj) => {
        let stopSearch = false;
        Object.values(obj as Hashmap).forEach((val) => {
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

      searchData = [...data];
      emit('search', {
        text: searchText,
        data: searchData
      });
      setTimeout(() => {
        isLoading.value = false;
      }, 300);
    };

    const openEdit = (): void => {
      emit('opennewchatmodal', 'newchat');
      setTimeout(() => {
        refresh();
      }, 300);
    };

    const openArchivedChat = (): void => {
      emit('openarchivedchatmodal', 'archivedchat');
      setTimeout(() => {
        refresh();
      }, 300);
    };

    const onScroll = (): void => {
      scroll.value = true;
    };

    const refresh = (): void => {
      key.value += 1;
    };

    const markAsRead = (conversation: Hashmap) => {
      emit('mark-as-read', conversation);
    };

    const markAsUnread = (conversation: Hashmap) => {
      emit('mark-as-unread.modified', conversation);
    };

    const deleteConversation = async (conversation: Hashmap) => {
      const res = await robin.value.deleteConversation(
        userToken.value,
        conversation._id
      );

      if (res && !res.error) {
        emit('regular-conversation.delete', conversation);
        emit('close-conversation', conversation);
        // this.$toast.open({
        //   message: 'Conversation deleted.',
        //   type: 'success',
        //   position: 'bottom-left'
        // })
      } else {
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    const handleOpenPopUp = (event: any, _id: string, id: string) => {
      const popUpContainer = chatListContainers.value[parseInt(id)] as any;
      const popUp = chatListPopUp.value[parseInt(id)] as any;

      popUp.popUpBody.classList.remove('robin-zoomOut');

      if (
        (!scroll.value && conversations.value.length - 2 !== parseInt(id)) ||
        conversations.value.length - 1 !== parseInt(id)
      ) {
        popUpContainer.style.top = event.clientY - 12 + 'px';

        if (screenWidth.value > 1024) {
          popUpContainer.style.left = event.clientX - 90 + 'px';
        } else {
          popUpContainer.style.left = event.clientX - 145 + 'px';
        }
      } else {
        popUpContainer.style.top = event.clientY - 60 + 'px';
        if (screenWidth.value > 1024) {
          popUpContainer.style.left = event.clientX - 90 + 'px';
        } else {
          popUpContainer.style.left = event.clientX - 145 + 'px';
        }
      }

      const index = popUpStates.value.findIndex((val) => val._id === _id);
      popUpStates.value[index].opened = true;

      popUpStates.value.forEach((val, i) => {
        if (val._id !== _id) {
          popUpStates.value[i].opened = false;
        }
      });
    };

    const handleClosePopUp = (_id: string, index: number) => {
      const popup = chatListPopUp.value[index] as any;

      popup.popUpBody.classList.add('robin-zoomOut');

      window.setTimeout(() => {
        const index = popUpStates.value.findIndex((val) => val._id === _id);
        if (
          popUpStates.value[index] ? popUpStates.value[index].opened : false
        ) {
          popup.popUpBody.classList.remove('robin-zoomOut');

          popUpStates.value[index].opened = false;
        }
      }, 300);
    };

    const onResize = () => {
      screenWidth.value = window.innerWidth;
    };

    const bindChatListContainerToState = ((element: HTMLElement) => {
      chatListContainers.value.push(element);
    }) as any;

    const bindChatListPopUpsToState = ((element: HTMLElement) => {
      chatListPopUp.value.push(element);
    }) as any;

    return {
      slots,
      logo,
      isPageLoading,
      isCreateChatEnabled,
      isArchiveChatEnabled,
      conversations,
      currentConversation,
      screenWidth,
      robinUsers,
      avatarKey,
      userToken,
      popUpStates,
      chatListContainers,
      chatListPopUp,
      key,
      isLoading,
      openEdit,
      onScroll,
      formatRecentMessageTime,
      searchConversation,
      openArchivedChat,
      openConversation,
      getProfileImage,
      handleOpenPopUp,
      handleClosePopUp,
      archiveConversation,
      deleteConversation,
      markAsRead,
      bindChatListContainerToState,
      bindChatListPopUpsToState,
      markAsUnread
    };
  },
  render() {
    const getConversationDetailElements = (
      conversation: Hashmap,
      index: number
    ) => {
      return (
        <div
          class={
            this.currentConversation._id == conversation._id &&
            this.screenWidth > 1200
              ? 'robin-card robin-flex robin-flex-align-center robin-card-active'
              : 'robin-card robin-flex robin-flex-align-center'
          }
          key={`conversation-${index}`}
          onClickSelf={() => {
            this.openConversation(conversation);
          }}
          data-testid={`conversation-${index}`}
        >
          <div
            class="robin-card-info robin-mr-12"
            onClick={() => this.openConversation(conversation)}
          >
            {!conversation.is_group ? (
              <Avatar
                robin-users={this.robinUsers}
                key={this.avatarKey}
                imgUrl={
                  this.getProfileImage(conversation) ||
                  conversation.display_photo
                }
                sender-token={
                  conversation.sender_token === this.userToken
                    ? conversation.receiver_token
                    : conversation.sender_token
                }
                data-testid="regular-avatar"
              ></Avatar>
            ) : (
              <GroupAvatar
                imgUrl={conversation.group_icon}
                data-testid="group-avatar"
              ></GroupAvatar>
            )}
          </div>

          <div
            class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-pt-4 robin-pb-41 robin-flex-1"
            onClickSelf={() => this.openConversation(conversation)}
          >
            <div
              class="robin-flex robin-flex-space-between"
              onClick={() => this.openConversation(conversation)}
            >
              {!conversation.is_group ? (
                <Content
                  font-weight="normal"
                  color="#000000"
                  font-size={16}
                  line-height={20}
                >
                  {() =>
                    conversation.sender_token != this.userToken
                      ? conversation.sender_name
                      : conversation.receiver_name
                  }
                </Content>
              ) : (
                <Content
                  font-weight="normal"
                  color="#000000"
                  font-size={16}
                  line-height={20}
                >
                  {() => conversation.name}
                </Content>
              )}

              <Content
                as="p"
                fontWeight="normal"
                color="#51545C"
                fontSize={14}
                lineHeight={18}
              >
                {() =>
                  this.formatRecentMessageTime(
                    conversation.last_message
                      ? conversation.last_message.timestamp
                      : conversation.updated_at
                  )
                }
              </Content>
            </div>

            <div
              class="robin-flex robin-flex-space-between"
              onClickSelf={() => this.openConversation(conversation)}
            >
              <div
                class="robin-mini-info-container robin-flex-1"
                onClickSelf={() => this.openConversation(conversation)}
              >
                {conversation.last_message &&
                !conversation.last_message.is_attachment ? (
                  <Content
                    as="p"
                    font-weight="normal"
                    color="#8D9091"
                    font-size={14}
                    line-height={18}
                  >
                    {() =>
                      conversation.last_message &&
                      conversation.last_message.msg.length < 20
                        ? conversation.last_message.msg
                        : conversation.last_message
                        ? conversation.last_message.msg.substring(0, 20) +
                          ' ...'
                        : ''
                    }
                  </Content>
                ) : (
                  ''
                )}

                {conversation.last_message &&
                conversation.last_message.is_attachment ? (
                  <Content
                    v-show="conversation.last_message && conversation.last_message.is_attachment"
                    as="p"
                    font-weight="normal"
                    color="#8D9091"
                    font-size={14}
                    line-height={18}
                  >
                    {() => (
                      <b>
                        <i>Attachment</i>
                      </b>
                    )}
                  </Content>
                ) : (
                  ''
                )}
              </div>

              <div class="robin-mini-info-container robin-flex robin-flex-align-center">
                {conversation.unread_messages > 0 ||
                conversation.unread_messages == 'marked' ? (
                  <div
                    class="mini-info robin-ml-10"
                    onClick={() => this.openConversation(conversation)}
                  >
                    <UnreadMessageCount
                      unread={conversation.unread_messages}
                      background-color="#EA8D51"
                    />
                  </div>
                ) : (
                  ''
                )}
                <div
                  class="robin-hidden robin-ml-10"
                  onClick={(event) =>
                    this.handleOpenPopUp(
                      event,
                      conversation._id,
                      index.toString()
                    )
                  }
                >
                  <IconButton
                    name="openModalDot"
                    to-click-away={true}
                    to-emit={false}
                    onClickoutside={() => {
                      this.handleClosePopUp(conversation._id, index);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            class="robin-popup-container"
            ref={this.bindChatListContainerToState}
            v-show={
              this.popUpStates[index] ? this.popUpStates[index].opened : false
            }
            refInFor={this.chatListContainers}
          >
            <ChatListPopOver
              ref={this.bindChatListPopUpsToState}
              conversation={conversation}
              onArchiveChat={() => this.archiveConversation(conversation)}
              onDeleteConversation={() => this.deleteConversation(conversation)}
              onMarkAsRead={() => this.markAsRead(conversation)}
              onMarkAsUnread={() => this.markAsUnread(conversation)}
            />
          </div>
        </div>
      );
    };

    return (
      <div class="robin-primary-chat-list">
        <header class="robin-header">
          {this.logo === '' ? (
            <img src={assets['logo']} alt="logo" />
          ) : (
            <img class="custom" src={this.logo} alt="logo" />
          )}

          <div class="robin-wrapper">
            {this.isCreateChatEnabled ? (
              <IconButton
                name="edit"
                onEdit={() => this.openEdit()}
                emit="edit"
                to-emit={true}
                to-click-away={false}
                color="#fff"
              />
            ) : (
              ''
            )}
            {this.slots['chat-list-header']?.()}
          </div>
        </header>

        <div class="robin-wrapper robin-w-100 robin-pl-16 robin-pr-16 robin-pb-16">
          <SearchBar
            onUserTyping={(event: string) => this.searchConversation(event)}
            loading={this.isLoading}
            key={this.key}
          />
        </div>

        {this.isArchiveChatEnabled ? (
          <Button
            class="robin-wrapper robin-pl-16 robin-pr-16 robin-flex robin-flex-space-between robin-w-100 robin-pt-16 robin-pb-12"
            onArchived={() => this.openArchivedChat()}
          >
            <div
              class="robin-flex robin-flex-align-center"
              v-show={this.archivedConversations.length > 0}
            >
              <SvgIcon name="mailbox" color="#15AE73" />

              <Content class="robin-ml-6" font-weight="400" color="#15AE73">
                {() => 'Archived Chats'}
              </Content>
            </div>

            <Content
              font-weight="400"
              color="#15AE73"
              v-show={this.archivedConversations.length > 0}
              data-testid="archived-conversation-count"
            >
              {() => this.archivedConversations.length}
            </Content>
          </Button>
        ) : (
          ''
        )}

        <div v-show={this.isPageLoading} class="robin-spinner"></div>

        <div
          v-show={!this.isPageLoading}
          class={
            this.screenWidth > 1200
              ? 'robin-wrapper robin-card-container robin-pb-16 robin-flex robin-flex-column robin-come-down'
              : 'robin-wrapper robin-card-container robin-pb-16 robin-flex robin-flex-column'
          }
          onScroll={() => this.onScroll()}
        >
          {this.conversations.map((conversation: Hashmap, index: number) => {
            return getConversationDetailElements(conversation, index);
          })}
        </div>
      </div>
    );
  }
});
</script>
