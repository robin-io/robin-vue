<script lang="tsx">
import {
  defineComponent,
  PropType,
  watch,
  ref,
  nextTick,
  onMounted,
  computed,
  h
} from 'vue-demi';
import moment from 'moment';
import mime from 'mime';
import { VLazyImage, VueClickaway } from '@/package-compatibility';
import ReplyMessageBubble from '../ReplyMessageBubble/ReplyMessageBubble.vue';
import IconButton from '../IconButton/IconButton.vue';
import Content from '../Content/Content.vue';
import MessageGrid from '../MessageGrid/MessageGrid.vue';
import MessagePopOver from '../MessagePopOver/MessagePopOver.vue';
import ReactionPopOver from '../ReactionPopOver/ReactionPopOver.vue';
import CheckBox from '../CheckBox/CheckBox.vue';
import AudioPlayer from '../AudioPlayer/AudioPlayer.vue';
import SvgIcon from '../SvgIcon/SvgIcon.vue';
import store from '@/store/index';
import { RobinType, Hashmap } from '@/utilities/types';
import useEmitter from '@/utilities/index';
import assets from '@/asset-url.json';

import './MessageContent.css';

export default defineComponent({
  name: 'MessageContent',
  mixins: [VueClickaway],
  props: {
    message: {
      type: [Object, Array] as PropType<Hashmap> | PropType<Array<Hashmap>>,
      default: () => {}
    },
    index: {
      type: Number,
      default: 0
    },
    groupnameColors: {
      type: Object,
      default: () => {}
    },
    messages: {
      type: Array as PropType<Array<any>>,
      default: () => []
    },
    storedMessages: {
      type: Array,
      default: () => []
    },
    conversation: {
      type: Object,
      default: () => {}
    },
    messagePopUp: {
      type: Object,
      default: () => ({
        opened: false,
        _id: ''
      })
    },
    lastId: {
      type: String as PropType<string>,
      default: ''
    },
    scroll: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    readReceipts: {
      type: Array as PropType<Array<string>>,
      default: () => []
    },
    uncheck: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  setup(props, context) {
    const checkbox = ref();
    const popUps = ref([] as any);
    const messagesProps = ref(props.messages as Array<Hashmap>);
    const messageProps = ref(props.message);
    const messagePopUpProps = ref(props.messagePopUp);
    const messageBody = ref();
    const uncheck = ref(props.uncheck);
    const caretOpen = ref(false);
    const screenWidth = ref(0);
    const files = ref([]);
    const leaveGroupActivity = ref([] as Array<string>);
    const reactions = ref({
      '❤️': [] as Array<Hashmap>,
      '👍': [] as Array<Hashmap>,
      '👎': [] as Array<Hashmap>,
      '😂': [] as Array<Hashmap>,
      '⁉️': [] as Array<Hashmap>
    });
    const videoPlayer = ref(null as null | HTMLElement);
    const pseudoAttachmentUrl = ref('');
    const imageRegex = /^image/;
    const videoRegex = /^video/;
    const documentRegex =
      /^application\/(csv|pdf|msword|(vnd\.(ms-|openxmlformats-).*))$|^text\/plain$|^audio\/(mpeg|mp4|x-ogg|x-wav|x-flac|x-aac|x-ms-wma)$/i;
    const audioRegex = /^audio\/(mpeg|mp4|x-ogg|x-wav|x-flac|x-aac|x-ms-wma)$/i;
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const websiteRegex =
      /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
    const { listen } = useEmitter();

    const selectMessagesOpen = computed(() => {
      return store.state.selectMessagesOpen;
    });

    const userToken = computed(() => {
      return store.state.user_token;
    });

    const robin = computed(() => {
      return store.state.robin as RobinType;
    });

    const robinUsers = computed(() => {
      return store.state.robin_users;
    });

    const isReplyMessagesEnabled = computed(() => {
      return store.state.replyMessagesEnabled;
    });

    const isDeleteMessagesEnabled = computed(() => {
      return store.state.deleteMessagesEnabled;
    });

    const isForwardMessagesEnabled = computed(() => {
      return store.state.forwardMessagesEnabled;
    });

    const isMessageReactionViewEnabled = computed(() => {
      return store.state.messageReactionViewEnabled;
    });

    const isMessageReactionDeleteEnabled = computed(() => {
      return store.state.messageReactionDeleteEnabled;
    });

    watch([uncheck, messagesProps], ([isUnchecked, newMessages]) => {
      if (isUnchecked) {
        const checkboxElement = checkbox.value as any;
        checkboxElement.checked = false;
      }

      if (newMessages) {
        leaveGroupActivity.value = [];
        reactions.value = { '❤️': [], '👍': [], '👎': [], '😂': [], '⁉️': [] };
        getMessageReactions();
      }
    });

    onMounted(() => {
      nextTick(function () {
        onResize();
      });
      window.addEventListener('resize', onResize);
      injectHtml(
        messageProps.value.content ? messageProps.value.content.msg : null
      );

      videoPlayer.value = document.getElementById(`video-${props.index}`);

      if (videoPlayer) {
        videoPlayer.value?.addEventListener('play', (event: any) => {
          pauseOtherVideo();
        });
      }

      if (messageProps.value.pseudo) {
        convertFileToBase64(messageProps.value.content.attachment);
      }
    });

    const showDate = () => {
      if (props.index - 1 > -1) {
        const dateA = messagesProps.value[props.index];
        const dateB = messagesProps.value[props.index - 1];

        if (Array.isArray(dateA) && !Array.isArray(dateB)) {
          return (
            moment(dateA[0].created_at).format('YYYY-MM-DD') !==
            moment(dateB.created_at).format('YYYY-MM-DD')
          );
        }

        if (!Array.isArray(dateA) && Array.isArray(dateB)) {
          return (
            moment(dateA.created_at).format('YYYY-MM-DD') !==
            moment(dateB[0].created_at).format('YYYY-MM-DD')
          );
        }

        if (Array.isArray(dateA) && Array.isArray(dateB)) {
          return (
            moment(dateA[0].created_at).format('YYYY-MM-DD') !==
            moment(dateB[0].created_at).format('YYYY-MM-DD')
          );
        }

        return (
          moment(dateA.created_at).format('YYYY-MM-DD') !==
          moment(dateB.created_at).format('YYYY-MM-DD')
        );
      }

      return false;
    };

    const formatTimeStamp = (value: any): string => {
      return moment(value).format('h:mma').toUpperCase();
    };

    const formatDate = (value: any): string => {
      const today = moment().format('MMM DD YYYY');
      const formattedValue = moment(value).format('MMM DD YYYY');

      if (today === formattedValue) return 'Today';

      return moment(value).format('MMM DD YYYY');
    };

    const checkAttachmentType = (attachment: any): string => {
      let strArr = [] as string[];

      if (typeof attachment !== 'string') {
        strArr = attachment.name.split('.');
      } else {
        strArr = attachment.split('.');
      }

      return `${mime.getType(strArr[strArr.length - 1])}`;
    };

    const getFileDetails = (attachment: any): Record<string, any> => {
      let fileName = '';
      let strArr = [] as Array<string>;

      if (typeof attachment !== 'string') {
        strArr = attachment.name.split('.');
      } else {
        fileName = attachment.substring(attachment.lastIndexOf('/') + 1);
        strArr = fileName.split('.') as string[];
      }

      return {
        name: strArr[strArr.length - 2],
        extension: strArr[strArr.length - 1]
      };
    };

    const convertFileToBase64 = async (file: File): Promise<void> => {
      const base64 = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result?.toString() || '');
        reader.onerror = (error) => reject(error);
      });

      pseudoAttachmentUrl.value = await base64;
    };

    const downloadFile = async (attachment: any): Promise<void> => {
      const fileDetails = getFileDetails(attachment) as Record<string, any>;
      const element = document.createElement('a');

      if (typeof attachment !== 'string') {
        element.setAttribute('href', pseudoAttachmentUrl.value);
      } else {
        element.setAttribute('href', attachment);
      }

      element.setAttribute(
        'download',
        fileDetails.name + ' ' + fileDetails.extension
      );
      element.click();
    };

    const openModal = (): void => {
      if (!selectMessagesOpen.value) {
        messagePopUpProps.value.opened = true;
      }
    };

    const closeModal = (): void => {
      const popUpElements = popUps.value;
      for (let i = 0; i < popUpElements.length - 1; i++) {
        if (popUpElements[i]) {
          popUpElements[i].popUpBody.classList.remove('robin-zoomIn');
          popUpElements[i].popUpBody.classList.add('robin-zoomOut');
        }
      }

      window.setTimeout(() => {
        for (let i = 0; i < popUpElements.length - 1; i++) {
          if (popUpElements[i]) {
            popUpElements[i].popUpBody.classList.add('robin-zoomOut');
            popUpElements[i].popUpBody.classList.remove('robin-zoomIn');
          }
        }

        messagePopUpProps.value.opened = false;
      }, 300);
    };

    const openPreview = (event: any): void => {
      context.emit('open-preview', event);
    };

    const checkArrayReceiverUserToken = (message: any) => {
      return message.some(
        (item: { content: { sender_token: string } }) =>
          item.content.sender_token === userToken.value
      );
    };

    const validateMessages = (message: any): string => {
      const nextMessage = messagesProps.value[props.index + 1];

      if (
        Array.isArray(messageProps.value) &&
        checkArrayReceiverUserToken(message) &&
        nextMessage &&
        nextMessage.content.sender_token !== userToken.value
      ) {
        return 'robin-message-receiver robin-w-100 robin-flex-align-end prev';
      }

      if (
        message.content &&
        message.content.sender_token === userToken.value &&
        Array.isArray(nextMessage) &&
        !checkArrayReceiverUserToken(nextMessage)
      ) {
        return 'robin-message-receiver robin-w-100 robin-flex-align-end prev';
      }

      if (
        Array.isArray(messageProps.value) &&
        checkArrayReceiverUserToken(message)
      ) {
        return 'robin-message-receiver robin-w-100 robin-flex-align-end'; // true
      }

      if (message.content && message.content.sender_token === userToken.value) {
        return 'robin-message-receiver robin-w-100 robin-flex-align-end'; // true
      }

      if (
        Array.isArray(messageProps.value) &&
        !checkArrayReceiverUserToken(message) &&
        nextMessage &&
        nextMessage.content.sender_token === userToken.value
      ) {
        return 'robin-message-sender prev';
      }

      if (
        message.content &&
        message.content.sender_token !== userToken.value &&
        Array.isArray(nextMessage) &&
        checkArrayReceiverUserToken(nextMessage)
      ) {
        return 'robin-message-sender prev';
      }

      return 'robin-message-sender'; // false
    };

    const toggleCheckAction = (val: boolean): void => {
      context.emit('toggle-check-action', val);
    };

    const getContactName = (sender_token: string): string => {
      const index = robinUsers.value.findIndex(
        (user: Hashmap) => user.userToken === sender_token
      ) as number;
      const user = robinUsers.value[index] as any;
      return user ? user.userName : '';
    };

    const getReplyMessage = (id: string): Hashmap => {
      const message: any = messagesProps.value.find((element: any) => {
        if (Array.isArray(element)) {
          return element.find((item) => item._id === id);
        }

        if (!Array.isArray(element)) {
          if (element._id === id) {
            return element;
          }
        }

        return false;
      });

      return message;
    };

    const addReaction = async (emoji: string): Promise<void> => {
      const messageObj = Array.isArray(messageProps.value)
        ? messageProps.value[0]
        : messageProps.value;

      await robin.value.reactToMessage(
        emoji,
        props.conversation._id,
        messageObj._id,
        userToken.value
      );
      closeModal();
    };

    const removeReaction = async (reaction: any): Promise<void> => {
      const messageObj = Array.isArray(messageProps.value)
        ? messageProps.value[0]
        : messageProps.value;

      if (isMessageReactionDeleteEnabled.value) {
        await robin.value.RemoveReaction(reaction._id, messageObj._id);
      }
    };

    const onNewReaction = () => {
      listen('message.reaction', (data: Hashmap) => {
        if (!Array.isArray(messageProps.value)) {
          if (!messageProps.value.reactions) messageProps.value.reactions = [];

          if (messageProps.value._id === data.message_id) {
            messageProps.value.reactions.push(data);
            increaseMessageReaction(data.reaction, data);
          }
        } else {
          if (!messageProps.value[0].reactions)
            messageProps.value[0].reactions = [];

          if (messageProps.value[0]._id === data.message_id) {
            messageProps.value[0].reactions.push(messageProps.value);
            increaseMessageReaction(data.reaction, data);
          }
        }
      });
    };

    const getMessageReactions = () => {
      const reactions = Array.isArray(messageProps.value)
        ? messageProps.value[0].reactions
        : messageProps.value.reactions;

      if (reactions) {
        reactions.forEach((data: Hashmap) => {
          increaseMessageReaction(data.reaction, data);
        });
      }
    };

    const increaseMessageReaction = (reaction: string, message: Hashmap) => {
      const reactionExists = reactions.value[
        reaction as keyof typeof reactions.value
      ].some((item: any) => item._id === message._id);

      if (!reactionExists)
        reactions.value[reaction as keyof typeof reactions.value].push(message);
    };

    const reduceMessageReaction = (reaction: string) => {
      reactions.value[reaction as keyof typeof reactions.value].pop();
    };

    const onReactionDelete = () => {
      listen('message.remove.reaction', (data: Hashmap) => {
        if (data.message_id === messageProps.value._id) {
          const reactions = messageProps.value.reactions as Hashmap;

          const reactionIndex = reactions.findIndex(
            (item: any) => item._id === data._id
          );

          if (reactionIndex > -1) {
            reduceMessageReaction(reactions[reactionIndex].reaction);
            reactions.splice(reactionIndex, 1);
            // $forceUpdate()
          }
        }

        if (
          messageProps.value[0] &&
          messageProps.value.message_id === messageProps.value[0]._id
        ) {
          const reactions = messageProps.value[0].reactions as any;

          const reactionIndex = reactions.findIndex(
            (item: any) => item._id === data._id
          );
          if (reactionIndex > -1) {
            reduceMessageReaction(reactions[reactionIndex].reaction);
            reactions.splice(reactionIndex, 1);
            // $forceUpdate()
          }
        }
      });
    };

    const validateLinkInMessage = () => {
      const texts = messageProps.value.content.msg.split(' ');

      return {
        containsWebsite: texts.some((text: string) => websiteRegex.test(text)),
        containsEmail: texts.some((text: string) => emailRegex.test(text))
      };
    };

    const getTextsInMessage = () => {
      return {
        texts: messageProps.value.content.msg.split(' '),
        length: messageProps.value.content.msg.split(' ').length
      };
    };

    const getMessageIndex = () => {
      const message = messagesProps.value[props.index];

      if (Array.isArray(message)) {
        return props.storedMessages.findIndex((item: any) => {
          if (Array.isArray(item)) {
            return item[0]._id === message[0]._id;
          }

          return false;
        });
      }

      return props.storedMessages.findIndex(
        (item: any) => item._id === message._id
      );
    };

    const injectHtml = (message: string): void => {
      let returnedMessage = '';

      if (message) {
        for (const word of message.split(' ')) {
          if (emailRegex.test(word)) {
            returnedMessage += String.raw` <a target="_blank" href="mailto:${word}">${word}<a/>`;
          } else if (websiteRegex.test(word)) {
            if (word.includes('http://') || word.includes('https://')) {
              returnedMessage += String.raw` <a target="_blank" href="${word}">${word}<a/>`;
            } else {
              returnedMessage += String.raw` <a target="_blank" href="http://${word}">${word}<a/>`;
            }
          } else {
            returnedMessage += ` ${word}`;
          }
        }
      }

      const messageElement = messageBody.value;
      if (messageElement) {
        messageElement.innerHTML = returnedMessage;
      }
    };

    const onResize = () => {
      screenWidth.value = window.innerWidth;

      if (screenWidth.value <= 1024) {
        caretOpen.value = true;
      } else {
        caretOpen.value = false;
      }
    };

    const onMouseOver = () => {
      if (!selectMessagesOpen.value) {
        caretOpen.value = true;
      } else {
        caretOpen.value = false;
      }
    };

    const onMouseLeave = () => {
      if (screenWidth.value > 1024) {
        caretOpen.value = false;
      }
    };

    const selectMessage = () => {
      const checkboxElement = checkbox.value;
      checkboxElement.checked = true;
      toggleCheckAction(false);
    };

    const forwardMessage = () => {
      const checkboxElement = checkbox.value;
      checkboxElement.checked = true;
      toggleCheckAction(false);
    };

    const scrollToRepliedMessage = (id: string) => {
      context.emit('scroll-replied-message', id);
    };

    const handleLeaveGroup = () => {
      listen('remove.group.participant', (value: Hashmap) => {
        if (value.participant.user_token === userToken.value) {
          leaveGroupActivity.value.push('You left the group.');
        }

        if (value.participant.user_token !== userToken.value) {
          const userName =
            getContactName(value.participant.user_token) !== ''
              ? getContactName(value.participant.user_token)
              : 'Participant';
          leaveGroupActivity.value.push(
            userName + ' was removed from the group by moderator.'
          );
        }
      });
    };

    const pauseOtherVideo = () => {
      const videoElements = document.querySelectorAll('video');

      videoElements.forEach((video) => {
        if (videoPlayer.value !== video) {
          video.pause();
        }
      });
    };

    onNewReaction();
    onReactionDelete();
    handleLeaveGroup();

    return {
      messageBody,
      messageProps,
      messagesProps,
      checkbox,
      selectMessagesOpen,
      messagePopUpProps,
      isMessageReactionViewEnabled,
      isReplyMessagesEnabled,
      isDeleteMessagesEnabled,
      isForwardMessagesEnabled,
      pseudoAttachmentUrl,
      isMessageReactionDeleteEnabled,
      imageRegex,
      videoRegex,
      documentRegex,
      audioRegex,
      reactions,
      leaveGroupActivity,
      selectMessage,
      checkAttachmentType,
      getFileDetails,
      downloadFile,
      openPreview,
      scrollToRepliedMessage,
      formatTimeStamp,
      validateLinkInMessage,
      openModal,
      getContactName,
      toggleCheckAction,
      addReaction,
      removeReaction,
      onMouseOver,
      onMouseLeave,
      closeModal,
      getMessageIndex,
      formatDate,
      showDate,
      validateMessages
    };
  },
  render() {
    return (
      <div
        class={`robin-flex robin-flex-column ${this.validateMessages(
          this.messageProps
        )}`}
      >
        {/* Group conversation creation message */}
        {this.getMessageIndex() == 0 && this.conversation.is_group ? (
          <div class="robin-conversation-date">
            This group was created by{' '}
            {this.userToken == this.conversation.moderator.user_token
              ? 'You'
              : this.conversation.moderator.meta_data.display_name}{' '}
            {this.formatDate(
              !Array.isArray(this.messageProps)
                ? this.messageProps.created_at
                : this.messageProps[0].created_at
            ) == 'Today'
              ? 'today.'
              : `on ${this.formatDate(
                  !Array.isArray(this.messageProps)
                    ? this.messageProps.created_at
                    : this.messageProps[0].created_att
                )}.`}
          </div>
        ) : (
          ''
        )}

        {/* Personal conversation creation message */}
        {this.getMessageIndex() == 0 && !this.conversation.is_group ? (
          <div class="robin-conversation-date">
            This conversation was created{' '}
            {this.formatDate(
              !Array.isArray(this.messageProps)
                ? this.messageProps.created_at
                : this.messageProps[0].created_at
            ) == 'Today'
              ? 'today.'
              : `on ${this.formatDate(
                  !Array.isArray(this.messageProps)
                    ? this.messageProps.created_at
                    : this.messageProps[0].created_at
                )}.`}
          </div>
        ) : (
          ''
        )}

        {/* Date of last message sent */}
        {this.showDate() && this.getMessageIndex() != 0 ? (
          <div class="robin-activity">
            {this.formatDate(
              !Array.isArray(this.messageProps)
                ? this.messageProps.created_at
                : this.messageProps[0].created_at
            )}
          </div>
        ) : (
          ''
        )}

        {/* Message Bubble */}
        <div class="robin-message-bubble robin-flex robin-flex-align-center">
          <CheckBox
            ref={this.checkbox}
            v-show={this.selectMessagesOpen}
            onClicked={(event: boolean) => this.toggleCheckAction(event)}
          />

          {!Array.isArray(this.messageProps) ? (
            <div
              class={
                this.validateMessages(this.messageProps).includes(
                  'message-sender'
                )
                  ? 'robin-bubble robin-ml-5'
                  : 'robin-bubble robin-mr-5'
              }
              onMouseover={() => this.onMouseOver()}
              onMouseleave={() => this.onMouseLeave()}
              v-on-clickaway={this.closeModal}
              data-testid="bubble"
            >
              {/* Message Reactions Pop Over. */}

              <div class="robin-popup-container reactions">
                <ReactionPopOver
                  v-show={
                    this.messagePopUpProps.opened &&
                    this.validateMessages(this.messageProps) &&
                    this.isMessageReactionViewEnabled
                  }
                  onCloseModal={() => this.closeModal()}
                  ref="popup-1"
                  id={this.messageProps._id}
                  message={this.messageProps}
                  onReaction={(event: string) => this.addReaction(event)}
                  data-testid="reaction-popover"
                />
              </div>

              {/* Message Reactions. */}
              {this.messageprops &&
              this.messageProps.reactions &&
              this.messageProps.reactions.length > 0 &&
              this.isMessageReactionViewEnabled ? (
                <div class="robin-reactions">
                  {Object.entries(this.reactions).map((entry, index) => {
                    const [key, value] = entry as Array<
                      string | Array<Hashmap>
                    >;

                    return (
                      <div
                        class={
                          this.isMessageReactionDeleteEnabled
                            ? 'robin-reaction delete-enabled'
                            : 'robin-reaction'
                        }
                        key={index}
                        onClick={() =>
                          this.removeReaction(value[value.length - 1])
                        }
                        v-show={value.length > 0}
                      >
                        {key + ' ' + value.length}
                      </div>
                    );
                  })}
                </div>
              ) : (
                ''
              )}

              {/* Personal / Group Message. */}
              {!this.messageProps.has_attachment ? (
                <div
                  class={
                    this.selectMessagesOpen ||
                    (!this.isMessageReactionViewEnabled &&
                      !this.isReplyMessagesEnabled &&
                      !this.isDeleteMessagesEnabled &&
                      !this.isForwardMessagesEnabled) ||
                    this.messageProps.pseudo
                      ? 'robin-message-bubble-inner robin-non-clickable'
                      : 'robin-message-bubble-inner'
                  }
                >
                  {this.validateMessages(this.messageProps).includes(
                    'message-sender'
                  ) && this.conversation.is_group ? (
                    <Content
                      font-size={12}
                      color={
                        this.groupnameColors[
                          this.messageProps.content.sender_token
                        ]
                      }
                      as="span"
                      line-height={20}
                      class="robin-messager-name robin-mb-4"
                    >
                      {' '}
                      {() =>
                        this.getContactName(
                          this.messageProps.content.sender_token
                        )
                      }{' '}
                    </Content>
                  ) : (
                    ''
                  )}

                  <div
                    class="robin-caret-container"
                    v-show={
                      (this.caretOpen ||
                        (this.messagePopUpProps.opened &&
                          this.validateMessages(this.messageProps))) &&
                      (this.isMessageReactionViewEnabled ||
                        this.isReplyMessagesEnabled ||
                        this.isDeleteMessagesEnabled ||
                        this.isForwardMessagesEnabled ||
                        (this.isMessageReactionViewEnabled &&
                          this.isReplyMessagesEnabled &&
                          this.isDeleteMessagesEnabled &&
                          this.isForwardMessagesEnabled)) &&
                      !this.messageProps.pseudo
                    }
                    onClick={() => this.openModal()}
                    data-testid="popup-caret"
                  >
                    <IconButton
                      name="messagePopupCaret"
                      to-emit={false}
                      to-click-away={false}
                    />
                  </div>

                  <SvgIcon
                    class="robin-forwarded"
                    name="forwarded"
                    v-show={this.messageProps.is_forwarded}
                  />

                  {this.messageProps.is_reply && this.isReplyMessagesEnabled ? (
                    <ReplyMessageBubble
                      messages={this.messagesProps}
                      message={this.messageProps}
                      sender={this.validateMessages(this.messageProps).includes(
                        'message-sender'
                      )}
                      onScrollRepliedMessage={(event: string) =>
                        this.scrollToRepliedMessage(event)
                      }
                    />
                  ) : (
                    ''
                  )}

                  <div
                    class={
                      (this.validateLinkInMessage().containsEmail &&
                        this.validateLinkInMessage().containsWebsite) ||
                      this.validateLinkInMessage().containsEmail ||
                      this.validateLinkInMessage().containsWebsite
                        ? 'message-inner robin-flex-column'
                        : 'message-inner'
                    }
                  >
                    {!this.validateLinkInMessage().containsEmail &&
                    !this.validateLinkInMessage().containsWebsite ? (
                      <Content
                        max-width={
                          this.messageProps.content.msg.length < 120
                            ? '217'
                            : '270'
                        }
                        font-size={17}
                        textWrap="pre-line"
                        wordBreak="break-word"
                        as="span"
                      >
                        {() => this.messageProps.content.msg}
                      </Content>
                    ) : (
                      ''
                    )}

                    {(this.validateLinkInMessage().containsEmail &&
                      this.validateLinkInMessage().containsWebsite) ||
                    this.validateLinkInMessage().containsEmail ||
                    this.validateLinkInMessage().containsWebsite ? (
                      <div
                        class="robin-link-container"
                        ref={this.messageBody}
                      ></div>
                    ) : (
                      ''
                    )}

                    <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
                      <Content
                        font-weight="300"
                        font-size={10}
                        color="#7a7a7a"
                        as="p"
                        nativeOnClick={() => this.openModal()}
                        class="robin-flex"
                      >
                        {() => {
                          {
                            !this.messageProps.pseudo
                              ? this.formatTimeStamp(
                                  this.messageProps.content.timestamp
                                )
                              : '';
                          }

                          {
                            !this.validateMessages(this.messageProps).includes(
                              'message-sender'
                            ) &&
                            this.messageProps.is_read &&
                            !this.messageProps.pseudo ? (
                              <SvgIcon name="read" />
                            ) : (
                              ''
                            );
                          }

                          {
                            !this.validateMessages(this.messageProps).includes(
                              'message-sender'
                            ) &&
                            !this.messageProps.is_read &&
                            !this.messageProps.pseudo ? (
                              <SvgIcon name="not-read" />
                            ) : (
                              ''
                            );
                          }

                          {
                            this.messageProps.pseudo ? (
                              <i class="robin-material-icon"> schedule </i>
                            ) : (
                              ''
                            );
                          }
                        }}
                      </Content>
                    </span>
                  </div>
                </div>
              ) : (
                ''
              )}

              {/* Image Message. */}
              {this.messageProps.content.is_attachment &&
              this.imageRegex.test(
                this.checkAttachmentType(this.messageProps.content.attachment)
              ) ? (
                <div
                  class={
                    this.selectMessagesOpen ||
                    (!this.isMessageReactionViewEnabled &&
                      !this.isReplyMessagesEnabled &&
                      !this.isDeleteMessagesEnabled &&
                      !this.isForwardMessagesEnabled) ||
                    this.messageProps.pseudo
                      ? 'robin-message-bubble-image robin-non-clickable'
                      : 'robin-message-bubble-image'
                  }
                >
                  {this.validateMessages(this.messageProps).includes(
                    'message-sender'
                  ) && this.conversation.is_group ? (
                    <Content
                      font-size={12}
                      color={
                        this.groupnameColors[
                          this.messageProps.content.sender_token
                        ]
                      }
                      as="span"
                      line-height={20}
                      class="robin-messager-name robin-mb-4"
                    >
                      {' '}
                      {() =>
                        this.getContactName(
                          this.messageProps.content.sender_token
                        )
                      }{' '}
                    </Content>
                  ) : (
                    ''
                  )}

                  <div
                    class="robin-caret-container"
                    v-show={
                      (this.caretOpen ||
                        (this.messagePopUpProps.opened &&
                          this.validateMessages(this.messageProps))) &&
                      (this.isMessageReactionViewEnabled ||
                        this.isReplyMessagesEnabled ||
                        this.isDeleteMessagesEnabled ||
                        this.isForwardMessagesEnabled ||
                        (this.isMessageReactionViewEnabled &&
                          this.isReplyMessagesEnabled &&
                          this.isDeleteMessagesEnabled &&
                          this.isForwardMessagesEnabled)) &&
                      !this.messageProps.pseudo
                    }
                    onClick={() => this.openModal()}
                  >
                    <IconButton
                      name="messagePopupCaret"
                      to-emit={false}
                      to-click-away={false}
                    />
                  </div>

                  <SvgIcon
                    class="robin-forwarded"
                    name="forwarded"
                    v-show={this.messageProps.is_forwarded}
                  />

                  {this.messageProps.is_reply && this.isReplyMessagesEnabled ? (
                    <ReplyMessageBubble
                      messages={this.messagesProps}
                      message={this.messageProps}
                      sender={this.validateMessages(this.messageProps).includes(
                        'message-sender'
                      )}
                      onScrollRepliedMessage={(event: string) =>
                        this.scrollToRepliedMessage(event)
                      }
                    />
                  ) : (
                    ''
                  )}

                  <VLazyImage
                    class="robin-uploaded-image"
                    src={
                      typeof this.messageProps.content.attachment !== 'string'
                        ? this.pseudoAttachmentUrl
                        : this.messageProps.content.attachment
                    }
                    nativeOnClick={() =>
                      this.$emit('open-preview', [this.messageProps])
                    }
                  />

                  {!this.validateLinkInMessage().containsEmail &&
                  !this.validateLinkInMessage().containsWebsite &&
                  this.messageProps.content.msg &&
                  this.messageProps.content.msg != 'undefined' ? (
                    <Content
                      max-width={
                        this.messageProps.content.msg.length < 120
                          ? '217'
                          : '270'
                      }
                      textWrap="pre-line"
                      wordBreak="break-word"
                      as="span"
                    >
                      {() => this.messageProps.content.msg}
                    </Content>
                  ) : (
                    ''
                  )}

                  {(this.validateLinkInMessage().containsEmail &&
                    this.validateLinkInMessage().containsWebsite) ||
                  this.validateLinkInMessage().containsEmail ||
                  (this.validateLinkInMessage().containsWebsite &&
                    this.messageProps.content.msg &&
                    this.messageProps.content.msg != 'undefined') ? (
                    <div
                      class="robin-link-container"
                      ref={this.messageBody}
                    ></div>
                  ) : (
                    ''
                  )}

                  <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
                    <Content
                      font-weight="300"
                      font-size={10}
                      color="#7a7a7a"
                      as="p"
                      nativeOnClick={() => this.openModal()}
                      class="robin-flex"
                    >
                      {() => (
                        <>
                          {!this.messageProps.pseudo
                            ? this.formatTimeStamp(
                                this.messageProps.content.timestamp
                              )
                            : ''}

                          {!this.validateMessages(this.messageProps).includes(
                            'message-sender'
                          ) &&
                          this.messageProps.is_read &&
                          !this.messageProps.pseudo ? (
                            <SvgIcon name="read" />
                          ) : (
                            ''
                          )}

                          {!this.validateMessages(this.messageProps).includes(
                            'message-sender'
                          ) &&
                          !this.message.is_read &&
                          !this.messageProps.pseudo ? (
                            <SvgIcon name="not-read" />
                          ) : (
                            ''
                          )}

                          {this.messageProps.pseudo ? (
                            <i class="robin-material-icon"> schedule </i>
                          ) : (
                            ''
                          )}
                        </>
                      )}
                    </Content>
                  </span>
                </div>
              ) : (
                ''
              )}

              {/* Video Message. */}
              {this.messageProps.content.is_attachment &&
              this.videoRegex.test(
                this.checkAttachmentType(this.messageProps.content.attachment)
              ) ? (
                <div
                  class={
                    this.selectMessagesOpen ||
                    (!this.isMessageReactionViewEnabled &&
                      !this.isReplyMessagesEnabled &&
                      !this.isDeleteMessagesEnabled &&
                      !this.isForwardMessagesEnabled) ||
                    this.messageProps.pseudo
                      ? 'robin-message-bubble-video robin-non-clickable'
                      : 'robin-message-bubble-video'
                  }
                >
                  {this.validateMessages(this.messageProps).includes(
                    'message-sender'
                  ) && this.conversation.is_group ? (
                    <Content
                      font-size={12}
                      color={
                        this.groupnameColors[
                          this.messageProps.content.sender_token
                        ]
                      }
                      as="span"
                      line-height={20}
                      class="robin-messager-name robin-mb-4"
                    >
                      {' '}
                      {() =>
                        this.getContactName(
                          this.messageProps.content.sender_token
                        )
                      }{' '}
                    </Content>
                  ) : (
                    ''
                  )}

                  <div
                    class="robin-caret-container"
                    v-show={
                      (this.caretOpen ||
                        (this.messagePopUpProps.opened &&
                          this.validateMessages(this.messageProps))) &&
                      (this.isMessageReactionViewEnabled ||
                        this.isReplyMessagesEnabled ||
                        this.isDeleteMessagesEnabled ||
                        this.isForwardMessagesEnabled ||
                        (this.isMessageReactionViewEnabled &&
                          this.isReplyMessagesEnabled &&
                          this.isDeleteMessagesEnabled &&
                          this.isForwardMessagesEnabled)) &&
                      !this.messageProps.pseudo
                    }
                    onClick={() => this.openModal()}
                  >
                    <IconButton
                      name="messagePopupCaret"
                      to-emit={false}
                      to-click-away={false}
                    />
                  </div>

                  <SvgIcon
                    class="robin-forwarded"
                    name="forwarded"
                    v-show={this.messageProps.is_forwarded}
                  />

                  {this.messageProps.is_reply && this.isReplyMessagesEnabled ? (
                    <ReplyMessageBubble
                      messages={this.messagesProps}
                      message={this.messageProps}
                      sender={this.validateMessages(this.messageProps).includes(
                        'message-sender'
                      )}
                      onScrollRepliedMessage={(event: string) =>
                        this.scrollToRepliedMessage(event)
                      }
                    />
                  ) : (
                    ''
                  )}

                  <video
                    controls
                    class={this.messageProps.is_reply ? 'video-reply' : ''}
                    id={`video-${this.index}`}
                  >
                    <source src={this.messageProps.content.attachment} />
                    Your browser does not support the video tag.
                  </video>

                  {!this.validateLinkInMessage().containsEmail &&
                  !this.validateLinkInMessage().containsWebsite &&
                  this.messageProps.content.msg &&
                  this.messageProps.content.msg != 'undefined' ? (
                    <Content
                      max-width={
                        this.messageProps.content.msg.length < 120
                          ? '217'
                          : '270'
                      }
                      textWrap="pre-line"
                      wordBreak="break-word"
                      as="span"
                    >
                      {() => this.messageProps.content.msg}
                    </Content>
                  ) : (
                    ''
                  )}

                  {(this.validateLinkInMessage().containsEmail &&
                    this.validateLinkInMessage().containsWebsite) ||
                  this.validateLinkInMessage().containsEmail ||
                  (this.validateLinkInMessage().containsWebsite &&
                    this.messageProps.content.msg &&
                    this.messageProps.content.msg != 'undefined') ? (
                    <div
                      class="robin-link-container"
                      ref={this.messageBody}
                    ></div>
                  ) : (
                    ''
                  )}

                  <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
                    <Content
                      font-weight="300"
                      font-size={10}
                      color="#7a7a7a"
                      as="p"
                      nativeOnClick={() => this.openModal()}
                      class="robin-flex"
                    >
                      {!this.messageProps.pseudo
                        ? this.formatTimeStamp(
                            this.messageProps.content.timestamp
                          )
                        : ''}

                      {!this.validateMessages(this.messageProps).includes(
                        'message-sender'
                      ) &&
                      this.messageProps.is_read &&
                      !this.messageProps.pseudo ? (
                        <SvgIcon name="read" />
                      ) : (
                        ''
                      )}

                      {!this.validateMessages(this.messageProps).includes(
                        'message-sender'
                      ) &&
                      !this.messageProps.is_read &&
                      !this.messageProps.pseudo ? (
                        <SvgIcon name="not-read" />
                      ) : (
                        ''
                      )}

                      {this.messageProps.pseudo ? (
                        <i class="robin-material-icon"> schedule </i>
                      ) : (
                        ''
                      )}
                    </Content>
                  </span>
                </div>
              ) : (
                ''
              )}

              {/* Document Message. */}
              {this.messageProps.content.is_attachment &&
              this.documentRegex.test(
                this.checkAttachmentType(this.messageProps.content.attachment)
              ) ? (
                <div
                  class={
                    this.selectMessagesOpen ||
                    (!this.isMessageReactionViewEnabled &&
                      !this.isReplyMessagesEnabled &&
                      !this.isDeleteMessagesEnabled &&
                      !this.isForwardMessagesEnabled) ||
                    this.messageProps.pseudo
                      ? 'robin-message-bubble-document robin-non-clickable'
                      : 'robin-message-bubble-document'
                  }
                >
                  {this.validateMessages(this.messageProps).includes(
                    'message-sender'
                  ) && this.conversation.is_group ? (
                    <Content
                      font-size={12}
                      color={
                        this.groupnameColors[
                          this.messageProps.content.sender_token
                        ]
                      }
                      as="span"
                      line-height={20}
                      class="robin-messager-name robin-mb-4"
                    >
                      {' '}
                      {() =>
                        this.getContactName(this.message.content.sender_token)
                      }{' '}
                    </Content>
                  ) : (
                    ''
                  )}

                  <div
                    class="robin-caret-container"
                    v-show={
                      (this.caretOpen ||
                        (this.messagePopUpProps.opened &&
                          this.validateMessages(this.message))) &&
                      (this.isMessageReactionViewEnabled ||
                        this.isReplyMessagesEnabled ||
                        this.isDeleteMessagesEnabled ||
                        this.isForwardMessagesEnabled ||
                        (this.isMessageReactionViewEnabled &&
                          this.isReplyMessagesEnabled &&
                          this.isDeleteMessagesEnabled &&
                          this.isForwardMessagesEnabled)) &&
                      !this.messageProps.pseudo
                    }
                    onClick={() => this.openModal()}
                  >
                    <IconButton
                      name="messagePopupCaret"
                      to-emit={false}
                      to-click-away={false}
                    />
                  </div>

                  <SvgIcon
                    class="robin-forwarded"
                    name="forwarded"
                    v-show={this.messageProps.is_forwarded}
                  />

                  {this.messageProps.is_reply && this.isReplyMessagesEnabled ? (
                    <ReplyMessageBubble
                      messages={this.messagesProps}
                      message="message"
                      index={this.index}
                      sender={this.validateMessages(this.messageProps).includes(
                        'message-sender'
                      )}
                      class="robin-mb-8"
                    />
                  ) : (
                    ''
                  )}

                  {this.documentRegex.test(
                    this.checkAttachmentType(
                      this.getFileDetails(this.messageProps.content.attachment)
                    )
                  ) &&
                  !this.audioRegex.test(
                    this.checkAttachmentType(
                      this.messageProps.content.attachment
                    )
                  ) ? (
                    <>
                      <div class="robin-uploaded-document">
                        {assets[
                          this.getFileDetails(
                            this.messageProps.content.attachment
                          ).extension as keyof typeof assets
                        ] ? (
                          <img
                            src={
                              assets[
                                this.getFileDetails(
                                  this.messageProps.content.attachment
                                ).extension as keyof typeof assets
                              ]
                            }
                            alt="document"
                          />
                        ) : (
                          <img src={assets['default']} />
                        )}

                        <div class="details robin-flex robin-h-100 robin-flex-align-center">
                          <Content as="span" fontSize={14}>
                            {' '}
                            {() =>
                              this.getFileDetails(
                                this.messageProps.content.attachment
                              ).name.length > 9
                                ? this.getFileDetails(
                                    this.messageProps.content.attachment
                                  ).name.substring(0, 9) +
                                  '...' +
                                  '.' +
                                  this.getFileDetails(
                                    this.messageProps.content.attachment
                                  ).extension
                                : this.getFileDetails(
                                    this.messageProps.content.attachment
                                  ).name +
                                  '.' +
                                  this.getFileDetails(
                                    this.messageProps.content.attachment
                                  ).extension
                            }
                          </Content>
                        </div>

                        <IconButton
                          name="download"
                          color="#15AE73"
                          onClicked={() =>
                            this.downloadFile(
                              this.messageProps.content.attachment
                            )
                          }
                          to-emit={true}
                          to-click-away={false}
                        />
                      </div>
                    </>
                  ) : (
                    <AudioPlayer
                      message={this.messageProps}
                      index={this.index}
                    />
                  )}

                  {!this.validateLinkInMessage().containsEmail &&
                  !this.validateLinkInMessage().containsWebsite &&
                  this.messageProps.content.msg &&
                  this.messageProps.content.msg != 'undefined' ? (
                    <Content
                      max-width={
                        this.messageProps.content.msg.length < 120
                          ? '217'
                          : '270'
                      }
                      textWrap="pre-line"
                      wordBreak="break-word"
                      as="span"
                    >
                      {() => this.messageProps.content.msg}
                    </Content>
                  ) : (
                    ''
                  )}

                  {(this.validateLinkInMessage().containsEmail &&
                    this.validateLinkInMessage().containsWebsite) ||
                  this.validateLinkInMessage().containsEmail ||
                  (this.validateLinkInMessage().containsWebsite &&
                    this.messageProps.content.msg &&
                    this.messageProps.content.msg != 'undefined') ? (
                    <div
                      class="robin-link-container"
                      ref={this.messageBody}
                    ></div>
                  ) : (
                    ''
                  )}

                  <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
                    <Content
                      font-weight="300"
                      font-size={10}
                      color="#7a7a7a"
                      as="p"
                      nativeOnClick={() => this.openModal()}
                      class="robin-flex"
                    >
                      {() => (
                        <>
                          {!this.messageProps.pseudo
                            ? this.formatTimeStamp(
                                this.messageProps.content.timestamp
                              )
                            : ''}

                          {!this.validateMessages(this.messageProps).includes(
                            'message-sender'
                          ) &&
                          this.messageProps.is_read &&
                          !this.messageProps.pseudo ? (
                            <SvgIcon name="read" />
                          ) : (
                            ''
                          )}

                          {!this.validateMessages(this.messageProps).includes(
                            'message-sender'
                          ) &&
                          !this.messageProps.is_read &&
                          !this.messageProps.pseudo ? (
                            <SvgIcon name="not-read" />
                          ) : (
                            ''
                          )}

                          <i class="robin-material-icon" v-if="message.pseudo">
                            {' '}
                            schedule{' '}
                          </i>
                        </>
                      )}
                    </Content>
                  </span>
                </div>
              ) : (
                ''
              )}
            </div>
          ) : (
            ''
          )}

          {Array.isArray(this.messageProps) &&
          this.messageProps.filter((image) => !image.is_deleted).length ===
            1 ? (
            <div
              class={
                this.validateMessages(this.messageProps).includes(
                  'message-sender'
                )
                  ? 'robin-bubble robin-ml-5'
                  : 'robin-bubble robin-mr-5'
              }
            >
              {this.messageProps[0].reactions &&
              this.messageProps[0].reactions.length > 0 &&
              this.isMessageReactionViewEnabled ? (
                <div class="robin-reactions">
                  {Object.entries(this.reactions).map((entry, index) => {
                    const [key, value] = entry as Array<
                      string | Array<Hashmap>
                    >;
                    return (
                      <div
                        class={
                          this.isMessageReactionDeleteEnabled
                            ? 'robin-reaction delete-enabled'
                            : 'robin-reaction'
                        }
                        key={index}
                        onClick={() =>
                          this.removeReaction(value[value.length - 1])
                        }
                        v-show={value.length > 0}
                      >
                        {key + ' ' + value.length}
                      </div>
                    );
                  })}
                </div>
              ) : (
                ''
              )}

              {/* Message Grid / Image Message. */}
              {this.message[0].content.is_attachment &&
              this.imageRegex.test(
                this.checkAttachmentType(
                  this.messageProps[0].content.attachment
                )
              ) ? (
                <div class="robin-message-bubble-image">
                  {this.validateMessages(this.messageProps).includes(
                    'message-sender'
                  ) && this.conversation.is_group ? (
                    <Content
                      font-size={12}
                      color={
                        this.groupnameColors[
                          this.messageProps[0].content.sender_token
                        ]
                      }
                      as="span"
                      line-height={20}
                      class="robin-messager-name robin-mb-4"
                    >
                      {' '}
                      {() =>
                        this.getContactName(
                          this.messageProps[0].content.sender_token
                        )
                      }{' '}
                    </Content>
                  ) : (
                    ''
                  )}

                  {this.messageProps[0].is_reply &&
                  this.isReplyMessagesEnabled ? (
                    <ReplyMessageBubble
                      messages={this.messagesProps}
                      message={this.messageProps}
                      sender={this.validateMessages(this.messageProps).includes(
                        'message-sender'
                      )}
                      onScrollRepliedMessage={(event: string) =>
                        this.scrollToRepliedMessage(event)
                      }
                    />
                  ) : (
                    ''
                  )}

                  <VLazyImage
                    class="robin-uploaded-image"
                    src={this.messageProps[0].content.attachment}
                    nativeOnClick={this.$emit('open-preview', [
                      this.messageProps[0]
                    ])}
                  />

                  <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
                    <Content
                      font-weight="300"
                      font-size={10}
                      color="#7a7a7a"
                      as="p"
                      class="robin-flex"
                    >
                      {() => (
                        <>
                          {this.formatTimeStamp(
                            this.messageProps[0].content.timestamp
                          )}

                          {!this.validateMessages(this.messageProps).includes(
                            'message-sender'
                          ) &&
                          (this.messageProps[0].is_read ||
                            this.readReceipts.some(
                              (item) => item === this.messageProps[0]._id
                            )) ? (
                            <SvgIcon name="read" />
                          ) : (
                            ''
                          )}

                          {!this.validateMessages(this.messageProps).includes(
                            'message-sender'
                          ) &&
                          (!this.messageProps[0].is_read ||
                            !this.readReceipts.some(
                              (item) => item === this.messageProps[0]._id
                            )) ? (
                            <SvgIcon name="not-read" />
                          ) : (
                            ''
                          )}
                        </>
                      )}
                    </Content>
                  </span>
                </div>
              ) : (
                ''
              )}
            </div>
          ) : (
            ''
          )}

          {Array.isArray(this.messageProps) &&
          this.messageProps[0].reactions &&
          this.messageProps[0].reactions.length > 0 &&
          this.isMessageReactionViewEnabled ? (
            <div class="robin-reactions">
              {Object.entries(this.reactions).map((entry, index) => {
                const [key, value] = entry as Array<string | Array<Hashmap>>;
                return (
                  <div
                    class={
                      this.isMessageReactionDeleteEnabled
                        ? 'robin-reaction delete-enabled'
                        : 'robin-reaction'
                    }
                    v-for="(value, key, index) in reactions"
                    key="index"
                    onClick={() => this.removeReaction(value[value.length - 1])}
                    v-show={value.length > 0}
                  >
                    {key + ' ' + value.length}
                  </div>
                );
              })}
            </div>
          ) : (
            ''
          )}

          {Array.isArray(this.messageProps) &&
          this.messageProps.filter((image) => !image.is_deleted).length > 1 ? (
            <MessageGrid
              class={
                !this.validateMessages(this.messageProps)
                  ? 'robin-ml-5'
                  : 'robin-mr-5'
              }
              message={this.messageProps.filter((image) => !image.is_deleted)}
              read-receipts={this.readReceipts}
              conversation={this.conversation}
              message-popup={this.messagePopUpProps}
              onOpenPreview={(event: Hashmap) => this.openPreview(event)}
              onOpenModal={() => this.openModal()}
              onCloseModal={() => this.closeModal()}
              onAddReaction={() => this.addReaction}
              v-on-clickaway={this.closeModal}
              groupname-colors={this.groupnameColors}
            />
          ) : (
            ''
          )}

          <div
            class={
              (this.lastId === this.messageProps._id ||
                this.messagesProps.length - 3 === this.index) &&
              this.scroll
                ? 'robin-popup-container message top'
                : 'robin-popup-container message'
            }
          >
            <MessagePopOver
              v-show={
                this.messagePopUpProps.opened &&
                this.validateMessages(this.messageProps) &&
                !Array.isArray(this.messageProps) &&
                (this.isReplyMessagesEnabled ||
                  this.isDeleteMessagesEnabled ||
                  this.isForwardMessagesEnabled ||
                  (this.isReplyMessagesEnabled &&
                    this.isDeleteMessagesEnabled &&
                    this.isForwardMessagesEnabled)) &&
                !this.messageProps.pseudo
              }
              onCloseModal={() => this.closeModal()}
              onSelectMessage={() => this.selectMessage()}
              onForwardMessage={() => this.$emit('forward-message')}
              onReplyMessage={() =>
                this.$emit('reply-message', this.messageProps)
              }
              id={this.messageProps._id}
              message={this.messageProps}
              data-testid="message-popover"
            />
          </div>
        </div>

        {this.leaveGroupActivity.map((activity, index) => {
          return (
            <div
              class="robin-activity"
              v-show={this.getMessageIndex() === this.messagesProps.length - 1}
              v-for="(activity, index) in leaveGroupActivity"
              key={`activity-${index}`}
            >
              {activity.length > 35
                ? activity.substring(0, 35) + '..'
                : activity}
            </div>
          );
        })}
      </div>
    );
  }
});
</script>
