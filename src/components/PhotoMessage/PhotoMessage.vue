<template>
  <div class="robin-message-bubble robin-flex robin-flex-align-center image" v-clickaway="closeModal" :id="`message-bubble-${index}`">
    <CheckBox v-show="selectMessagesOpen" @clicked="toggleCheckAction($event)" />

    <div
      class="robin-bubble image"
      @mouseover="onMouseOver()"
      @mouseleave="onMouseLeave()"
      :class="validateMessages(message).includes('message-sender') ? 'robin-grid-sender robin-ml-5' : 'robin-grid-receiver robin-mr-5'"
      data-testid="bubble"
    >
      <Content
        v-if="currentConversation.is_group"
        :font-size="12"
        as="span"
        :color="groupnameColors[message[0].sender_token]"
        :line-height="20"
        class="robin-messager-name robin-mb-4"
      >
        {{ getContactName(message[0].sender_token) }}
      </Content>

      <div class="robin-caret-container" v-show="caretOpen" @click="openModal($event)">
        <IconButton name="messagePopupCaret" :to-emit="false" :to-click-away="false" />
      </div>

      <SvgIcon class="robin-forwarded" name="forwarded" v-show="message[0].is_forwarded" />

      <div
        class="robin-bubble-inner robin-grid-container"
        @click="openPreview(message)"
        data-testid="bubble-inner"
        :class="[isMessageClickable ? 'robin-non-clickable' : '', getSizeOfGridClass]"
      >
        <div
          class="robin-message-bubble-image"
          v-for="(image, index) in images"
          :key="image._id"
          :class="validateImageClass(index)"
        >
          <v-lazy-image class="robin-uploaded-image" :src="typeof image.content.attachment !== 'string' ? convertFileToURL(image.content.attachment) : image.content.attachment" />
        </div>

        <span
          :class="
            images.length > 4
              ? 'back-drop robin-flex-column robin-flex-space-between'
              : 'robin-flex-end'
          "
          class="robin-drop-shadow robin-flex"
        >
          <Content
            v-show="images.length > 4"
            :font-size="26"
            color="#fff"
            as="p"
            class="robin-message-count"
          >
            {{ images.length - 4 }}+
          </Content>
        </span>
      </div>

      <Content
        :max-width="message[0].content.msg.length < 120 ? '217' : '270'"
        textWrap="pre-line"
        wordBreak="break-word"
        as="span"
        v-if="
          !validateLinkInMessage().containsEmail &&
          !validateLinkInMessage().containsWebsite &&
          message[0].content.msg &&
          message[0].content.msg != ''
        "
      >
        {{ message[0].content.msg }}
      </Content>

      <div
        class="robin-link-container"
        ref="message"
        v-if="
          (validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) ||
          validateLinkInMessage().containsEmail ||
          (validateLinkInMessage().containsWebsite &&
            message[0].content.msg &&
            message[0].content.msg != 'undefined')
        "
      ></div>

      <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
        <Content
          :font-weight="'300'"
          :font-size="10"
          :color="currentTheme === 'light' ? '#7a7a7a' : '#B6B6B6'"
          as="p"
          class="robin-flex"
        >
          {{ !message[0].pseudo ? formatTimeStamp(message[0].content.timestamp) : '' }}

          <SvgIcon
            name="read"
            v-if="
              !validateMessages(message).includes('message-sender') &&
              message[0].is_read &&
              !message[0].pseudo
            "
          />

          <SvgIcon
            name="not-read"
            v-if="
              !validateMessages(message).includes('message-sender') &&
              !message[0].is_read &&
              !message[0].pseudo
            "
          />

          <i class="robin-material-icon" v-if="message[0].pseudo"> schedule </i>
        </Content>
      </span>

      <IconButton
        class="download-btn"
        v-if="message.length > 1"
        @clicked="downloadImages(message)"
        name="downloadImage"
        :to-emit="true"
        :to-click-away="false"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import store from '@/store/index'
import Component from 'vue-class-component'
import moment from 'moment'
import VLazyImage from 'v-lazy-image/v2'
import { EmailRegex, WebsiteRegex } from '@/utils/constants'
import IconButton from '@/components/IconButton/IconButton.vue'
import CheckBox from '@/components/CheckBox/CheckBox.vue'
import Content from '@/components/Content/Content.vue'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import ReplyMessageBubble from '../ReplyMessageBubble/ReplyMessageBubble.vue'

const ComponentProps = Vue.extend({
  props: {
    message: {
      type: Array as PropType<Array<ObjectType>>,
      default: () => {
        return []
      }
    },
    messages: {
      type: Array as PropType<Array<ObjectType>>,
      default: () => []
    },
    index: {
      type: Number,
      default: 0
    },
    groupnameColors: {
      type: Object,
      default: () => {}
    }
  }
})

// eslint-disable-next-line
@Component<PhotoMessage>({
  name: 'PhotoMessage',
  components: {
    Content,
    SvgIcon,
    VLazyImage,
    ReplyMessageBubble,
    CheckBox,
    IconButton
  },
  watch: {
    message: {
      handler (val: any) {
        this.images = [...val].filter((item) => !item.is_deleted).slice(0, 4) as Array<ObjectType>
      },
      immediate: true
    }
  }
})
export default class PhotoMessage extends ComponentProps {
  images: Array<ObjectType> = []
  caretOpen = false
  screenWidth = 0 as number
  reactions = { '❤️': [], '👍': [], '👎': [], '😂': [], '⁉️': [] } as ObjectType
  emailRegex = EmailRegex
  websiteRegex = WebsiteRegex

  get isReplyMessagesEnabled () {
    return store.state.replyMessagesEnabled
  }

  get selectMessagesOpen () {
    return store.state.selectMessagesOpen
  }

  get currentConversation () {
    return store.state.currentConversation
  }

  get currentTheme () {
    return store.state.currentTheme
  }

  get isMessageReactionViewEnabled () {
    return store.state.messageReactionViewEnabled
  }

  get isForwardMessagesEnabled () {
    return store.state.forwardMessagesEnabled
  }

  get isDeleteMessagesEnabled () {
    return store.state.deleteMessagesEnabled
  }

  get isMessageReactionDeleteEnabled () {
    return store.state.messageReactionDeleteEnabled
  }

  get getSizeOfGridClass () {
    if (this.message.length >= 4) {
      return 'robin-grid-4-by-4'
    } else if (this.message.length === 3) {
      return 'robin-grid-3-by-3'
    } else if (this.message.length === 2) {
      return 'robin-grid-2-by-2'
    } else {
      return 'robin-grid-1-by-1'
    }
  }

  get isMessageClickable () {
    if (
      (!this.isMessageReactionViewEnabled &&
        !this.isReplyMessagesEnabled &&
        !this.isDeleteMessagesEnabled &&
        !this.isForwardMessagesEnabled) ||
      this.selectMessagesOpen
    ) {
      return false
    }

    return true
  }

  get isLink () {
    if (
      (this.validateLinkInMessage().containsEmail &&
        this.validateLinkInMessage().containsWebsite) ||
      this.validateLinkInMessage().containsEmail ||
      this.validateLinkInMessage().containsWebsite
    ) {
      return true
    }

    return false
  }

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
    this.injectHtml(this.message[0].content ? this.message[0].content.msg : null)
  }

  onResize () {
    this.screenWidth = window.innerWidth

    if (this.screenWidth <= 1024) {
      this.caretOpen = true
    } else {
      this.caretOpen = false
    }
  }

  convertFileToURL (file: File): string {
    return URL.createObjectURL(file)
  }

  injectHtml (message: string): void {
    let returnedMessage = ''

    if (message) {
      for (const word of message.split(' ')) {
        if (this.emailRegex.test(word)) {
          returnedMessage += String.raw` <a target="_blank" href="mailto:${word}">${word}<a/>`
        } else if (this.websiteRegex.test(word)) {
          if (word.includes('http://') || word.includes('https://')) {
            returnedMessage += String.raw` <a target="_blank" href="${word}">${word}<a/>`
          } else {
            returnedMessage += String.raw` <a target="_blank" href="http://${word}">${word}<a/>`
          }
        } else {
          returnedMessage += ` ${word}`
        }
      }
    }

    const newMessage = this.$refs.message as any
    if (newMessage) {
      newMessage.innerHTML = returnedMessage
    }
  }

  openModal (event: ObjectType) {
    this.$emit('open-modal', this.index)
  }

  closeModal () {
    this.$emit('close-modal', this.index)
  }

  toggleCheckAction (val: boolean): void {
    this.$emit('toggle-check-action', val)
  }

  validateMessageClass (): boolean {
    return this.message.some((item: any) => item.content && item.sender_token === this.$user_token)
  }

  onMouseLeave () {
    if (this.screenWidth > 1024) {
      this.caretOpen = false
    }
  }

  onMouseOver () {
    if (
      this.validateMessages(this.message) &&
      (this.isMessageReactionViewEnabled ||
        this.isReplyMessagesEnabled ||
        this.isDeleteMessagesEnabled ||
        this.isForwardMessagesEnabled ||
        this.message[0].pseudo ||
        (this.isMessageReactionViewEnabled &&
          this.isReplyMessagesEnabled &&
          this.isDeleteMessagesEnabled &&
          this.isForwardMessagesEnabled))
    ) {
      if (!this.selectMessagesOpen) this.caretOpen = true
    } else {
      this.caretOpen = false
    }
  }

  validateImageClass (index: number): string {
    return this.message.some((item: any) => item.content && item.sender_token !== this.$user_token)
      ? `robin-image-sender robin-grid-${index}`
      : `robin-image-receiver robin-grid-${index}`
  }

  openPreview (message: any): void {
    this.$emit('open-preview', message)
    this.closeModal()
  }

  validateMessages (message: any): string {
    const nextMessage = this.messages[this.index + 1] as any

    if (
      Array.isArray(message) &&
      this.checkArrayReceiverUserToken(message) &&
      nextMessage &&
      nextMessage.sender_token !== this.$user_token
    ) {
      return 'robin-message-receiver robin-w-100 robin-flex-align-end prev'
    }

    if (
      message.content &&
      message.sender_token === this.$user_token &&
      Array.isArray(nextMessage) &&
      !this.checkArrayReceiverUserToken(nextMessage)
    ) {
      return 'robin-message-receiver robin-w-100 robin-flex-align-end prev'
    }

    if (Array.isArray(message) && this.checkArrayReceiverUserToken(message)) {
      return 'robin-message-receiver robin-w-100 robin-flex-align-end'
    }

    if (message.content && message.sender_token === this.$user_token) {
      return 'robin-message-receiver robin-w-100 robin-flex-align-end'
    }

    if (
      Array.isArray(message) &&
      !this.checkArrayReceiverUserToken(message) &&
      nextMessage &&
      nextMessage.sender_token === this.$user_token
    ) {
      return 'robin-message-sender prev'
    }

    if (
      message.content &&
      message.sender_token !== this.$user_token &&
      Array.isArray(nextMessage) &&
      this.checkArrayReceiverUserToken(nextMessage)
    ) {
      return 'robin-message-sender prev'
    }

    return 'robin-message-sender'
  }

  async addReaction (emoji: string): Promise<void> {
    const robin = this.$robin as any
    const message = Array.isArray(this.message) ? this.message[0] : (this.message as any)

    await robin.reactToMessage(emoji, this.currentConversation._id, message._id, this.$user_token)
    this.closeModal()
  }

  async removeReaction (reaction: any): Promise<void> {
    const robin = this.$robin as any
    const message = Array.isArray(this.message) ? this.message[0] : (this.message as any)

    if (this.isMessageReactionDeleteEnabled) {
      await robin.RemoveReaction(reaction._id, message._id)
    }
  }

  formatTimeStamp (value: any): string {
    return moment(value).format('h:mma').toUpperCase()
  }

  validateLinkInMessage () {
    const texts = this.message[0].content.msg.split(' ')

    return {
      containsWebsite: texts.some((text: string) => this.websiteRegex.test(text)),
      containsEmail: texts.some((text: string) => this.emailRegex.test(text))
    }
  }

  getContactName (sender_token: string): string {
    const index = this.$robin_users.findIndex((user) => user.userToken === sender_token) as number
    const user = this.$robin_users[index] as any
    return user ? user.userName : ''
  }

  scrollToRepliedMessage (id: string) {
    this.$emit('scroll-to-message', id)
  }

  checkArrayReceiverUserToken (message: any) {
    return message.some((item: ObjectType) => item.sender_token === this.$user_token)
  }

  getFileDetails (attachment: any): Record<string, any> {
    let fileName = ''
    let strArr = [] as Array<string>

    if (typeof attachment !== 'string') {
      strArr = attachment.name.split('.')
    } else {
      fileName = attachment.substring(attachment.lastIndexOf('/') + 1)
      strArr = fileName.split('.') as Array<string>
    }

    return {
      name: strArr[strArr.length - 2],
      extension: strArr[strArr.length - 1]
    }
  }

  async downloadImages (messages: any) {
    let intervalLevel = 0

    const interval = setInterval(() => {
      if (intervalLevel === messages.length) {
        clearInterval(interval)

        return
      }

      const element = document.createElement('a')
      const fileDetails = this.getFileDetails(messages[intervalLevel].content.attachment) as any
      element.setAttribute('href', messages[intervalLevel].content.attachment)
      element.setAttribute('download', fileDetails.name + ' ' + fileDetails.extension)

      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      intervalLevel += 1
    }, 1000)
  }
}
</script>
