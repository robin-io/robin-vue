<script lang="tsx">
import {
  defineComponent,
  ref,
  reactive,
  onMounted,
  nextTick,
  computed,
  watch
} from 'vue-demi';
import mime from 'mime';
import localForage from 'localforage';
import store from '@/store/index';
import useEmitter from '@/utilities/index';
import { RobinType, Hashmap } from '@/utilities/types';
import { VueClickaway } from '@/package-compatibility';
import ChatHeader from '../ChatHeader/ChatHeader.vue';
import MessageContent from '../MessageContent/MessageContent.vue';
import Content from '../Content/Content.vue';
import MessageInputBar from '../MessageInputBar/MessageInputBar.vue';
import Button from '../Button/Button.vue';
import Camera from '../Camera/Camera.vue';
import ForwardMessage from '../ForwardMessage/ForwardMessage.vue';
import Prompt from '../Prompt/Prompt.vue';

import 'MessageContainer.css';

export default defineComponent({
  name: 'MessageContainer',
  mixins: [VueClickaway],
  setup() {
    onMounted(() => {
      nextTick(function () {
        onResize();
      });
      window.addEventListener('resize', onResize);
    });

    const robin = computed(() => {
      return store.state.robin as RobinType;
    });

    const userToken = computed(() => {
      return store.state.user_token as string;
    });

    const robinUsers = computed(() => {
      return store.state.robin_users as Array<Hashmap>;
    });

    const conversations = computed(() => {
      return store.state.conversations as Array<Hashmap>;
    });

    const groupnameColors = computed(() => {
      const colors: string[] = [
        '#F8863D',
        '#18C583',
        '#FF0000',
        '#0F0FFE',
        '#9B2226',
        '#AE2012',
        '#BB3E03',
        '#CA6702',
        '#7F5539',
        '#606C38',
        '#283618',
        '#03045E',
        '#370617',
        '#6A040F',
        '#EE9B00',
        '#0A9396',
        '#005F73',
        '#0AFF99',
        '#9D4EDD',
        '#7400B8',
        '#6B705C',
        '#CB997E',
        '#A4133C',
        '#38B000',
        '#14213D',
        '#007200',
        '#7209B7',
        '#3D405B',
        '#8338EC',
        '#3A86FF',
        '#5A189A',
        '#3C096C',
        '#BBC4DF'
      ];
      const userColors = {} as Hashmap;

      for (const user of robinUsers.value) {
        userColors[user.userToken] =
          colors[Math.floor(Math.random() * colors.length)];
      }

      return userColors;
    });

    const currentConversation = computed(() => {
      return store.state.currentConversation;
    });

    const selectMessagesOpen = computed(() => {
      return store.state.selectMessagesOpen;
    });

    const isForwardMessagesEnabled = computed(() => {
      return store.state.forwardMessagesEnabled;
    });

    const clearMessages = computed(() => {
      return store.state.clearMessages;
    });

    const exitGroup = computed(() => {
      return store.state.exitGroup;
    });

    const imagePreviewOpen = computed(() => {
      return store.state.imagePreviewOpen;
    });

    const imagesToPreview = computed(() => {
      return store.state.imagesToPreview;
    });

    const imageSelected = computed(() => {
      return store.state.imageSelected;
    });

    const isImageReplying = computed(() => {
      return store.state.isImageReplying;
    });

    const participantToken = computed(() => {
      return store.state.participantToken;
    });

    const removeParticipant = computed(() => {
      return store.state.removeParticipant;
    });

    const getRegularConversations = () => {
      const regularConversations = conversations.value.filter((user: any) => {
        if (!user.archived_for || user.archived_for.length === 0) return true;
        return !user.archived_for.includes(userToken);
      });

      return addUnreadMessagesToConversation(regularConversations);
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

    const handleConversationOpen = (): void => {
      listen('conversation-opened', (conversation: any) => {
        getOfflineMessages();

        messageReply.value = {};
        messages.value = [];
        currentPage.value = 0;
        totalPages.value = 0;
        newConversationOpenCount.value += 1;
        conversation.value = conversation || {};

        store.setState('currentConversation', conversation);

        scroll.value = false;
        scrollUp.value = false;

        isMessagesLoading.value = true;

        emit('mark-as-read', conversation);
        store.setState('messageViewProfileOpen', false);

        getConversationMessages().then(() => {
          if (!messageError.value) {
            isMessagesLoading.value = false;
          }
        });
      });
    };

    const initializeReadReceipts = async (
      messageIds: Array<string>
    ): Promise<void> => {
      const res = await robin.value.sendReadReceipts(
        messageIds,
        conversation._id,
        userToken.value
      );

      if (res.error) {
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    const getReadReceipts = () => {
      listen('read.reciept', (message: Hashmap) => {
        readReceipts.value.push(message.message_ids);
      });
    };

    const handleUserConnect = () => {
      listen('user.connect', (conversation: string) => {
        refresh();
      });
    };

    const handleUserDisconnect = () => {
      listen('user.disconnect', (conversation: string) => {
        refresh();
      });
    };

    const refresh = () => {
      key.value += 1;
    };

    const onNewMessage = () => {
      listen('new-pseudo-message', (message: any) => {
        console.log(message);
        if (message.conversation_id === conversation.value._id) {
          messages.value.push(message);

          if (offlineMessages.value.messages[message.conversation_id]) {
            offlineMessages.value.messages[message.conversation_id].push(
              message
            );
          }

          scrollToBottom();
        }

        conversations.value.forEach((conversation: Hashmap, index: number) => {
          if (conversation._id === message.conversation_id) {
            conversations.value[index].updated_at = message.content.timestamp;
            conversations.value[index].last_message = message.content;

            const newConv = conversations.value[index];

            if (!newConv.archived_for || newConv.archived_for.length === 0) {
              emit('search-text.reset');
              emit('regular-conversation.delete', newConv);
              emit('regular-conversation.add', newConv);
            } else {
              emit('archived-conversation.delete', newConv);
              emit('archived-conversation.add', newConv);
            }
          }
        });
      });

      listen('new-message', (message: any) => {
        if (message.conversation_id === conversation._id) {
          const messageIndex = messages.value.findIndex(
            (item: Record<string, any>) =>
              item.pseudo && item.content.msg === message.content.msg
          );

          // check if message already exists.
          if (messageIndex !== -1) {
            messages.value[messageIndex] = message;
          } else {
            messages.value.push(message);
          }

          if (offlineMessages.value.messages[message.conversation_id]) {
            const offlineMessageIndex = offlineMessages.value.messages[
              message.conversation_id
            ].findIndex(
              (item: Record<string, any>) =>
                item.pseudo && item.content.msg === message.content.msg
            );

            console.log(offlineMessageIndex);

            // check if offline message already exists.
            if (offlineMessageIndex !== -1) {
              offlineMessages.value.messages[message.conversation_id][
                offlineMessageIndex
              ] = message;
            } else {
              offlineMessages.value.messages[message.conversation_id].push(
                message
              );
            }

            refresh();
          }

          scrollToBottom();

          if (message.sender_token !== userToken) {
            const messageIds = [messages.value[messages.value.length - 1]._id];
            initializeReadReceipts(messageIds);
          }
        }
        if (message.conversation_id !== currentConversation.value._id) {
          const index = getRegularConversations().findIndex(
            (item) => item._id === message.conversation_id
          );

          emit('mark-as-unread', getRegularConversations()[index]);
        }
        conversations.value.forEach((conversation: Hashmap, index: number) => {
          if (conversation._id === message.conversation_id) {
            conversations.value[index].updated_at = message.content.timestamp;
            conversations.value[index].last_message = message.content;

            const newConv = conversations.value[index];

            if (!newConv.archived_for || newConv.archived_for.length === 0) {
              emit('search-text.reset');
              emit('regular-conversation.delete', newConv);
              emit('regular-conversation.add', newConv);
            } else {
              emit('archived-conversation.delete', newConv);
              emit('archived-conversation.add', newConv);
            }
          }
        });
      });
    };

    const onMessageDelete = () => {
      listen('message-deleted', (message: any) => {
        const index = messages.value.findIndex(
          (item: any) => item._id === message._id
        ) as number;
        const offlineMessageIndex = offlineMessages.value.messages[
          conversation._id
        ].findIndex((item: any) => item._id === message._id) as number;

        messages.value[index].is_deleted = true;
        offlineMessages.value.messages[conversation._id][
          offlineMessageIndex
        ].is_deleted = true;
        // this.$forceUpdate()
      });
    };

    const onImageDelete = () => {
      listen('image-deleted', (message: any) => {
        // (message)
        const messageIndex = messages.value.findIndex((item: any) => {
          if (Array.isArray(item))
            return item.some((image) => image._id === message._id);
          return false;
        }) as number;

        const offlineMessageIndex = offlineMessages.value.messages[
          conversation._id
        ].findIndex((item: any) => {
          if (Array.isArray(item))
            return item.some((image) => image._id === message._id);
          return false;
        }) as number;

        if (messageIndex >= 0) {
          // Delete message from image grid.
          const index = messages.value[messageIndex].findIndex(
            (item: any) => item._id === message._id
          ) as number;
          messages.value[messageIndex][index].is_deleted = true;
          // this.$forceUpdate()
        }

        if (messageIndex === -1) {
          // Delete message from message list.
          emit('message-deleted', message);
        }

        if (offlineMessageIndex >= 0) {
          // Delete message from image grid.
          const index = offlineMessages.value.messages[conversation._id][
            offlineMessageIndex
          ].findIndex((item: any) => item._id === message._id) as number;
          offlineMessages.value.messages[conversation._id][offlineMessageIndex][
            index
          ].is_deleted = true;
          // this.$forceUpdate()
        }

        if (offlineMessageIndex === -1) {
          // Delete message from message list.
          emit('message-deleted', message);
        }

        emit('messages.get', messages.value);
      });
    };

    const handleReadReceipts = (data: any) => {
      const filterMessage = data
        ? data.filter(
            (item: any) =>
              !item.is_read && item.sender_token !== userToken.value
          )
        : [];
      const messageIds = filterMessage.map((item: any) => item._id);

      if (messageIds.length > 0) {
        initializeReadReceipts(messageIds);
      }
    };

    const getConversationMessages = async (): Promise<void> => {
      const res = await robin.value.getConversationMessages(
        conversation._id,
        userToken.value
      );

      if (res && !res.error) {
        messageError.value = false;
        testMessages(res.data ? res.data : []);

        currentPage.value =
          messages.value.length > 20 ? messages.value.length - 20 : 0;

        if (!offlineMessages.value.messages[conversation._id]) {
          offlineMessages.value.messages[conversation._id] = [
            ...messages.value.slice(currentPage.value, messages.value.length)
          ];
        }

        if (messages.value.length > 19) {
          setOfflineMessages(
            messages.value.slice(currentPage.value, messages.value.length)
          );
        } else {
          setOfflineMessages(messages.value.slice(0, messages.value.length));
        }

        handleReadReceipts(res.data);
      } else {
        messageError.value = true;
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }

      scrollToBottom();
    };

    const loadMoreMessages = () => {
      const messageElement = message.value as HTMLElement;

      isMessagesLoading.value = true;

      setTimeout(() => {
        isMessagesLoading.value = false;
        currentPage.value -= 20;

        const lastPage =
          messages.value.length -
          (messages.value.length - currentPage.value) +
          20;
        const paginatedMessages = messages.value.slice(
          currentPage.value < 20 ? 0 : currentPage.value,
          lastPage
        );

        for (let i = paginatedMessages.length - 1; i >= 0; i--) {
          offlineMessages.value.messages[conversation._id].unshift(
            paginatedMessages[i]
          );
        }

        messageElement.scrollTop = 160;
      }, 500);
    };

    const scrollToBottom = (): void => {
      window.setTimeout(() => {
        const messageElement = message.value as HTMLElement;
        if (messageElement) {
          messageElement.scrollTop = messageElement.scrollHeight + 100;
          scrollUp.value = false;
        }
      }, 100);
    };

    const openCamera = (): void => {
      popUpState.cameraOpened = true;
    };

    const closeCamera = (): void => {
      const popup = cameraPopUp as any;
      popup.popUpBody.classList.remove('robin-squeezeOut');
      popup.popUpBody.classList.add('robin-squeezeIn');

      window.setTimeout(() => {
        popup.popUpBody.classList.remove('robin-squeezeIn');
        popup.popUpBody.classList.add('robin-squeezeOut');

        popUpState.cameraOpened = false;
      }, 100);
    };

    const openImagePreview = (event: Hashmap): void => {
      store.setState('imagePreviewOpen', true);
      store.setState('imagesToPreview', event);
    };

    const openMessagePopup = (val: number): void => {
      messagePopUpIndex.value = val;
      popUpState.messagePopUp[messagePopUpIndex.value].opened = true;
    };

    const closeMessagePopup = (event: any): void => {
      popUpState.messagePopUp[messagePopUpIndex.value].opened = false;
      messagePopUpIndex.value = 0;
    };

    const getMessagePopup = (index: any): Hashmap => {
      return popUpState.messagePopUp[parseInt(index)];
    };

    const handleCapturedImage = (val: Hashmap): void => {
      capturedImage.value = val;
    };

    const checkAttachmentType = (attachmentUrl: String): string => {
      const strArr = attachmentUrl.split('.');
      return `${mime.getType(strArr[strArr.length - 1])}`;
    };

    const testMessages = (messageResponse: Array<Hashmap>): void => {
      const newMessages = [];
      let temp = [] as any;

      for (let index = 0; index < messageResponse.length; index += 1) {
        const fileMimeType = checkAttachmentType(
          messageResponse[index].content.attachment || ''
        ) as any;
        const isImage = imageRegex.test(
          fileMimeType &&
            (!messageResponse[index].content.msg ||
              messageResponse[index].content.msg === 'undefined')
            ? fileMimeType
            : ''
        ) as any;

        const nextFileMimeType = checkAttachmentType(
          messageResponse[index + 1]
            ? messageResponse[index + 1].content.attachment || ''
            : ''
        ) as any;
        const isImageNext = imageRegex.test(
          messageResponse[index + 1]
            ? nextFileMimeType &&
              (!messageResponse[index + 1].content.msg ||
                messageResponse[index + 1].content.msg === 'undefined')
              ? nextFileMimeType
              : ''
            : ''
        ) as any;

        if (isImage) {
          temp.push(messageResponse[index]);
        }

        if (temp.length > 1) {
          if (!Array.isArray(newMessages[newMessages.length - 1])) {
            newMessages[newMessages.length] = temp;
          }
        }

        if (!isImageNext || !isImage) {
          // eslint-disable-next-line
          if (Array.isArray(newMessages[newMessages.length - 1]) && isImage) {
          } else {
            temp = [];
            newMessages.push(messageResponse[index]);
          }
        }
      }

      messages.value = newMessages;
    };

    const clearAllMessages = async (): Promise<void> => {
      const id = [] as Array<any>;

      for (let i: number = 0; i < messages.value.length; i += 1) {
        if (Array.isArray(messages.value[i])) {
          messages.value[i].forEach((item: { _id: any }) => {
            id.push(item._id);
          });
        }

        if (!Array.isArray(messages.value[i])) {
          id.push(messages.value[i]._id);
        }
      }

      const res = await robin.value.deleteMessages([...id], userToken.value);
      if (res && !res.error) {
        // this.$toast.open({
        //   message: 'Messages Deleted.',
        //   type: 'success',
        //   position: 'bottom-left'
        // })
        promptOpen.value = false;
        getConversationMessages().then(() => {
          scrollToBottom();
        });
      } else {
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }

      store.setState('clearMessages', false);
    };

    const onScroll = (): void => {
      handleScrollUp();

      scroll.value = true;
    };

    const handleScrollUp = () => {
      const messageElement = message.value as HTMLElement;
      const endOfScroll =
        Math.floor(messageElement.scrollTop) >
        Math.floor(
          messageElement.scrollHeight - messageElement.clientHeight - 20
        );

      if (endOfScroll) {
        scrollUp.value = false;
      }

      if (messageElement.scrollTop + 10 <= lastScroll.value) {
        if (!isMessagesLoading.value) {
          scrollUp.value = true;
        }
      }

      if (
        messageElement.scrollTop === 0 &&
        offlineMessages.value.length !== messages.value.length &&
        currentPage.value > 19
      ) {
        loadMoreMessages();
      }

      lastScroll.value =
        messageElement.scrollTop <= 0 ? 0 : messageElement.scrollTop;
    };

    const toggleCheckAction = (val: boolean, message: any): void => {
      if (!val) {
        selectMessage(message);
      } else {
        removeSelectedMessage(message);
      }
    };

    const selectMessage = (message: any): void => {
      if (Array.isArray(message)) {
        message.forEach((item: Hashmap) => {
          selectedMessages.value.push(item);
        });
      } else {
        selectedMessages.value.push(message);
      }
    };

    const removeSelectedMessage = (message: any): void => {
      const index = selectedMessages.value.findIndex(
        (item) => item._id === message._id
      );

      selectedMessages.value.splice(index, 1);
    };

    const onChatClickAway = (): void => {
      store.setState('selectMessagesOpen', false);
    };

    const onCloseForwardMessagePopup = (): void => {
      forwardMessage.value = false;
      store.setState('selectMessagesOpen', false);
      uncheck.value = true;
    };

    const replyMessage = (message: any): void => {
      messageReply.value = { ...message };
    };

    const onCloseReply = (): void => {
      messageReply.value = {};
    };

    const deleteSelectedMessages = async () => {
      const res = await robin.value.deleteMessages(
        selectedMessages.value.map((message: Hashmap) => message._id),
        userToken.value
      );

      if (res && !res.error) {
        selectedMessages.value.forEach((message) =>
          emit('message-deleted', message)
        );

        selectedMessages.value = [];
        store.setState('selectMessagesOpen', false);
        uncheck.value = true;
        promptOpen.value = false;
        refresh();

        // this.$toast.open({
        //   message: this.selectedMessages.length > 0 ? 'Messages Deleted.' : 'Message Deleted.',
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

    const handleRemoveParticipant = async () => {
      const res = await robin.value.removeGroupParticipant(
        currentConversation.value._id,
        participantToken.value
      );

      if (!res || res.error) {
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    const openPrompt = (status: string) => {
      promptOpen.value = true;

      promptStatus.value = status;
    };

    const closePrompt = () => {
      promptOpen.value = false;
      store.setState('selectMessagesOpen', false);
      store.setState('clearMessages', false);
      store.setState('exitGroup', false);
      store.setState('removeParticipant', false);
    };

    const scrollToRepliedMessage = (event: string): void => {
      const messageIndex: number = offlineMessages.value.messages[
        conversation._id
      ].findIndex((element: any) => {
        if (Array.isArray(element)) {
          return element.find((item) => item._id === event);
        }

        if (!Array.isArray(element)) {
          if (element._id === event) {
            return element;
          }
        }

        return false;
      });
      // TODO: Test reply scrollIntoView.
      const messagePopUp = messagePopUps.value[messageIndex];
      console.log(messagePopUp);
      messagePopUp.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    const onResize = () => {
      scrollUp.value = false;
      windowHeight.value = window.innerHeight;
    };

    const handleLeaveGroup = async () => {
      const res = await robin.value.removeGroupParticipant(
        conversation.value._id,
        userToken.value
      );

      if (res && !res.error) {
        // this.$toast.open({
        //   message: 'You left group',
        //   type: 'success',
        //   position: 'bottom-left'
        // })

        emit('regular-conversation.delete', conversation);
        emit('close-conversation');

        store.setState('exitGroup', false);
      } else {
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    const proceed = () => {
      if (promptStatus.value === 'delete select' && selectMessagesOpen.value) {
        deleteSelectedMessages();
      }
      if (promptStatus.value === 'clear messages' && clearMessages.value) {
        clearAllMessages();
      }
      if (promptStatus.value === 'exit group' && exitGroup.value) {
        handleLeaveGroup();
      }
      if (
        promptStatus.value === 'remove participant' &&
        removeParticipant.value
      ) {
        handleRemoveParticipant();
      }
    };

    const getOfflineMessages = async (): Promise<void> => {
      try {
        const value = (await localForage.getItem('messages')) as Array<any>;
        offlineMessages.value = value ? { ...value } : { messages: {} };
      } catch (error) {
        console.error(error);
      }
    };

    const setOfflineMessages = async (
      messages: Array<Hashmap>
    ): Promise<void> => {
      try {
        const data = { messages: { [conversation._id]: messages } } as any;

        for (const item in offlineMessages.value.messages) {
          if (!data.messages[item]) {
            data.messages[item] = offlineMessages.value.messages[item];
          }
        }

        await localForage.setItem('messages', data);
        await getOfflineMessages();
      } catch (error) {
        console.error(error);
      }
    };

    const onForwardMessage = () => {
      forwardMessage.value = true;
    };

    const cameraPopUp = ref();
    const messagePopUps = ref([] as HTMLElement[]);
    const message = ref();
    const promptOpen = ref(false);
    const promptStatus = ref('');
    const uncheck = ref(false);
    const windowHeight = ref(0);
    const readReceipts = ref([] as Array<string>);
    const selectedMessages = ref([] as Array<Hashmap>);
    const forwardMessage = ref(false);
    const conversation = reactive({} as Hashmap);
    const messages = ref([] as Array<Hashmap>);
    const capturedImage = ref(null as null | Hashmap);
    const scroll = ref(false);
    const scrollUp = ref(false);
    const lastScroll = ref(0);
    const popUpState = reactive({
      cameraOpened: false,
      messagePopUp: [] as Array<any>
    });
    const offlineMessages = ref({ messages: {} } as Hashmap);
    const messageReply = ref({} as Hashmap);
    const messageError = ref(false);
    const isMessagesLoading = ref(true);
    const messagePopUpIndex = ref(0);
    const key = ref(0);
    const newConversationOpenCount = ref(0);
    const currentPage = ref(0);
    const totalPages = ref(0);

    const imageRegex = /^image/;
    const { emit, listen } = useEmitter();

    watch(
      [
        messages,
        offlineMessages,
        selectMessagesOpen,
        clearMessages,
        exitGroup,
        removeParticipant,
        isImageReplying
      ],
      ([
        newMessages,
        newOfflineMessages,
        isSelectMessagesOpen,
        clearedMessages,
        exitedGroup,
        removedParticipant,
        imageReplied
      ]) => {
        if (newMessages) {
          popUpState.messagePopUp = [];
          [...messages.value].forEach((val) => {
            popUpState.messagePopUp.push({
              opened: false,
              _id: val._id
            });
          });

          emit('messages.get', messages.value);
        }

        if (newOfflineMessages) {
          popUpState.messagePopUp = [];
          const data = offlineMessages.value.messages[
            conversation._id
          ] as Array<Hashmap>;

          if (data) {
            data.forEach((val: any) => {
              popUpState.messagePopUp.push({
                opened: false,
                _id: val._id
              });
            });

            emit('messages.get', [...data]);
          }
        }

        if (!isSelectMessagesOpen) {
          selectedMessages.value = [];
          uncheck.value = true;
          closePrompt();
        }

        if (isSelectMessagesOpen) {
          uncheck.value = false;
        }

        if (clearMessages.value && clearedMessages) {
          openPrompt('clear messages');
        }

        if (!clearMessages.value && !clearedMessages) {
          closePrompt();
        }

        if (exitGroup && exitedGroup) {
          openPrompt('exit group');
        }

        if (!exitGroup && !exitedGroup) {
          closePrompt();
        }

        if (removedParticipant) {
          openPrompt('remove participant');
        } else {
          closePrompt();
        }

        if (imageReplied) {
          messageReply.value = imagesToPreview.value[imageSelected.value];
        }
      }
    );

    const bindMessagePopUpsToState = ((element: HTMLElement) => {
      messagePopUps.value.push(element);
    }) as any;

    handleConversationOpen();
    onNewMessage();
    onMessageDelete();
    onImageDelete();
    handleUserConnect();
    handleUserDisconnect();
    getReadReceipts();

    return {
      conversation,
      selectedMessages,
      groupnameColors,
      isMessagesLoading,
      currentPage,
      offlineMessages,
      scroll,
      scrollUp,
      readReceipts,
      forwardMessage,
      message,
      messages,
      cameraPopUp,
      newConversationOpenCount,
      bindMessagePopUpsToState,
      messageReply,
      isForwardMessagesEnabled,
      selectMessagesOpen,
      capturedImage,
      popUpState,
      openPrompt,
      openCamera,
      scrollToBottom,
      openImagePreview,
      onCloseForwardMessagePopup,
      replyMessage,
      getMessagePopup,
      closeCamera,
      closePrompt,
      proceed,
      onForwardMessage,
      onCloseReply,
      toggleCheckAction,
      handleCapturedImage,
      scrollToRepliedMessage,
      onScroll
    };
  },
  render() {
    return (
      <div class="robin-message-container" v-on-clickaway="onChatClickAway">
        <ChatHeader
          conversation={this.conversation}
          key={this.key}
          selected-messages={this.selectedMessages}
          onDeleteSelectedMessages={() => this.openPrompt('delete select')}
        />

        <div
          class="robin-wrapper robin-flex robin-flex-column robin-flex-space-between"
          id="message-container"
          ref={this.message}
          onScroll={() => this.onScroll()}
          data-testid="message"
        >
          {(this.isMessagesLoading && this.currentPage > 0) ||
          (!this.offlineMessages.messages[this.conversation._id] &&
            this.isMessagesLoading) ? (
            <div
              class="robin-inner-wrapper-loader robin-flex robin-flex-align-center"
              id="infinite-loader"
            >
              <div class="robin-spinner"></div>
            </div>
          ) : (
            ''
          )}

          {this.offlineMessages.messages[this.conversation._id] ? (
            <div class="robin-inner-wrapper-offline">
              {this.offlineMessages.messages[this.conversation._id].map(
                (message: any, index: number) => {
                  <MessageContent
                    ref={this.bindMessagePopUpsToState}
                    groupname-colors={this.groupnameColors}
                    uncheck={this.uncheck}
                    onOpenPreview={(event: Hashmap) =>
                      this.openImagePreview(event)
                    }
                    key={`message-${String(index + this.key)}`}
                    v-show={!message.is_deleted}
                    message={message}
                    conversation={this.conversation}
                    message-pop-up={this.getMessagePopup(index)}
                    messages={
                      this.offlineMessages.messages[this.conversation._id]
                    }
                    stored-messages={this.messages}
                    index={index}
                    scroll={this.scroll}
                    last-id={
                      !Array.isArray(message) &&
                      this.messages.length - 3 < parseInt(String(index))
                        ? message._id
                        : ''
                    }
                    read-receipts={this.readReceipts}
                    onToggleCheckAction={(event: boolean) =>
                      this.toggleCheckAction(event, message)
                    }
                    onReplyMessage={(event: Hashmap) =>
                      this.replyMessage(event)
                    }
                    onForwardMessage={() => this.onForwardMessage()}
                    onScrollRepliedMessage={(event: string) =>
                      this.scrollToRepliedMessage(event)
                    }
                  />;
                }
              )}
            </div>
          ) : (
            ''
          )}

          {this.scrollUp && this.scroll ? (
            <div
              class="robin-scroll-to-bottom robin-bounceIn"
              onClick={() => this.scrollToBottom()}
              data-testid="scroll-bottom-button"
            >
              <i class="robin-material-icon"> arrow_downward </i>
            </div>
          ) : (
            ''
          )}
        </div>

        <MessageInputBar
          conversation={this.conversation}
          key={'input-' + this.newConversationOpenCount}
          message-reply={this.messageReply}
          onOpenCamera={() => this.openCamera()}
          captured-image={this.capturedImage}
          onCloseReply={() => this.onCloseReply()}
          v-show={!this.selectMessagesOpen || !this.isForwardMessagesEnabled}
        />

        {this.selectMessagesOpen && this.isForwardMessagesEnabled ? (
          <div class="robin-forward-tab">
            <Content color="#51545C">
              {' '}
              {() => `${this.selectedMessages.length} Messages Selected`}{' '}
            </Content>
            <Button
              emit="forward-message"
              v-show="selectedMessages.length > 0"
              onForwardMessage={() => this.onForwardMessage()}
            >
              {() => 'Forward Messages'}
            </Button>
          </div>
        ) : (
          ''
        )}

        <Camera
          ref={this.cameraPopUp}
          camera-opened={this.popUpState.cameraOpened}
          onClose={() => this.closeCamera()}
          onCapturedImage={(event: Hashmap) => this.handleCapturedImage(event)}
          v-show={this.popUpState.cameraOpened}
        />
        {this.forwardMessage == true ? (
          <ForwardMessage
            onCloseModal={() => this.onCloseForwardMessagePopup()}
            selected-messages={this.selectedMessages}
          />
        ) : (
          ''
        )}
        <Prompt
          status={this.promptStatus}
          onProceed={this.proceed()}
          v-show={this.promptOpen}
          onCloseModal={() => this.closePrompt()}
        />
      </div>
    );
  }
});
</script>
