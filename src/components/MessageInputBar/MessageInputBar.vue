<template>
  <div class="robin-message-input-box" v-clickaway="handleEmojiClosePopUp">
    <div
      class="robin-emoji-container robin-squeezeOut"
      v-show="popUpState.emojiOpened"
      ref="popup-1"
      @keydown.enter.exact.prevent="!replying ? sendMessage() : replyMessage()"
      tabindex="1"
    >
      <v-emoji-picker
        @select="selectEmoji"
        :emojisByRow="screenWidth > 768 ? 15 : 7"
        label-search="Search"
        lang="pt-BR"
        class="robin-emoji"
      />
    </div>

    <!-- reply message -->

    <div class="robin-reply-container robin-squeezeOut" ref="popup-3" v-show="replying">
      <div
        class="robin-wrapper robin-flex robin-flex-1 robin-pt-8 robin-pb-8 robin-pl-24 robin-pr-24 robin-overflow-y-auto"
      >
        <div class="robin-reply robin-w-100" v-if="!messageReply.has_attachment">
          <message-content
            :font-size="14"
            textWrap="pre-line"
            wordBreak="break-word"
            as="span"
            v-if="
              !validateLinkInMessage().containsEmail && !validateLinkInMessage().containsWebsite
            "
          >
            {{ messageReply.content ? messageReply.content.msg : '' }}
          </message-content>

          <div
            class="robin-link-container"
            v-html="injectHtml()"
            v-if="
              (validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) ||
              validateLinkInMessage().containsEmail ||
              validateLinkInMessage().containsWebsite
            "
          ></div>
        </div>

        <div class="robin-reply robin-w-100" v-else>
          <div class="robin-file-upload robin-flex">
            <img
              :src="messageReply.content.attachment"
              :alt="`${getFileDetails(messageReply.content.attachment).name}-image`"
              v-if="imageRegex.test(checkAttachmentType(messageReply.content.attachment))"
              loading="lazy"
            />
            <div
              class="robin-video"
              v-if="videoRegex.test(checkAttachmentType(messageReply.content.attachment))"
            >
              <video width="100%" height="100%" controls>
                <source :src="messageReply.content.attachment" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div
              class="robin-file"
              v-if="documentRegex.test(checkAttachmentType(messageReply.content.attachment))"
            >
              <svg-icon name="file" />
              <message-content as="span">
                {{
                  getFileDetails(messageReply.content.attachment).name.length > 6
                    ? getFileDetails(messageReply.content.attachment).name.substring(0, 6) + '..'
                    : getFileDetails(messageReply.content.attachment).name
                }}
              </message-content>
              <message-content as="span">
                {{ '.' + getFileDetails(messageReply.content.attachment).extension }}
              </message-content>
            </div>
          </div>
        </div>
      </div>
      <div class="robin-reply-close">
        <icon-button
          name="remove"
          @clicked="handleReplyMessageClose"
          :to-emit="true"
          :to-click-away="false"
        />
      </div>
    </div>

    <!-- normal message -->

    <div
      class="robin-file-upload-container robin-squeezeOut"
      ref="popup-2"
      v-show="files && files.length > 0 && !recorder"
    >
      <div
        class="robin-wrapper robin-flex robin-flex-1 robin-pt-8 robin-pb-8 robin-pl-24 robin-pr-24 robin-overflow-y-auto"
      >
        <div class="robin-file-upload" v-for="(file, index) in files" :key="`image-${index}`">
          <div class="robin-file-upload-delete" @click="removeFile(index)">
            <icon-button name="close" :to-emit="false" :to-click-away="false" />
          </div>

          <img
            :src="file.localUrl"
            alt="image"
            v-if="imageRegex.test(checkAttachmentType(file.file))"
            loading="lazy"
          />

          <div class="robin-video" v-if="videoRegex.test(checkAttachmentType(file.file))">
            <video width="100%" height="100%" @click="removeFile(index)" controls>
              <source :src="file.localUrl" :type="file.type" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div class="robin-file" v-if="documentRegex.test(checkAttachmentType(file.extension))">
            <svg-icon name="file" />
            <message-content as="span">
              {{ file.name.length > 6 ? file.name.substring(0, 6) + '..' : file.name }}
            </message-content>
            <message-content as="span">
              {{ '.' + file.extension }}
            </message-content>
          </div>
        </div>
      </div>
      <div class="robin-file-upload-close">
        <icon-button
          name="remove"
          @clicked="handleFileUploadClose"
          :to-emit="true"
          :to-click-away="false"
        />
      </div>
    </div>

    <div class="robin-message-box-inner" @keydown.enter.exact.prevent="send($event)" tabindex="1">
      <div
        class="robin-mr-8"
        @click="toggleAttachFilePopup()"
        v-if="!isRecording"
        data-testid="attach-file-button"
      >
        <icon-button
          name="attachFileClose"
          v-if="!popUpState.opened"
          :to-click-away="false"
          :to-emit="false"
        />
        <icon-button
          name="attachFileOpen"
          v-else
          @clickoutside="handleClosePopUp()"
          :to-click-away="true"
          :to-emit="false"
        />
      </div>
      <div class="robin-ar-indicator robin-mr-8" v-else>
        <icon-button
          name="remove3"
          :to-click-away="false"
          :to-emit="true"
          @clicked="toggleRecorder(false)"
          data-testid="record-stop-button"
        />

        <div class="robin-ar-dot"></div>
      </div>
      <div class="robin-message-input" v-show="!isRecording">
        <div class="robin-mt-4">
          <icon-button
            name="emoji"
            @clicked="!popUpState.emojiOpened ? handleEmojiOpenPopUp() : handleEmojiClosePopUp()"
            :active="popUpState.emojiOpened"
            :to-emit="true"
            :to-click-away="false"
          />
        </div>
        <div class="robin-input-wrapper" tabindex="1" v-show="!isRecording">
          <textarea
            class="robin-input"
            ref="input"
            @input="enterText($event)"
            :value="text"
            @keydown.esc="escapeText()"
            placeholder="Type your message..."
            data-testid="input"
          ></textarea>
        </div>
      </div>
      <div
        class="robin-flex robin-flex-align-center robin-ml-auto robin-pl-21 robin-come-up"
        v-show="(text.trim().length > 0 || files.length > 0 || isRecording) && !isUploading"
      >
        <message-content
          v-show="isRecording"
          class="robin-mr-8"
          :font-size="14"
          data-testid="current-time"
          >{{ currentTime }}</message-content
        >
        <icon-button
          name="send"
          @sendmessage="send(null)"
          emit="sendmessage"
          :to-emit="true"
          :to-click-away="false"
          data-testid="send-button"
        />
      </div>
      <div class="robin-send-button-loader robin-ml-21" v-show="isUploading">
        <div class="robin-spinner2"></div>
      </div>
      <div
        class="robin-ml-8"
        v-show="
          text.trim() == '' &&
          files.length < 1 &&
          !isUploading &&
          !isRecording &&
          isVoiceRecorderEnabled
        "
        @click="toggleRecorder(true)"
        data-testid="record-start-button"
      >
        <icon-button name="voice" :to-click-away="false" :to-emit="false" />
      </div>

      <div class="robin-popup-container" v-show="popUpState.opened">
        <attach-file-pop-up
          ref="popup-4"
          @file-upload="handleFileUpload"
          @open-camera="$emit('open-camera')"
          data-testid="attach-file-popover"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { VEmojiPicker } from 'v-emoji-picker'
import mime from 'mime'
import AudioRecorder from 'audio-recorder-polyfill'
import mpegEncoder from 'audio-recorder-polyfill/mpeg-encoder'
import EventBus from '@/event-bus'
import Component, { mixins } from 'vue-class-component'
import { createUUID } from '@/utils/helpers'
import store from '@/store/index'
import IconButton from '@/components/IconButton/IconButton.vue'
import { EmailRegex, WebsiteRegex, VideoRegex, ImageRegex, DocumentRegex } from '@/utils/constants'
import AttachFilePopUp from '../AttachFilePopUp/AttachFilePopUp.vue'
import Content from '@/components/Content/Content.vue'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import ConversationMixin from '@/mixins/conversation-mixins'

interface PopUpState {
  opened: boolean
  emojiOpened: boolean
}

const ComponentProps = mixins(ConversationMixin).extend({
  props: {
    capturedImage: {
      type: Object,
      default: (): ObjectType => {
        return {}
      }
    },
    messageReply: {
      type: Object,
      default: (): ObjectType => {
        return {}
      }
    }
  }
})

// eslint-disable-next-line
@Component<MessageInputBar>({
  name: 'MessageInputBar',
  components: {
    IconButton,
    AttachFilePopUp,
    'v-emoji-picker': VEmojiPicker,
    'message-content': Content,
    SvgIcon
  },
  watch: {
    capturedImage: function (image) {
      this.files.push({
        name: image.file.name,
        type: 'image/jpeg',
        extension: 'jpeg',
        localUrl: image.localUrl,
        file: image.file
      })
    },
    messageReply: {
      handler () {
        if (Object.keys(this.messageReply).length > 0) {
          this.replying = true
        } else {
          this.replying = false
        }
      },
      deep: true
    },
    text: {
      handler (val) {
        if (val === '') this.isManualSend = false
      }
    },
    files: {
      handler (val) {
        if (val.length === 0) this.isManualSend = false
      }
    },
    currentConversation: {
      handler () {
        this.resetState()
      },
      deep: true
    }
  }
})
export default class MessageInputBar extends ComponentProps {
  text = '' as string
  files = [] as Array<ObjectType>
  documentRegex = DocumentRegex
  isUploading = false as boolean
  replying = false as boolean
  currentTime = '00:00' as string
  elapsedTimer = null as any
  recorder = null as any
  isRecording = false as boolean
  sendRecording = false as boolean

  imageRegex = ImageRegex
  emailRegex = EmailRegex
  websiteRegex = WebsiteRegex
  videoRegex = VideoRegex
  retries = 0
  manualTimestamp = '' as string
  isManualSend = false

  popUpState: PopUpState = {
    opened: false,
    emojiOpened: false
  }

  currentConversation!: ObjectType
  isWebSocketConnected!: ObjectType
  isVoiceRecorderEnabled!: boolean
  screenWidth!: number
  showToast!: (message: string, info: string) => void
  secretKey: string | undefined
  encryptionKey: string | undefined
  iv: string | undefined
  encrypt!: (message: ObjectType) => string

  created () {
    EventBus.$on('manual.send', (message: ObjectType) => {
      this.manualSend(message)
    })
  }

  mounted () {
    this.handleConversationOpen()

    this.$nextTick(() => {
      this.resetState()
      this.focusInput()
    })
  }

  getElapsedTime (startTime: number) {
    const endTime = Number(new Date())
    let timeDiff = endTime - startTime

    timeDiff = timeDiff / 1000

    const seconds = `0${Math.floor(timeDiff % 60) % 60}`.slice(-2)
    const minutes = `0${Math.floor(timeDiff / 60) % 60}`.slice(-2)
    const hours = `0${Math.floor(timeDiff / 3600)}`.slice(-2)

    this.currentTime = `${hours}:${minutes}:${seconds}`
  }

  resetState () {
    const input = this.$refs.input as any

    input.value = ''
    input.style.height = 0
    this.text = ''
    this.files = []
    this.replying = false
    this.popUpState.emojiOpened = false
    this.recorder = null
    this.isRecording = false
    this.currentTime = '00:00'
    this.sendRecording = false
    this.manualTimestamp = ''
  }

  toggleManualSend () {
    if (this.manualTimestamp !== '') {
      this.isManualSend = true
    } else {
      this.isManualSend = false
    }
  }

  manualSend (message: ObjectType) {
    this.setInputState(message)
    this.toggleManualSend()

    const textMessage = {
      msg: message.content.msg,
      sender_token: message.sender_token,
      receiver_token: message.receiver_token,
      timestamp: this.manualTimestamp,
      local_id: message.content.local_id
    }

    // if message has a text
    if (textMessage.msg) {
      if (message.is_reply) {
        this.replyTextMessage(textMessage)
      } else {
        this.sendTextMessage(textMessage)
      }
    }

    // if message has a attachment
    if (message.content.attachment) {
      if (message.is_reply) {
        this.replyFileMessage({
          file: message.content.attachment,
          local_id: message.content.local_id
        })
      } else {
        this.sendFileMessage({ file: message.content.attachment, local_id: message.content.local_id })
      }

      // if message has both text and attachment
      if (textMessage.msg) {
        if (message.is_reply) {
          this.replyMessageWithAttachment({ file: message.content.attachment, local_id: message.content.local_id }, textMessage.msg)
        } else {
          this.sendMessageWithAttachment({ file: message.content.attachment, local_id: message.content.local_id }, textMessage.msg)
        }
      }
    }
  }

  setInputState (message: ObjectType): void {
    this.text = message.content.msg
    this.manualTimestamp = message.content.timestamp
  }

  send (event: any) {
    if (this.screenWidth <= 1024 && event && event.keyCode === 13) {
      this.newLine()
      this.calculateTextareaHeight()
      this.calculateTextareaHeight()
    } else {
      if (!this.replying && !this.isUploading) {
        this.sendMessage()
      }

      if (this.replying && !this.isUploading) {
        this.replyMessage()
      }

      if (!this.replying && !this.isUploading && this.isRecording) {
        this.sendRecording = true
        this.stopRecorder()
      }
    }
  }

  async sendMessage () {
    // Create the message object
    const uuid = createUUID(24)
    const message = {
      msg: this.text.trim(),
      sender_token: this.$user_token,
      receiver_token: this.currentConversation.receiver_token === this.$user_token
        ? this.currentConversation.sender_token
        : this.currentConversation.receiver_token,
      timestamp: new Date(),
      local_id: uuid
    }

    this.toggleManualSend()

    // Send the text message
    if (message.msg.length > 0 && this.files.length < 1) {
      this.sendTextMessage(message)
    }

    // Send the file messages
    const messages = this.text.trim().length
      ? this.files.map(file => ({
        file: file.file,
        local_id: createUUID(24)
      }))
      : this.files.map(file => ({ file: file.file, local_id: createUUID(24) }))

    await Promise.all(messages.map(file =>
      this.text.trim().length
        ? this.sendMessageWithAttachment(file, message.msg)
        : this.sendFileMessage(file)
    ))
  }

  async replyMessage () {
    // Create the message object
    const uuid = createUUID(24)
    const message = {
      msg: this.text.trim(),
      sender_token: this.$user_token,
      receiver_token: this.currentConversation.receiver_token === this.$user_token
        ? this.currentConversation.sender_token
        : this.currentConversation.receiver_token,
      timestamp: new Date(),
      local_id: uuid
    }

    this.toggleManualSend()

    // Send the text message
    if (message.msg.length > 0 && this.files.length < 1) {
      this.replyTextMessage(message)
    }

    // Send the file messages
    const messages = this.text.trim().length
      ? this.files.map(file => ({
        file: file.file,
        local_id: createUUID(24)
      }))
      : this.files.map(file => ({ file: file.file, local_id: createUUID(24) }))

    await Promise.all(messages.map(file =>
      this.text.trim().length
        ? this.replyMessageWithAttachment(file, message.msg)
        : this.replyFileMessage(file)
    ))
  }

  createOfflineMessage (type: string, data: ObjectType, attachment_msg: string, is_reply: boolean): ObjectType {
    const content = type === 'normal-message'
      ? {
          is_attachment: false,
          msg: data.msg,
          sender_token: this.$user_token,
          receiver_token:
              this.currentConversation.receiver_token === this.$user_token
                ? this.currentConversation.sender_token
                : this.currentConversation.receiver_token,
          timestamp: data.timestamp,
          local_id: data.local_id
        }
      : {
          attachment: data.file,
          mime_type: data.file.type,
          is_attachment: true,
          msg: attachment_msg,
          sender_token: this.$user_token,
          receiver_token:
              this.currentConversation.receiver_token === this.$user_token
                ? this.currentConversation.sender_token
                : this.currentConversation.receiver_token,
          timestamp: this.manualTimestamp !== '' ? this.manualTimestamp : new Date(),
          local_id: data.local_id
        }

    const offlineMessage = {
      _id: data.local_id,
      channel: this.$channel,
      created_at: content.timestamp,
      content: content,
      has_attachment: type !== 'normal-message',
      sender_token: this.$user_token,
      conversation_id: this.currentConversation._id,
      sender_name: this.$senderName,
      pseudo: true,
      reply_to: this.messageReply._id || '',
      is_reply
    }

    return offlineMessage
  }

  async sendTextMessage (message: ObjectType): Promise<void> {
    try {
      if (this.retries === 0 && !this.isManualSend) {
        this.isUploading = true
        // Send pseudo message.
        EventBus.$emit('new-pseudo-message', this.createOfflineMessage('normal-message', message, '', false))
      }

      const WebSocketMessage = { type: 1, content: message, channel: this.$channel, conversation_id: this.currentConversation._id, sender_token: this.$user_token, sender_name: this.$senderName }

      await this.$robin.sendMessageToConversation(
        this.encrypt(WebSocketMessage),
        this.$conn
      )

      this.isUploading = false

      // if WebSocket is not connected retry sending message
      if (!this.isWebSocketConnected) {
        if (this.retries < 3) {
          setTimeout(() => {
            this.retries++
            this.sendTextMessage(message)
          }, 5000)
        } else {
          this.showToast('Message failed to send.', 'error')

          EventBus.$emit('message-send-failed', {
            content: {
              msg: message.msg,
              local_id: message.local_id
            },
            conversation_id: this.currentConversation._id
          })

          this.retries = 0
        }
      }

      this.resetState()
    } catch (e: any) {
      this.isUploading = false
      if (e.message) {
        this.showToast('Opps, something went wrong.', 'error')
      }
    }
  }

  async sendFileMessage (file: ObjectType): Promise<void> {
    try {
      if (this.retries === 0 && !this.isManualSend) {
        this.isUploading = true
        // Send pseudo message.
        EventBus.$emit('new-pseudo-message', this.createOfflineMessage('file-message', file, '', false))
      }

      await this.$robin.sendMessageAttachment(
        this.$user_token,
        this.currentConversation._id,
        file.file,
        this.$senderName,
        '',
        file.local_id
      )

      this.isUploading = false

      if (!this.isWebSocketConnected) {
        // Retry upload.
        if (this.retries < 3) {
          setTimeout(async () => {
            this.retries++
            await this.sendFileMessage(file)
          }, 5000)
        } else {
          this.showToast('Message failed to send.', 'error')

          EventBus.$emit('message-send-failed', {
            content: {
              attachment: file.file,
              local_id: file.local_id
            },
            conversation_id: this.currentConversation._id
          })

          this.retries = 0
        }
      }

      this.resetState()
    } catch (e: any) {
      this.isUploading = false

      if (e.message) {
        this.showToast('Opps, something went wrong.', 'error')
      }
    }
  }

  async sendMessageWithAttachment (file: ObjectType, msg: string): Promise<void> {
    try {
      if (this.retries === 0 && !this.isManualSend) {
        this.isUploading = true
        // Send pseudo message.
        EventBus.$emit('new-pseudo-message', this.createOfflineMessage('file-message', file, msg, false))
      }

      await this.$robin.sendMessageAttachment(
        this.$user_token,
        this.currentConversation._id,
        file.file,
        this.$senderName,
        msg,
        file.local_id
      )

      this.isUploading = false

      if (!this.isWebSocketConnected) {
        // Retry upload.
        if (this.retries < 3) {
          setTimeout(async () => {
            this.retries++
            await this.sendMessageWithAttachment(file, msg)
          }, 5000)
        } else {
          this.showToast('Message failed to send', 'error')

          EventBus.$emit('message-send-failed', {
            content: {
              attachment: file.file,
              msg: msg,
              local_id: file.local_id
            },
            conversation_id: this.currentConversation._id
          })

          this.retries = 0
        }
      }

      this.resetState()
    } catch (e: any) {
      this.isUploading = false

      if (e.message) {
        this.showToast('Opps, something went wrong.', 'error')
      }
    }
  }

  async replyTextMessage (message: ObjectType): Promise<void> {
    try {
      const robin = this.$robin as any

      if (this.retries === 0 && !this.isManualSend) {
        this.isUploading = true

        // Send pseudo message.
        EventBus.$emit('new-pseudo-message', this.createOfflineMessage('normal-message', message, '', true))
      }

      const WebSocketMessage = { type: 1, content: message, channel: this.$channel, conversation_id: this.currentConversation._id, reply_to: this.messageReply._id, sender_token: this.$user_token, is_reply: true, sender_name: this.$senderName }
      await robin.replyToMessage(
        this.encrypt(WebSocketMessage),
        this.$conn
      )

      this.isUploading = false

      if (!this.isWebSocketConnected) {
        // Retry upload.
        if (this.retries < 3) {
          setTimeout(() => {
            this.retries++
            this.replyTextMessage(message)
          }, 5000)
        } else {
          this.showToast('Message failed to send.', 'error')

          EventBus.$emit('message-send-failed', {
            content: {
              msg: message.msg,
              local_id: message.local_id
            },
            conversation_id: this.currentConversation._id
          })

          this.retries = 0
        }
      }

      this.resetState()
    } catch (e: any) {
      this.isUploading = false

      if (e.message) {
        this.showToast('Opps, something went wrong.', 'error')
      }
    }
  }

  async replyFileMessage (file: ObjectType): Promise<void> {
    try {
      const robin = this.$robin as any

      if (this.retries === 0 && !this.isManualSend) {
        this.isUploading = true

        // Send pseudo message.
        EventBus.$emit('new-pseudo-message', this.createOfflineMessage('file-message', file, '', true))
      }

      await robin.replyMessageWithAttachment(
        this.$user_token,
        this.currentConversation._id,
        this.messageReply._id,
        file.file,
        this.$senderName,
        '',
        file.local_id
      )

      this.isUploading = false

      if (!this.isWebSocketConnected) {
        this.retries += 1
        // Retry upload.
        if (this.retries < 3) {
          setTimeout(async () => {
            await this.replyFileMessage(file)
          }, 1000)
        } else {
          this.showToast('Message failed to send.', 'error')

          EventBus.$emit('message-send-failed', {
            content: {
              attachment: file.file,
              local_id: file.local_id
            },
            conversation_id: this.currentConversation._id
          })

          this.retries = 0
        }
      }

      this.resetState()
    } catch (e: any) {
      this.isUploading = false

      if (e.message) {
        this.showToast('Opps, something went wrong.', 'error')
      }
    }
  }

  async replyMessageWithAttachment (file: ObjectType, msg: string): Promise<void> {
    try {
      const robin = this.$robin as any

      if (this.retries === 0 && !this.isManualSend) {
        this.isUploading = true

        // Send pseudo message.
        EventBus.$emit('new-pseudo-message', this.createOfflineMessage('file-message', file, msg, true))
      }

      await robin.replyMessageWithAttachment(
        this.$user_token,
        this.currentConversation._id,
        this.messageReply._id,
        file.file,
        this.$senderName,
        msg,
        file.local_id
      )

      this.isUploading = false

      if (!this.isWebSocketConnected) {
        this.retries += 1
        // Retry upload.
        if (this.retries < 3) {
          setTimeout(async () => {
            await this.replyMessageWithAttachment(file, msg)
          }, 1000)
        } else {
          this.showToast('Message failed to send.', 'error')

          EventBus.$emit('message-send-failed', {
            content: {
              msg,
              attachment: file.file,
              local_id: file.local_id
            },
            conversation_id: this.currentConversation._id
          })

          this.retries = 0
        }
      }

      this.resetState()
    } catch (e: any) {
      this.isUploading = false

      if (e.message) {
        this.showToast('Opps, something went wrong.', 'error')
      }
    }
  }

  enterText (event: any): void {
    this.text = event.target.value
    this.calculateTextareaHeight()
  }

  escapeText (): void {
    const input = this.$refs.input as any
    input.value = ''
    this.text = ''
    input.style.height = 0
  }

  selectEmoji (emoji: any): void {
    if (this.text.length > 0) this.text += ` ${emoji.data}`
    else this.text += `${emoji.data}`

    this.focusInput()
  }

  focusInput () {
    const input = this.$refs.input as HTMLInputElement
    if (input) {
      input.focus()
    }
  }

  handleEmojiOpenPopUp (): void {
    const popup = this.$refs['popup-1'] as any
    popup.classList.remove('robin-squeezeIn')

    this.popUpState.emojiOpened = true
  }

  handleEmojiClosePopUp (): void {
    const popup = this.$refs['popup-1'] as any
    popup.classList.remove('robin-squeezeOut')
    popup.classList.add('robin-squeezeIn')

    window.setTimeout(() => {
      popup.classList.remove('robin-squeezeIn')
      popup.classList.add('robin-squeezeOut')

      this.popUpState.emojiOpened = false
    }, 100)
  }

  toggleAttachFilePopup (): void {
    this.popUpState.opened = !this.popUpState.opened
  }

  handleClosePopUp (): void {
    const popup = this.$refs['popup-4'] as any
    if (popup) {
      popup.$refs['popup-body'].classList.remove('robin-zoomIn')
      popup.$refs['popup-body'].classList.add('robin-zoomOut')

      window.setTimeout(() => {
        popup.$refs['popup-body'].classList.add('robin-zoomIn')
        popup.$refs['popup-body'].classList.remove('robin-zoomOut')

        this.popUpState.opened = false
      }, 300)
    }
  }

  handleFileUpload (file: any) {
    this.files.push(file)

    this.recorder = null
  }

  handleFileUploadClose (): void {
    const popup = this.$refs['popup-2'] as any
    popup.classList.remove('robin-squeezeOut')
    popup.classList.add('robin-squeezeIn')

    window.setTimeout(() => {
      popup.classList.remove('robin-squeezeIn')
      popup.classList.add('robin-squeezeOut')

      this.files = []
    }, 100)
  }

  removeFile (index: number): void {
    if (this.files.length > 1) {
      this.files.splice(index, 1)
    } else {
      const popup = this.$refs['popup-2'] as any
      popup.classList.remove('robin-squeezeOut')
      popup.classList.add('robin-squeezeIn')

      window.setTimeout(() => {
        popup.classList.remove('robin-squeezeIn')
        popup.classList.add('robin-squeezeOut')

        this.files = []
      }, 100)
    }
  }

  handleReplyMessageClose (): void {
    const popup = this.$refs['popup-3'] as any
    popup.classList.remove('robin-squeezeOut')
    popup.classList.add('robin-squeezeIn')

    window.setTimeout(() => {
      popup.classList.remove('robin-squeezeIn')
      popup.classList.add('robin-squeezeOut')

      this.$emit('on-close-reply')
      store.setState('isImageReplying', false)
    }, 100)
  }

  checkAttachmentType (attachment: any): string {
    let strArr = [] as Array<string>

    if (typeof attachment !== 'string') {
      strArr = attachment.name.split('.')
    } else {
      strArr = attachment.split('.')
    }

    return `${mime.getType(strArr[strArr.length - 1])}`
  }

  getFileDetails (attachmentUrl: string): { name: any; extension: any } {
    const fileName = attachmentUrl.substring(attachmentUrl.lastIndexOf('/') + 1)
    const strArr = fileName.split('.')

    return {
      name: strArr[strArr.length - 2],
      extension: strArr[strArr.length - 1]
    }
  }

  validateLinkInMessage () {
    const messageReply = this.messageReply.content ? this.messageReply.content.msg : ''
    const texts = messageReply.split(' ')

    return {
      containsWebsite: texts.some((text: string) => this.websiteRegex.test(text)),
      containsEmail: texts.some((text: string) => this.emailRegex.test(text))
    }
  }

  injectHtml (): string {
    let returnedMessage = ''
    const messageReply = this.messageReply.content ? this.messageReply.content.msg : ''

    for (const word of messageReply.split(' ')) {
      if (this.emailRegex.test(word)) {
        returnedMessage += String.raw` <a target="_blank" href="mailto:${word}" > ${word} <a/>`
      } else if (this.websiteRegex.test(word)) {
        if (word.includes('http://') || word.includes('https://')) {
          returnedMessage += String.raw` <a target="_blank" href="${word}" > ${word} <a/>`
        } else {
          returnedMessage += String.raw` <a target="_blank" href="http://${word}"> ${word} <a/>`
        }
      } else {
        returnedMessage += ` ${word}`
      }
    }

    return returnedMessage
  }

  handleConversationOpen (): void {
    EventBus.$on('currentConversation-opened', () => {
      const input = this.$refs.input as any
      setTimeout(() => {
        if (input) {
          input.focus()
        }
      }, 50)
    })
  }

  newLine () {
    const input = this.$refs.input as any
    input.value += '\n'
  }

  calculateTextareaHeight (): void {
    const input = this.$refs.input as any

    if (!input) return

    const padding = window
      .getComputedStyle(input, null)
      .getPropertyValue('padding-top')
      .replace('px', '') as any
    input.style.height = 0
    input.style.height = input.scrollHeight - padding * 2 + 'px'
    input.style.lineHeight = 1.5

    if (input.style.height === '12px' || input.style.height === '16px') {
      input.style.lineHeight = 1
    } else {
      input.style.lineHeight = 1.5
    }
  }

  toggleRecorder (record: boolean): void {
    if (record) {
      this.startRecorder()
    } else {
      this.stopRecorder()
    }
  }

  startRecorder () {
    AudioRecorder.encoder = mpegEncoder
    AudioRecorder.prototype.mimeType = 'audio/mpeg'
    window.MediaRecorder = AudioRecorder

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.recorder = new MediaRecorder(stream)

      // Set record to <audio> when recording will be finished
      this.recorder.addEventListener('dataavailable', (event: { data: any }) => {
        const uuid = createUUID(36)
        const file = new File([event.data], `${uuid}.mp3`, {
          type: event.data.type
        })

        this.files.push({
          name: `${uuid}`,
          size: event.data.size,
          type: event.data.type,
          audio: true,
          extension: 'mp3',
          localUrl: URL.createObjectURL(event.data),
          file
        })

        if (!this.replying && this.sendRecording) this.sendMessage()

        if (this.replying && this.sendRecording) this.replyMessage()

        if (!this.sendRecording) this.files = []
      })

      // Start recording
      this.recorder.start()

      this.isRecording = true
      const startTime = new Date()

      this.elapsedTimer = setInterval(() => {
        this.getElapsedTime(Number(startTime))
      }, 1000)
    })
  }

  stopRecorder (): void {
    this.recorder.stop()
    clearInterval(this.elapsedTimer)
    this.isRecording = false
    this.currentTime = '00:00'

    // Remove “recording” icon from browser tab
    this.recorder.stream.getTracks().forEach((i: any) => i.stop())
  }
}
</script>
