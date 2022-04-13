<template>
  <div class="robin-message-box" v-on-clickaway="handleEmojiClosePopUp">
    <div class="robin-emoji-container robin-emoji-out robin-squeezeOut" v-show="popUpState.emojiOpened" ref="popup-1" @keydown.enter.exact.prevent="!replying ? sendMessage() : replyMessage()" tabindex="1">
      <VEmojiPicker @select="selectEmoji" :emojisByRow="screenWidth > 768 ? 15 : 7" label-search="Search" lang="pt-BR" class="robin-emoji" />
    </div>

    <!-- reply message -->

    <div class="robin-reply-container robin-squeezeOut" ref="popup-3" v-show="replying">
      <div class="robin-wrapper robin-flex robin-flex-1 robin-pt-8 robin-pb-8 robin-pl-24 robin-pr-24 robin-overflow-y-auto">
        <div class="robin-reply robin-w-100" v-if="!messageReply.has_attachment">
          <Content :font-size="10" textWrap="pre-line" wordBreak="break-word" as="span" v-if="!validateLinkInMessage().containsEmail && !validateLinkInMessage().containsWebsite">
            {{ messageReply.content ? messageReply.content.msg : '' }}
          </Content>

          <div class="robin-link-container" v-html="injectHtml()" v-if="(validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) || validateLinkInMessage().containsEmail || validateLinkInMessage().containsWebsite"></div>
        </div>

        <div class="robin-reply robin-w-100" v-else>
          <div class="robin-file-upload">
            <img :src="messageReply.content.attachment" :alt="`${getFileDetails(messageReply.content.attachment).name}-image`" v-if="imageRegex.test(checkAttachmentType(messageReply.content.attachment))" />

            <div class="robin-video" v-if="videoRegex.test(checkAttachmentType(messageReply.content.attachment))">
              <video width="100%" height="100%" controls>
                <source :src="messageReply.content.attachment" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div class="robin-file" v-if="acceptedDocFiles.includes(getFileDetails(messageReply.content.attachment).extension)">
              <SvgIcon name="file" />
              <Content as="span">
                {{ getFileDetails(messageReply.content.attachment).name.length > 6 ? getFileDetails(messageReply.content.attachment).name.substring(0, 6) + '..' : getFileDetails(messageReply.content.attachment).name }}
              </Content>
              <Content as="span">
                {{ '.' + getFileDetails(messageReply.content.attachment).extension }}
              </Content>
            </div>
          </div>
        </div>
      </div>
      <div class="robin-reply-close">
        <IconButton name="remove" @clicked="handleReplyMessageClose" :to-emit="true" :to-click-away="false" />
      </div>
    </div>

    <!-- normal message -->

    <div class="robin-file-upload-container robin-squeezeOut" ref="popup-2" v-show="files && files.length > 0 && !recorder">
      <div class="robin-wrapper robin-flex robin-flex-1 robin-pt-8 robin-pb-8 robin-pl-24 robin-pr-24 robin-overflow-y-auto">
        <div class="robin-file-upload" v-for="(file, index) in files" :key="`image-${index}`">
          <div class="robin-file-upload-delete" @click="removeFile(index)">
            <IconButton name="close" :to-emit="false" :to-click-away="false" />
          </div>

          <img :src="file.localUrl" :alt="`${file.name}-image`" v-if="file.type.includes('image')" />

          <div class="robin-video" v-if="file.type.includes('video')">
            <video width="100%" height="100%" @click="removeFile(index)" controls>
              <source :src="file.localUrl" :type="file.type" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div class="robin-file" v-if="acceptedDocFiles.includes(file.extension)">
            <SvgIcon name="file" />
            <Content as="span">
              {{ file.name.length > 6 ? file.name.substring(0, 6) + '..' : file.name }}
            </Content>
            <Content as="span">
              {{ '.' + file.extension }}
            </Content>
          </div>
        </div>
      </div>
      <div class="robin-file-upload-close">
        <IconButton name="remove" @clicked="handleFileUploadClose" :to-emit="true" :to-click-away="false" />
      </div>
    </div>

    <div class="robin-message-box-inner" @keydown.enter.exact.prevent="send()" tabindex="1">
      <!-- v-show="text.trim() == '' && files.length < 1 && !isUploading" -->
      <div class="robin-mr-8" @click="handleOpenPopUp()" v-if="!isRecording">
        <IconButton name="attachFileClose" v-if="!popUpState.opened" :to-click-away="false" :to-emit="false" />
        <IconButton name="attachFileOpen" v-else @clicked="handleClosePopUp()" @clickoutside="handleClosePopUp()" :to-click-away="true" :to-emit="true" />
      </div>
      <div class="robin-ar-indicator robin-mr-8" v-else>
        <IconButton name="remove3" :to-click-away="false" :to-emit="true" @clicked="toggleRecorder(false)" />

        <div class="robin-ar-dot"></div>
      </div>
      <div class="robin-message-input" v-show="!isRecording">
        <div class="robin-mt-4">
          <IconButton name="emoji" @clicked="!popUpState.emojiOpened ? handleEmojiOpenPopUp() : handleEmojiClosePopUp()" :active="popUpState.emojiOpened" :to-emit="true" :to-click-away="false" />
        </div>
        <div class="robin-input-wrapper" tabindex="1" v-show="!isRecording">
          <textarea class="robin-input" ref="input" @input="enterText($event)" :value="text" @keydown.esc="escapeText()" placeholder="Type your message..."></textarea>
        </div>
      </div>
      <div class="robin-flex robin-flex-align-center robin-ml-auto robin-pl-21 robin-come-up" v-show="(text.trim().length > 0 || files.length > 0 || isRecording) && !isUploading">
        <div class="robin-ar-time robin-mr-8" v-show="isRecording">
          {{ currentTime }}
        </div>
        <IconButton name="send" @sendmessage="send()" emit="sendmessage" :to-emit="true" :to-click-away="false" />
      </div>
      <div class="robin-send-button-loader robin-ml-21" v-show="isUploading">
        <div class="robin-spinner2"></div>
      </div>
      <div class="robin-ml-8" v-show="text.trim() == '' && files.length < 1 && !isUploading && !isRecording" @click="toggleRecorder(true)">
        <IconButton name="voice" :to-click-away="false" :to-emit="false" />
      </div>

      <div class="robin-popup-container" v-show="popUpState.opened">
        <AttachFilePopOver ref="popup-4" @file-upload="handleFileUpload" @open-camera="$emit('open-camera')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { VEmojiPicker } from 'v-emoji-picker'
import { mixin as clickaway } from 'vue-clickaway'
import mime from 'mime'
import AudioRecorder from 'audio-recorder-polyfill'
import mpegEncoder from 'audio-recorder-polyfill/mpeg-encoder'
import EventBus from '@/event-bus'
import Component from 'vue-class-component'
import store from '@/store/index'
import IconButton from '@/components/IconButton/IconButton.vue'
import AttachFilePopOver from '../AttachFilePopOver/AttachFilePopOver.vue'
import Content from '@/components/Content/Content.vue'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'

interface PopUpState {
  opened: boolean
  emojiOpened: boolean
}

const ComponentProps = Vue.extend({
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
  }
})

// eslint-disable-next-line
@Component<MessageInputBar>({
  name: 'MessageInputBar',
  mixins: [clickaway],
  components: {
    IconButton,
    AttachFilePopOver,
    VEmojiPicker,
    Content,
    SvgIcon
  },
  watch: {
    capturedImage: function (image) {
      this.files.push({
        name: 'captured-image',
        type: 'image/jpeg',
        extension: 'jpeg',
        localUrl: image.localUrl,
        file: image.file
      })
    },
    messageReply: {
      handler (val) {
        if (Object.keys(this.messageReply).length > 0) {
          this.replying = true
        } else {
          this.replying = false
        }
      },
      deep: true
    },
    currentConversation: {
      handler (val) {
        this.resetState()
      },
      deep: true
    }
  }
})
export default class MessageInputBar extends ComponentProps {
  text = '' as string
  files = [] as Array<any>
  acceptedDocFiles = '.xls, .doc, .ppt, .txt, .pdf, .csv, .html, .zip, .psd, .mp3' as string
  isUploading = false as boolean
  replying = false as boolean
  screenWidth = 0 as number
  currentTime = '00:00' as string
  elapsedTimer = null as any
  recorder = null as any
  isRecording = false as boolean
  sendRecording = false as boolean

  imageRegex = /^image/ as any
  emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  websiteRegex = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
  videoRegex = /^video/ as any

  popUpState: PopUpState = {
    opened: false,
    emojiOpened: false
  }

  mounted () {
    this.handleConversationOpen()

    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
  }

  get checkFileFormat () {
    return this.files.some((file) => file.type.includes('image'))
  }

  get currentConversation () {
    return store.state.currentConversation
  }

  getElapsedTime (startTime: any) {
    const endTime = new Date() as any
    let timeDiff = endTime - startTime

    timeDiff = timeDiff / 1000

    let seconds = Math.floor(timeDiff % 60) as any
    seconds = seconds < 10 ? '0' + seconds : seconds

    timeDiff = Math.floor(timeDiff / 60)

    let minutes = (timeDiff % 60) as any
    minutes = minutes < 10 ? '0' + minutes : minutes

    timeDiff = Math.floor(timeDiff / 60)

    const hours = timeDiff % 24

    timeDiff = Math.floor(timeDiff / 24)

    const days = timeDiff

    let totalHours = (hours + days * 24) as any
    totalHours = totalHours < 10 ? '0' + totalHours : totalHours

    if (totalHours === '00') {
      this.currentTime = minutes + ':' + seconds
    } else {
      this.currentTime = totalHours + ':' + minutes + ':' + seconds
    }
  }

  resetState () {
    const input = this.$refs.input as any

    input.value = ''
    input.style.height = 0
    this.text = ''
    this.files = []
    this.isUploading = false
    this.replying = false
    this.popUpState.emojiOpened = false
    this.recorder = null
    this.isRecording = false
    this.currentTime = '00:00'
    this.sendRecording = false
  }

  send () {
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

  sendMessage (): any {
    if (this.files.length > 0 && this.text.trim().length === 0) {
      this.sendFileMessage()
    } else if (this.text.trim().length > 0 && this.files.length < 1) {
      this.sendTextMessage()
    } else if (this.text.trim().length > 0 && this.files.length > 1) {
      Promise.all([this.sendTextMessage(), this.sendFileMessage()])
    } else if (this.text.trim().length > 0 && this.files.length === 1) {
      this.sendMessageWithAttachment()
    }
  }

  async replyMessage () {
    if (this.files.length > 0 && this.text.trim().length === 0) {
      this.replyFileMessage()
    } else if (this.text.trim().length > 0 && this.files.length < 1) {
      this.replyTextMessage()
    } else if (this.text.trim().length > 0 && this.files.length > 1) {
      Promise.all([this.replyTextMessage(), this.replyFileMessage()])
    } else if (this.text.trim().length > 0 && this.files.length === 1) {
      this.replyMessageWithAttachment()
    }
  }

  async sendTextMessage () {
    this.isUploading = true

    try {
      const message = {
        msg: this.text,
        sender_token: this.$user_token,
        receiver_token: this.conversation.receiver_token === this.$user_token ? this.conversation.sender_token : this.conversation.receiver_token,
        timestamp: new Date()
      }
      await this.$robin.sendMessageToConversation(
        {
          ...message
        },
        this.$conn,
        this.$channel,
        this.conversation._id,
        this.$user_token,
        this.$senderName
      )

      this.resetState()
    } catch (e) {
      this.isUploading = false

      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  async sendFileMessage (): Promise<void> {
    this.isUploading = true

    try {
      await Promise.all(
        this.files.map(async (file) => {
          await this.$robin.sendMessageAttachment(this.$user_token, this.conversation._id, file.file, this.$senderName)
        })
      )

      this.resetState()
    } catch (e) {
      this.isUploading = false

      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  async sendMessageWithAttachment (): Promise<void> {
    this.isUploading = true

    try {
      await Promise.all(
        this.files.map(async (file) => {
          await this.$robin.sendMessageAttachment(this.$user_token, this.conversation._id, file.file, this.$senderName, this.text)
        })
      )

      this.resetState()
    } catch (e) {
      this.isUploading = false

      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  async replyTextMessage (): Promise<void> {
    this.isUploading = true

    try {
      const robin = this.$robin as any
      const message = {
        msg: this.text,
        sender_token: this.$user_token,
        receiver_token: this.conversation.receiver_token === this.$user_token ? this.conversation.sender_token : this.conversation.receiver_token,
        timestamp: new Date()
      }
      await robin.replyToMessage(
        {
          ...message
        },
        this.$conn,
        this.$channel,
        this.conversation._id,
        this.messageReply._id,
        this.$user_token,
        this.$senderName
      )
      this.resetState()
    } catch (e) {
      this.isUploading = false

      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  async replyFileMessage (): Promise<void> {
    this.isUploading = true

    try {
      const robin = this.$robin as any
      await Promise.all(
        this.files.map(async (file) => {
          await robin.replyMessageWithAttachment(this.$user_token, this.conversation._id, this.messageReply._id, file.file, this.$senderName)
        })
      )

      this.resetState()
    } catch (e) {
      this.isUploading = false

      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  async replyMessageWithAttachment (): Promise<void> {
    this.isUploading = true

    try {
      const robin = this.$robin as any
      await Promise.all(
        this.files.map(async (file) => {
          await robin.replyMessageWithAttachment(this.$user_token, this.conversation._id, this.messageReply._id, file.file, this.$senderName, this.text)
        })
      )

      this.resetState()
    } catch (e) {
      this.isUploading = false

      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
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
    console.log(emoji)
    this.text += ` ${emoji.data} `
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

  handleOpenPopUp (): void {
    this.popUpState.opened = true
  }

  handleClosePopUp (): void {
    const popup = this.$refs['popup-4'] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomIn')
    popup.$refs['popup-body'].classList.add('robin-zoomOut')
    console.log(popup.$refs['popup-body'].classList)

    window.setTimeout(() => {
      popup.$refs['popup-body'].classList.add('robin-zoomIn')
      popup.$refs['popup-body'].classList.remove('robin-zoomOut')

      this.popUpState.opened = false
    }, 300)
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

  checkAttachmentType (attachmentUrl: String): string {
    const strArr = attachmentUrl.split('.')

    if (mime.getType(strArr[strArr.length - 1]) === 'application/msword') {
      return 'doc'
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

  injectHtml (): String {
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
    EventBus.$on('conversation-opened', (_: any) => {
      const input = this.$refs.input as any
      setTimeout(() => {
        if (input) {
          input.focus()
        }
      }, 50)
    })
  }

  onResize () {
    this.screenWidth = window.innerWidth
  }

  calculateTextareaHeight (): void {
    const input = this.$refs.input as any

    if (!input) return

    const padding = window.getComputedStyle(input, null).getPropertyValue('padding-top').replace('px', '') as any
    input.style.height = 0
    input.style.height = input.scrollHeight - padding * 2 + 'px'
    input.style.lineHeight = 1.5

    if (input.style.height === '12px' || input.style.height === '16px') {
      input.style.lineHeight = 1
    } else {
      input.style.lineHeight = 1.5
    }
  }

  createUuid (length: number) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
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
        const file = new File([event.data], `${this.createUuid(30)}.mp3`, {
          type: event.data.type
        })

        this.files.push({
          name: `${this.createUuid(30)}`,
          size: event.data.size,
          type: event.data.type,
          audio: true,
          extension: 'mp3',
          localUrl: URL.createObjectURL(event.data),
          file
        })

        console.log(this.files)

        if (!this.replying && this.sendRecording) this.sendMessage()

        if (this.replying && this.sendRecording) this.replyMessage()

        if (!this.sendRecording) this.files = []
      })

      // Start recording
      this.recorder.start()

      this.isRecording = true
      const startTime = new Date()

      this.elapsedTimer = setInterval(() => {
        this.getElapsedTime(startTime)
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

<style scoped>
.robin-message-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.robin-emoji-container {
  width: 100%;
  z-index: 1;
}

.robin-emoji-container:focus {
  outline: none;
}

.robin-emoji-out {
  position: absolute;
  top: -426px;
  left: 0;
  transform-origin: bottom;
}

.robin-emoji {
  width: 100% !important;
}

.robin-file-upload-container {
  box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.07);
  width: 100%;
  flex: 1;
  height: 140px;
  /* top: -140px;
  left: 0;
  bottom: 0; */
  transform-origin: bottom;
  display: flex;
  align-items: center;
  background-color: #fff;
  /* position: absolute; */
  z-index: 1;
}

.robin-reply-container {
  box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.07);
  width: 100%;
  flex: 1;
  height: max-content;
  display: flex;
  align-items: center;
  transform-origin: bottom;
  background-color: #fff;
}

.robin-file-upload-container .robin-wrapper,
.robin-reply-container .robin-wrapper {
  gap: 1rem;
}

.robin-file-upload-container img {
  width: 100px;
  height: 100px;
}

.robin-file-upload .robin-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 104px;
  height: 104px;
  border: 1px solid #f4f6f8;
  padding: 1rem 1rem;
}

.robin-file > .material-icon {
  color: var(--primary-color);
  font-size: 1.3rem;
}

.robin-file-upload .robin-video {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 104px;
  height: 104px;
  border: 1px solid #f4f6f8;
}

.robin-message-box-inner {
  background-color: #fff;
  box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.07);
  width: 100%;
/* height: 44px; */
  display: flex;
  align-items: center;
  padding: clamp(1rem, 4vh, 1.1175rem) min(5%, 2.688rem) clamp(1rem, 4vh, 1.175rem) 1rem;
  position: relative;
  z-index: 2;
}

.robin-message-box-inner:focus {
  outline: 0;
}

/* Input styles */
.robin-message-input {
  flex: 1;
  background-color: #fbfbfb;
  border: 1px solid #9999bc;
  border-radius: 24px;
  display: flex;
  align-items: center;
  padding: 0 0 0 clamp(3%, 5vw, 2.063rem);
  transition: background-color 200ms;
}

.robin-message-input:focus-within {
  background-color: #fff;
}

.robin-input-wrapper {
  width: 100%;
  position: relative;
}

.robin-input {
  width: 100%;
  min-width: 100%;
  min-height: 20px;
  height: 20px;
  max-height: 500px;
  background-color: transparent;
  border: none;
  font-size: 1rem;
  line-height: 1;
  /* white-space: pre-wrap; */
  /* word-wrap: break-word; */
  text-align: left;
  overflow: hidden;
  box-sizing: content-box;

  /* textarea */
  resize: none;
  padding: 1rem 0.625rem 0.5rem 0.625rem;
}

.robin-input::placeholder {
  white-space: nowrap;
}

.robin-popup-container {
  position: absolute;
  top: -150px;
  left: 12px;
  /* right: 89px; */
  z-index: 100;
}

.robin-file-upload,
.robin-reply {
  position: relative;
  word-break: break-word;
  /* font-size: 0.8rem; */
}

.robin-reply {
  background-color: #f4f6f8;
  padding: 1rem;
}

.robin-reply .robin-file-upload img {
  width: 80px;
}

.robin-reply .robin-file-upload .robin-file {
  background-color: #fff;
}

.robin-file-upload-close,
.robin-reply-close {
  flex: 1;
  max-width: 50px;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -1px 0px 20px -10px rgba(35, 107, 248, 0.2);
}

.robin-file-upload-delete {
  position: absolute;
  top: -3px;
  left: -7px;
  z-index: 3;
  transition: transform 0.4s;
}

.robin-file-upload-delete:hover {
  transform: scale(1.1);
}

.robin-send-button-loader {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #15ae73;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: default;
}

a {
  display: block;
  text-decoration: none;
  color: #4568d1;
  max-width: 220px;
}

.robin-link-container {
  font-size: 0.625rem;
}

.robin-link-container >>> a {
  color: #4568d1;
}

/* Input focus */
.robin-input:focus {
  outline: none;
}

/* Input placeholder */
::placeholder {
  font-size: 1rem;
  color: #cccccc;
}

::-moz-placeholder {
  font-size: 1rem;
  color: #cccccc;
}

:-ms-input-placeholder {
  font-size: 1rem;
  color: #cccccc;
}

::-ms-input-placeholder {
  font-size: 1rem;
  color: #cccccc;
}

.robin-ar-indicator {
  display: flex;
  align-items: center;
  gap: 0 0.5rem;
}

.robin-ar-dot {
  height: 15px;
  width: 15px;
  border-radius: 50%;
  background-color: #d53120;
  animation: record-scaling 0.8s ease-in-out infinite alternate;
}

@media (min-width: 768px) {
  .robin-file-upload-container .robin-wrapper::-webkit-scrollbar,
  .robin-reply-container .robin-wrapper::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-track {
    /* border: 1px solid #00000017; */
    border-radius: 24px;
  }

  ::-webkit-scrollbar-thumb {
    width: 2px;
    background-color: #d6d6d6;
    border-radius: 24px;
    -webkit-border-radius: 24px;
    -moz-border-radius: 24px;
    -ms-border-radius: 24px;
    -o-border-radius: 24px;
  }
}
</style>
