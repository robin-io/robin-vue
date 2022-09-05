<script lang="tsx">
import {
  defineComponent,
  ref,
  reactive,
  onMounted,
  nextTick,
  computed
} from 'vue-demi';
// import { VEmojiPicker } from 'v-emoji-picker'
import { VueClickaway } from '@/package-compatibility';
import mime from 'mime';
import AudioRecorder from 'audio-recorder-polyfill';
import mpegEncoder from 'audio-recorder-polyfill/mpeg-encoder';
import useEmitter from '@/utilities/index';
import store from '@/store/index';
import IconButton from '../IconButton/IconButton.vue';
import AttachFilePopOver from '../AttachFilePopOver/AttachFilePopOver.vue';
import Content from '../Content/Content.vue';
import SvgIcon from '../SvgIcon/SvgIcon.vue';
import { RobinType, Hashmap } from '@/utilities/types';

export default defineComponent({
  name: 'MessageInputBar',
  mixins: [VueClickaway],
  components: {
    IconButton,
    AttachFilePopOver,
    // VEmojiPicker,
    Content,
    SvgIcon
  },
  props: {
    conversation: {
      type: Object as any,
      default: (): any => {}
    },
    capturedImage: {
      type: Object,
      default: (): any => {}
    },
    messageReply: {
      type: Object,
      default: (): any => {}
    }
  },
  setup(props, context) {
    const input = ref();
    const files = ref([] as Array<Hashmap>);
    const isUploading = ref(false);
    const replying = ref(false);
    const isRecording = ref(false);
    const sendRecording = ref(false);
    const screenWidth = ref(0);
    const currentTime = ref('00:00');
    const text = ref('');
    const acceptedDocFiles = 'application/*, text/*';
    const elapsedTimer = ref(null as null | number);
    const recorder = ref(null as null | MediaRecorder);
    const linkContainer = ref();
    const { emit, listen } = useEmitter();

    const imageRegex = /^image/ as any;
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const websiteRegex =
      /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
    const videoRegex = /^video/ as any;

    const popUpState = reactive({
      opened: false,
      emojiOpened: false
    });
    const popUp = reactive({
      reply: ref(),
      file: ref(),
      emoji: ref(),
      filePopOver: ref()
    });

    const robin = computed(() => store.state.robin as RobinType);
    const userToken = computed(() => store.state.user_token as string);
    const conn = computed(() => store.state.conn as WebSocket);
    const channel = computed(() => store.state.channel as string);
    const senderName = computed(() => store.state.senderName);

    const isVoiceRecorderEnabled = computed(() => {
      return store.state.voiceRecorderEnabled;
    });

    const currentConversation = computed(() => {
      return store.state.currentConversation;
    });

    onMounted(() => {
      nextTick(function () {
        onResize();
      });

      window.addEventListener('resize', onResize);

      handleConversationOpen();
      resetState();
      focusInput();

      if (linkContainer.value) {
        linkContainer.value.innerHTML = injectHtml();
      }
    });

    const handleConversationOpen = () => {
      listen('conversation-opened', (_: any) => {
        const inputElement = input.value as HTMLInputElement;
        setTimeout(() => {
          if (inputElement) {
            inputElement.focus();
          }
        }, 50);
      });
    };

    const focusInput = () => {
      const inputElement = input.value as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    };

    const resetState = () => {
      const inputElement = input.value as HTMLInputElement;
      inputElement.value = '';
      inputElement.style.height = '0px';
      text.value = '';
      files.value = [];
      isUploading.value = false;
      replying.value = false;
      popUpState.emojiOpened = false;
      recorder.value = null;
      isRecording.value = false;
      currentTime.value = '00:00';
      sendRecording.value = false;
    };

    const onResize = () => {
      screenWidth.value = window.innerWidth;
    };

    const getElapsedTime = (startTime: Date) => {
      const endTime = new Date();
      let timeDiff = endTime.getTime() - startTime.getTime();
      timeDiff = timeDiff / 1000;
      let seconds = Math.floor(timeDiff % 60) as any;
      seconds = seconds < 10 ? '0' + seconds : seconds;
      timeDiff = Math.floor(timeDiff / 60);
      let minutes = (timeDiff % 60) as any;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      timeDiff = Math.floor(timeDiff / 60);
      const hours = timeDiff % 24;
      timeDiff = Math.floor(timeDiff / 24);
      const days = timeDiff;
      let totalHours = (hours + days * 24) as number | string;
      totalHours = totalHours < 10 ? '0' + totalHours : totalHours;
      if (totalHours === '00') {
        currentTime.value = minutes + ':' + seconds;
      } else {
        currentTime.value = totalHours + ':' + minutes + ':' + seconds;
      }
    };

    const send = (event: any) => {
      if (screenWidth.value <= 1024 && event && event.keyCode === 13) {
        newLine();
        calculateTextareaHeight();
        calculateTextareaHeight();
      } else {
        if (!replying.value && !isUploading.value) {
          sendMessage();
        }
        if (replying.value && !isUploading.value) {
          replyMessage();
        }
        if (!replying.value && !isUploading.value && isRecording.value) {
          sendRecording.value = true;
          stopRecorder();
        }
      }
    };

    const sendMessage = () => {
      if (files.value.length > 0 && text.value.trim().length === 0) {
        sendFileMessage();
      } else if (text.value.trim().length > 0 && files.value.length < 1) {
        sendTextMessage();
      } else if (text.value.trim().length > 0 && files.value.length > 1) {
        Promise.all([sendTextMessage(), sendFileMessage()]);
      } else if (text.value.trim().length > 0 && files.value.length === 1) {
        sendMessageWithAttachment();
      }
    };

    const replyMessage = async () => {
      if (files.value.length > 0 && text.value.trim().length === 0) {
        replyFileMessage();
      } else if (text.value.trim().length > 0 && files.value.length < 1) {
        replyTextMessage();
      } else if (text.value.trim().length > 0 && files.value.length > 1) {
        Promise.all([replyTextMessage(), replyFileMessage()]);
      } else if (text.value.trim().length > 0 && files.value.length === 1) {
        replyMessageWithAttachment();
      }
    };

    const sendTextMessage = async () => {
      isUploading.value = true;
      try {
        const message = {
          msg: text.value,
          sender_token: userToken,
          receiver_token:
            props.conversation.receiver_token === userToken
              ? props.conversation.sender_token
              : props.conversation.receiver_token,
          timestamp: new Date()
        };
        await robin.value.sendMessageToConversation(
          {
            ...message
          },
          conn.value,
          channel.value,
          props.conversation._id,
          userToken.value,
          senderName.value
        );
        resetState();
      } catch (e) {
        isUploading.value = false;
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    const sendFileMessage = async (): Promise<void> => {
      isUploading.value = true;
      try {
        await Promise.all(
          files.value.map(async (file) => {
            await robin.value.sendMessageAttachment(
              userToken.value,
              props.conversation._id,
              file.file,
              senderName.value,
              ''
            );
          })
        );

        resetState();
      } catch (e) {
        isUploading.value = false;
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    const sendMessageWithAttachment = async (): Promise<void> => {
      isUploading.value = true;
      try {
        await Promise.all(
          files.value.map(async (file) => {
            await robin.value.sendMessageAttachment(
              userToken.value,
              props.conversation._id,
              file.file,
              senderName.value,
              text.value
            );
          })
        );
        resetState();
      } catch (e) {
        isUploading.value = false;
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    const replyTextMessage = async (): Promise<void> => {
      isUploading.value = true;
      try {
        const message = {
          msg: text.value,
          sender_token: userToken,
          receiver_token:
            props.conversation.receiver_token === userToken
              ? props.conversation.sender_token
              : props.conversation.receiver_token,
          timestamp: new Date()
        };
        await robin.value.replyToMessage(
          {
            ...message
          },
          conn.value,
          channel.value,
          props.conversation._id,
          props.messageReply?._id,
          userToken.value,
          senderName.value
        );
        resetState();
      } catch (e) {
        isUploading.value = false;
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    const replyFileMessage = async (): Promise<void> => {
      isUploading.value = true;
      try {
        await Promise.all(
          files.value.map(async (file) => {
            await robin.value.replyMessageWithAttachment(
              userToken.value,
              props.conversation._id,
              props.messageReply?._id,
              file.file,
              senderName.value
            );
          })
        );

        resetState();
      } catch (e) {
        isUploading.value = false;
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    const replyMessageWithAttachment = async (): Promise<void> => {
      isUploading.value = true;
      try {
        await Promise.all(
          files.value.map(async (file) => {
            await robin.value.replyMessageWithAttachment(
              userToken.value,
              props.conversation._id,
              props.messageReply?._id,
              file.file,
              senderName.value,
              text.value
            );
          })
        );

        resetState();
      } catch (e) {
        isUploading.value = false;
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    const enterText = (event: any): void => {
      text.value = event.target.value;
      calculateTextareaHeight();
    };

    const escapeText = (): void => {
      const inputElement = input.value as HTMLInputElement;
      inputElement.value = '';
      text.value = '';
      inputElement.style.height = '0px';
    };

    const selectEmoji = (emoji: any): void => {
      if (text.value.length > 0) text.value += ` ${emoji.data}`;
      else text.value += `${emoji.data}`;
      focusInput();
    };

    const handleEmojiOpenPopUp = (): void => {
      const popup = popUp.emoji.value as HTMLElement;
      popup.classList.remove('robin-squeezeIn');
      popUpState.emojiOpened = true;
    };

    const handleEmojiClosePopUp = (): void => {
      const popup = popUp.emoji.value as HTMLElement;
      popup.classList.remove('robin-squeezeOut');
      popup.classList.add('robin-squeezeIn');
      window.setTimeout(() => {
        popup.classList.remove('robin-squeezeIn');
        popup.classList.add('robin-squeezeOut');
        popUpState.emojiOpened = false;
      }, 100);
    };

    const toggleAttachFilePopup = (): void => {
      popUpState.opened = !popUpState.opened;
    };

    const handleClosePopUp = (): void => {
      const popup = popUp.filePopOver.value as any;
      popup.popUpBody.classList.remove('robin-zoomIn');
      popup.popUpBody.classList.add('robin-zoomOut');
      window.setTimeout(() => {
        popup.popUpBody.classList.add('robin-zoomIn');
        popup.popUpBody.classList.remove('robin-zoomOut');
        popUpState.opened = false;
      }, 300);
    };

    const handleFileUpload = (file: any) => {
      files.value.push(file);
      recorder.value = null;
    };

    const handleFileUploadClose = (): void => {
      const popup = popUp.file.value as HTMLElement;
      popup.classList.remove('robin-squeezeOut');
      popup.classList.add('robin-squeezeIn');
      window.setTimeout(() => {
        popup.classList.remove('robin-squeezeIn');
        popup.classList.add('robin-squeezeOut');
        files.value = [];
      }, 100);
    };

    const removeFile = (index: number): void => {
      if (files.value.length > 1) {
        files.value.splice(index, 1);
      } else {
        const popup = popUp.file.value as HTMLElement;
        popup.classList.remove('robin-squeezeOut');
        popup.classList.add('robin-squeezeIn');
        window.setTimeout(() => {
          popup.classList.remove('robin-squeezeIn');
          popup.classList.add('robin-squeezeOut');
          files.value = [];
        }, 100);
      }
    };

    const handleReplyMessageClose = (): void => {
      const popup = popUp.reply.value as HTMLElement;
      popup.classList.remove('robin-squeezeOut');
      popup.classList.add('robin-squeezeIn');
      window.setTimeout(() => {
        popup.classList.remove('robin-squeezeIn');
        popup.classList.add('robin-squeezeOut');
        context.emit('on-close-reply');
        store.setState('isImageReplying', false);
      }, 100);
    };

    const checkAttachmentType = (attachmentUrl: String): string => {
      const strArr = attachmentUrl.split('.');
      if (mime.getType(strArr[strArr.length - 1]) === 'application/msword') {
        return 'doc';
      }
      return `${mime.getType(strArr[strArr.length - 1])}`;
    };

    const validateLinkInMessage = () => {
      const messageReply = props.messageReply?.content
        ? props.messageReply?.content.msg
        : '';
      const texts = messageReply.split(' ');
      return {
        containsWebsite: texts.some((text: string) => websiteRegex.test(text)),
        containsEmail: texts.some((text: string) => emailRegex.test(text))
      };
    };

    const getFileDetails = (attachmentUrl: string) => {
      const fileName = attachmentUrl.substring(
        attachmentUrl.lastIndexOf('/') + 1
      );
      const strArr = fileName.split('.');
      return {
        name: strArr[strArr.length - 2],
        extension: strArr[strArr.length - 1]
      };
    };

    const injectHtml = (): String => {
      let returnedMessage = '';
      const messageReply = props.messageReply?.content
        ? props.messageReply.content.msg
        : '';
      for (const word of messageReply.split(' ')) {
        if (emailRegex.test(word)) {
          returnedMessage += String.raw` <a target="_blank" href="mailto:${word}" > ${word} <a/>`;
        } else if (websiteRegex.test(word)) {
          if (word.includes('http://') || word.includes('https://')) {
            returnedMessage += String.raw` <a target="_blank" href="${word}" > ${word} <a/>`;
          } else {
            returnedMessage += String.raw` <a target="_blank" href="http://${word}"> ${word} <a/>`;
          }
        } else {
          returnedMessage += ` ${word}`;
        }
      }
      return returnedMessage;
    };

    const calculateTextareaHeight = (): void => {
      const inputElement = input.value as any;
      if (!inputElement) return;
      const padding = window
        .getComputedStyle(inputElement, null)
        .getPropertyValue('padding-top')
        .replace('px', '') as any;
      inputElement.style.height = 0;
      inputElement.style.height =
        inputElement.scrollHeight - padding * 2 + 'px';
      inputElement.style.lineHeight = 1.5;
      if (
        inputElement.style.height === '12px' ||
        inputElement.style.height === '16px'
      ) {
        inputElement.style.lineHeight = 1;
      } else {
        inputElement.style.lineHeight = 1.5;
      }
    };

    const newLine = () => {
      const inputElement = input.value as HTMLInputElement;
      inputElement.value += '\n';
    };

    const createUuid = (length: number) => {
      let result = '';
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    };

    const toggleRecorder = (record: boolean): void => {
      if (record) {
        startRecorder();
      } else {
        stopRecorder();
      }
    };

    const startRecorder = () => {
      AudioRecorder.encoder = mpegEncoder;
      AudioRecorder.prototype.mimeType = 'audio/mpeg';
      window.MediaRecorder = AudioRecorder;
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        recorder.value = new MediaRecorder(stream);
        // Set record to <audio> when recording will be finished
        recorder.value.addEventListener(
          'dataavailable',
          (event: { data: any }) => {
            const file = new File([event.data], `${createUuid(30)}.mp3`, {
              type: event.data.type
            });
            files.value.push({
              name: `${createUuid(30)}`,
              size: event.data.size,
              type: event.data.type,
              audio: true,
              extension: 'mp3',
              localUrl: URL.createObjectURL(event.data),
              file
            });
            if (!replying.value && sendRecording.value) sendMessage();
            if (replying.value && sendRecording.value) replyMessage();
            if (!sendRecording.value) files.value = [];
          }
        );
        // Start recording
        recorder.value.start();
        isRecording.value = true;
        const startTime = new Date();
        elapsedTimer.value = setInterval(() => {
          getElapsedTime(startTime as Date);
        }, 1000);
      });
    };

    const stopRecorder = (): void => {
      recorder.value?.stop();
      clearInterval(elapsedTimer.value as number);
      isRecording.value = false;
      currentTime.value = '00:00';
      // Remove “recording” icon from browser tab
      recorder.value?.stream.getTracks().forEach((i: any) => i.stop());
    };

    return {
      text,
      input,
      files,
      replying,
      sendMessage,
      popUpState,
      replyMessage,
      recorder,
      linkContainer,
      isUploading,
      validateLinkInMessage,
      checkAttachmentType,
      imageRegex,
      videoRegex,
      acceptedDocFiles,
      isRecording,
      isVoiceRecorderEnabled,
      send,
      enterText,
      escapeText,
      currentTime,
      toggleRecorder,
      handleEmojiOpenPopUp,
      handleEmojiClosePopUp,
      handleFileUpload,
      handleFileUploadClose,
      toggleAttachFilePopup,
      getFileDetails,
      removeFile,
      handleReplyMessageClose
    };
  },
  render() {
    const getReplyContainer = () => {
      return (
        <div
          class="robin-reply-container robin-squeezeOut"
          ref="popup-3"
          v-show={this.replying}
          v-on-clickaway={this.handleEmojiClosePopUp}
        >
          <div class="robin-wrapper robin-flex robin-flex-1 robin-pt-8 robin-pb-8 robin-pl-24 robin-pr-24 robin-overflow-y-auto">
            {!this.messageReply.has_attachment ? (
              <div class="robin-reply robin-w-100">
                {!this.validateLinkInMessage().containsEmail &&
                !this.validateLinkInMessage().containsWebsite ? (
                  <Content
                    font-size={14}
                    textWrap="pre-line"
                    wordBreak="break-word"
                    as="span"
                  >
                    {() =>
                      this.messageReply.content
                        ? this.messageReply.content.msg
                        : ''
                    }
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
                    ref={this.linkContainer}
                  ></div>
                ) : (
                  ''
                )}

                <div class="robin-reply robin-w-100">
                  <div class="robin-file-upload">
                    {this.imageRegex.test(
                      this.checkAttachmentType(
                        this.messageReply.content.attachment
                      )
                    ) ? (
                      <img
                        src={this.messageReply.content.attachment}
                        alt={`${
                          this.getFileDetails(
                            this.messageReply.content.attachment
                          ).name
                        }-image`}
                      />
                    ) : (
                      ''
                    )}

                    {this.videoRegex.test(
                      this.checkAttachmentType(
                        this.messageReply.content.attachment
                      )
                    ) ? (
                      <div class="robin-video">
                        <video width="100%" height="100%" controls>
                          <source src={this.messageReply.content.attachment} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      ''
                    )}

                    {this.acceptedDocFiles.includes(
                      this.getFileDetails(this.messageReply.content.attachment)
                        .extension
                    ) ? (
                      <div class="robin-file">
                        <SvgIcon name="file" />
                        <Content as="span">
                          {() =>
                            this.getFileDetails(
                              this.messageReply.content.attachment
                            ).name.length > 6
                              ? this.getFileDetails(
                                  this.messageReply.content.attachment
                                ).name.substring(0, 6) + '..'
                              : this.getFileDetails(
                                  this.messageReply.content.attachment
                                ).name
                          }
                        </Content>
                        <Content as="span">
                          {() =>
                            '.' +
                            this.getFileDetails(
                              this.messageReply.content.attachment
                            ).extension
                          }
                        </Content>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
            ) : (
              ''
            )}
          </div>

          <div class="robin-reply-close">
            <IconButton
              name="remove"
              onClicked={() => this.handleReplyMessageClose()}
              to-emit={true}
              to-click-away={false}
            />
          </div>
        </div>
      );
    };

    const getNormalMessage = () => {
      return (
        <div
          class="robin-file-upload-container robin-squeezeOut"
          ref="popup-2"
          v-show={this.files && this.files.length > 0 && !this.recorder}
        >
          <div class="robin-wrapper robin-flex robin-flex-1 robin-pt-8 robin-pb-8 robin-pl-24 robin-pr-24 robin-overflow-y-auto">
            {this.files.map((file: Hashmap, index: number) => (
              <div class="robin-file-upload" key={`image-${index}`}>
                <div
                  class="robin-file-upload-delete"
                  onClick={() => this.removeFile(index)}
                >
                  <IconButton
                    name="close"
                    to-emit={false}
                    to-click-away={false}
                  />
                </div>

                {file.type.includes('image') ? (
                  <img
                    src={file.localUrl}
                    alt={`${file.name}-image`}
                    v-if="file.type.includes('image')"
                  />
                ) : (
                  ''
                )}

                {file.type.includes('video') ? (
                  <div class="robin-video">
                    <video
                      width="100%"
                      height="100%"
                      onClick={() => this.removeFile(index)}
                      controls
                    >
                      <source src={file.localUrl} type={file.type} />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  ''
                )}

                {this.acceptedDocFiles.includes(file.extension) ? (
                  <div class="robin-file">
                    <SvgIcon name="file" />
                    <Content as="span">
                      {() =>
                        file.name.length > 6
                          ? file.name.substring(0, 6) + '..'
                          : file.name
                      }
                    </Content>
                    <Content as="span">{() => '.' + file.extension}</Content>
                  </div>
                ) : (
                  ''
                )}
              </div>
            ))}
          </div>
          <div class="robin-file-upload-close">
            <IconButton
              name="remove"
              onClicked={() => this.handleFileUploadClose()}
              to-emit={true}
              to-click-away={false}
            />
          </div>
        </div>
      );
    };

    const getMessageBox = () => {
      return (
        <div class="robin-message-box">
          <div
            class="robin-emoji-container robin-emoji-out robin-squeezeOut"
            v-show={this.popUpState.emojiOpened}
            ref="popup-1"
            onKeydown={(event) => {
              const element = event.target as HTMLInputElement;
              if (event.keyCode === 13) {
                event.preventDefault();
                !this.replying ? this.sendMessage() : this.replyMessage();
              }
            }}
            tabindex="1"
          ></div>

          {getReplyContainer()}

          {getNormalMessage()}

          {getMessageInnerBox()}
        </div>
      );
    };

    const getMessageInnerBox = () => {
      return (
        <div
          class="robin-message-box-inner"
          onKeydown={(event) => {
            const element = event.target as any;
            if (element.keyCode === 13) {
              event.preventDefault();
              this.send(event);
            }
          }}
          tabindex="1"
        >
          {!this.isRecording ? (
            <div
              class="robin-mr-8"
              onClick={() => this.toggleAttachFilePopup()}
              data-testid="attach-file-button"
            >
              {!this.popUpState.opened ? (
                <IconButton
                  name="attachFileClose"
                  to-click-away={false}
                  to-emit={false}
                />
              ) : (
                <IconButton
                  name="attachFileOpen"
                  to-click-away={true}
                  to-emit={false}
                />
              )}
            </div>
          ) : (
            <div class="robin-ar-indicator robin-mr-8">
              <IconButton
                name="remove3"
                to-click-away={false}
                to-emit={true}
                onClicked={() => this.toggleRecorder(false)}
                data-testid="record-stop-button"
              />

              <div class="robin-ar-dot"></div>
            </div>
          )}
          <div class="robin-message-input" v-show={!this.isRecording}>
            <div class="robin-mt-4">
              <IconButton
                name="emoji"
                onClicked={() =>
                  !this.popUpState.emojiOpened
                    ? this.handleEmojiOpenPopUp()
                    : this.handleEmojiClosePopUp()
                }
                active={this.popUpState.emojiOpened}
                to-emit={true}
                to-click-away={false}
              />
            </div>
            <div
              class="robin-input-wrapper"
              tabindex="1"
              v-show={!this.isRecording}
            >
              <textarea
                class="robin-input"
                ref="input"
                onInput={(event) => this.enterText(event)}
                value={this.text}
                onKeydown={(event) => {
                  if (event.keyCode === 27) {
                    this.escapeText();
                  }
                }}
                placeholder="Type your message..."
                data-testid="input"
              ></textarea>
            </div>
          </div>
          <div
            class="robin-flex robin-flex-align-center robin-ml-auto robin-pl-21 robin-come-up"
            v-show={
              (this.text.trim().length > 0 ||
                this.files.length > 0 ||
                this.isRecording) &&
              !this.isUploading
            }
          >
            <div
              class="robin-ar-time robin-mr-8"
              v-show={this.isRecording}
              data-testid="current-time"
            >
              {this.currentTime}
            </div>
            <IconButton
              name="send"
              onSendmessage={() => this.send(null)}
              emit="sendmessage"
              to-emit={true}
              to-click-away={false}
              data-testid="send-button"
            />
          </div>
          <div
            class="robin-send-button-loader robin-ml-21"
            v-show={this.isUploading}
          >
            <div class="robin-spinner2"></div>
          </div>
          <div
            class="robin-ml-8"
            v-show={
              this.text.trim() == '' &&
              this.files.length < 1 &&
              !this.isUploading &&
              !this.isRecording &&
              this.isVoiceRecorderEnabled
            }
            onClick={() => this.toggleRecorder(true)}
            data-testid="record-start-button"
          >
            <IconButton name="voice" to-click-away={false} to-emit={false} />
          </div>

          <div class="robin-popup-container" v-show={this.popUpState.opened}>
            <AttachFilePopOver
              ref="popup-4"
              onFileUpload={(event: any) => this.handleFileUpload(event)}
              onOpenCamera={() => this.$emit('open-camera')}
              data-testid="attach-file-popover"
            />
          </div>
        </div>
      );
    };

    return getMessageBox();
  }
});
</script>
