<script lang="tsx">
import {
  ref,
  reactive,
  defineComponent,
  computed,
  useSlots,
  defineAsyncComponent
} from 'vue-demi';
import store from '@/store/index';
import { RobinType, Hashmap } from '@/utilities/types';
import useEmitter from '@/utilities/index';
import NoChatList from '../NoChatList/NoChatList.vue';
import './SideContainer.css';

const PrimaryChatList = defineAsyncComponent({
  loader: () => import('../PrimaryChatList/PrimaryChatList.vue'),
  loadingComponent: NoChatList
});

const NewChatList = defineAsyncComponent({
  loader: () => import('../NewChatList/NewChatList.vue'),
  loadingComponent: NoChatList
});

export default defineComponent({
  name: 'SideContainer',
  setup() {
    const slots = useSlots();
    const slides = reactive({
      slide1: ref(null),
      slide2: ref(null),
      slide3: ref(null),
      slide4: ref(null)
    });
    const sideBarType = ref('primary');
    const searchText = ref('');
    const groupName = ref('');
    const key = ref(0);
    let regularConversations = ref([] as Array<Hashmap>);
    const archivedConversations = ref([] as Array<Hashmap>);
    const conversations = ref([] as Array<Hashmap>);
    const groupIcon = reactive({} as Hashmap);

    const { emit, listen } = useEmitter();

    listen('new-group.conversation', (conversation: Hashmap) => {
      onGroupConversation(conversation);
    });

    listen('new.conversation', (conversation: Hashmap) => {
      onNewConversation(conversation);
    });

    listen('regular-conversation.add', (conversation: Hashmap) => {
      addRegularConversation(conversation);
    });

    listen('regular-conversation.delete', (conversation: Hashmap) => {
      removeRegularConversation(conversation);
    });

    listen('archived-conversation.add', (conversation: Hashmap) => {
      addArchivedConversation(conversation);
    });

    listen('archived-conversation.delete', (conversation: Hashmap) => {
      removeArchivedConversation(conversation);
    });

    listen('mark-as-read', (conversation: Hashmap) => {
      markConversationAsRead(conversation);
    });

    listen('mark-as-unread', (conversation: Hashmap) => {
      markConversationAsUnread(conversation, false);
    });

    listen('mark-as-unread.modified', (conversation: Hashmap) => {
      markConversationAsUnread(conversation, true);
    });

    listen('message.forward', (messages: Array<Hashmap>) => {
      onMessageForward(messages);
    });

    listen('show.new.group', () => {
      showNewGroupModal();
    });

    const robin = computed(() => store.state.robin as RobinType);
    const userToken = computed(() => store.state.user_token as string);
    const isPageLoading = computed(() => store.state.isPageLoading as boolean);

    const getUserToken = async () => {
      const res = await robin.value.getUserToken({
        user_token: userToken.value
      });

      if (!res.error) {
        for (const conversation of res.data.conversations) {
          conversations.value.push(conversation);
        }

        store.setState(
          'conversations',
          res.data.conversations == null ? [] : res.data.conversations
        );

        for (const conversation of getRegularConversations()) {
          regularConversations.value.push(conversation);
        }

        for (const conversation of getArchivedConversations()) {
          archivedConversations.value.push(conversation);
        }

        store.setState('isPageLoading', false);
        // this.$forceUpdate()
      }
    };

    const onGroupConversation = (conversation: Hashmap) => {
      conversation.participants.every((participant: any) => {
        if (participant.user_token === userToken) {
          regularConversations.value.unshift(conversation);
          return false;
        }

        return true;
      });
    };

    const onNewConversation = (conversation: Hashmap) => {
      if (
        conversation.sender_token === userToken ||
        conversation.receiver_token === userToken
      ) {
        emit('regular-conversation.add', conversation);
      }
    };

    const addRegularConversation = (conversation: Hashmap) => {
      const index = regularConversations.value.findIndex(
        (item: Hashmap) => item._id === conversation._id
      );

      if (index === -1) {
        regularConversations.value.unshift(conversation);
      }
    };

    const removeRegularConversation = (conversation: Hashmap) => {
      const index = regularConversations.value.findIndex(
        (item: Hashmap) => item._id === conversation._id
      );
      regularConversations.value.splice(index, 1);
    };

    const addArchivedConversation = (conversation: Hashmap) => {
      archivedConversations.value.unshift(conversation);
    };

    const removeArchivedConversation = (conversation: Hashmap) => {
      const index = regularConversations.value.findIndex(
        (item: Hashmap) => item._id === conversation._id
      );
      regularConversations.value.splice(index, 1);
    };

    const markConversationAsRead = (conversation: Hashmap) => {
      if (
        !conversation.archived_for ||
        conversation.archived_for.length === 0
      ) {
        const index = regularConversations.value.findIndex(
          (item: Hashmap) => item._id === conversation._id
        );

        if (regularConversations.value[index]) {
          regularConversations.value[index].unread_messages = 0;
        }
      }
    };

    const markConversationAsUnread = (
      conversation: Hashmap,
      isModified: boolean
    ) => {
      if (
        (!conversation.archived_for ||
          conversation.archived_for.length === 0) &&
        !isModified
      ) {
        const index = regularConversations.value.findIndex(
          (item: Hashmap) => item._id === conversation._id
        );

        if (regularConversations.value[index]) {
          regularConversations.value[index].unread_messages += 1;
        }
      }

      if (
        (!conversation.archived_for ||
          conversation.archived_for.length === 0) &&
        isModified
      ) {
        const index = regularConversations.value.findIndex(
          (item: Hashmap) => item._id === conversation._id
        );

        if (regularConversations.value[index]) {
          regularConversations.value[index].unread_messages = 'marked';
        }
      }
    };

    const showNewGroupModal = () => {
      openModal('slide-3', 'newgroupchat');
    };

    const onMessageForward = (messages: Array<Hashmap>) => {
      messages.forEach((msg: any) => {
        conversations.value.forEach((conversation: any, index: any) => {
          if (conversation._id === msg.conversation_id) {
            msg.content.timestamp = new Date();
            conversations.value[index].last_message = msg.content;
            emit('regular-conversation.delete', conversations.value[index]);
            emit('regular-conversation.add', conversations.value[index]);
          }
        });
      });
    };

    const getRegularConversations = () => {
      const regularConversations = conversations.value.filter((user: any) => {
        if (!user.archived_for || user.archived_for.length === 0) return true;
        return !user.archived_for.includes(userToken);
      });

      return addUnreadMessagesToConversation(regularConversations);
    };

    const getArchivedConversations = (): Array<any> => {
      return conversations.value.filter((user: any) => {
        if (!user.archived_for) return false;
        return user.archived_for.includes(userToken);
      });
    };

    const addUnreadMessagesToConversation = (
      conversations: Array<Hashmap>
    ): Array<Hashmap> => {
      const data = conversations.map((conversation: any) => {
        for (const key in conversation.unread_messages) {
          conversation.unread_messages =
            conversation.unread_messages[key].unread_count;
        }

        return conversation;
      });

      return data;
    };

    const getConversationMessages = async (
      id: string
    ): Promise<Array<Hashmap>> => {
      const res = await robin.value.getConversationMessages(
        id,
        userToken.value
      );

      if (res && !res.error) {
        return res.data;
      } else {
        // toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }

      return [];
    };

    const openModal = (refKey: string, type: string): void => {
      if (type === 'primary') {
        sideBarType.value = type;
      } else {
        let slide: any;

        if (refKey === 'slide1') slide = slides.slide1;
        if (refKey === 'slide2') slide = slides.slide2;
        if (refKey === 'slide3') slide = slides.slide3;
        if (refKey === 'slide4') slide = slides.slide4;

        window.setTimeout(() => {
          slide?.value.popUpBody.classList('robin-slideInLeft');

          sideBarType.value = type;
        }, 200);
      }
    };

    const closeModal = (refKey: string = 'slide-1', type: string): void => {
      if (type === 'primary' && refKey === 'slide0') {
        sideBarType.value = type;
        resetGroupName();
      } else {
        let slide: any;

        if (refKey === 'slide1') slide = slides.slide1;
        if (refKey === 'slide2') slide = slides.slide2;
        if (refKey === 'slide3') slide = slides.slide3;
        if (refKey === 'slide4') slide = slides.slide4;

        slide?.value.popUpBody.classList.add('robin-slideOutLeft');

        window.setTimeout(() => {
          slide?.value.popUpBody.classList.remove('robin-slideOutLeft');

          sideBarType.value = type;
        }, 200);
      }
    };

    const setGroupIcon = (val: string) => {
      groupIcon.value = val;
    };

    const resetGroupIcon = () => {
      groupIcon.value = reactive({});
    };

    const resetGroupName = () => {
      groupName.value = '';
    };

    const refresh = (): void => {
      key.value += 1;
    };

    const searchedData = (event: any): void => {
      searchText.value = event.text.trim();

      if (event.text.trim() !== '') {
        regularConversations.value = event.data;
      } else {
        regularConversations.value = getRegularConversations();
        refresh();
      }
    };

    getUserToken();

    return {
      slots,
      key,
      sideBarType,
      conversations,
      regularConversations,
      archivedConversations,
      isPageLoading,
      searchedData,
      openModal,
      closeModal,
      refresh
    };
  },
  render() {
    return (
      <div class="robin-side-bar robin-fadeIn">
        <PrimaryChatList
          key={this.key}
          onSearch={(event: Event) => this.searchedData(event)}
          onOpenNewchatModal={(event: string) =>
            this.openModal('slide-1', event)
          }
          onOpenArchivedchatModal={(event: string) =>
            this.openModal('slide-3', event)
          }
          regular-conversations={this.regularConversations}
          archived-conversations={this.archivedConversations}
        >
          {{
            chatListHeader: () => this.slots['chat-list-header']?.()
          }}
        </PrimaryChatList>

        <NewChatList
          key={this.key + 1}
          v-show={this.sideBarType === 'newchat'}
          onOpenModal={(event: string) => this.openModal('slide-2', event)}
          onCloseModal={(event: string) => this.closeModal('slide-1', event)}
        ></NewChatList>
      </div>
    );
  }
});
</script>
