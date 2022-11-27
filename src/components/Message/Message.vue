<template>
  <div class="robin-message-bubble robin-flex robin-flex-align-center" v-clickaway="closeModal" :id="`message-bubble-${index}`">
    <check-box v-show="selectMessagesOpen" ref="checkbox" @clicked="toggleCheckAction($event)" />

    <div
      class="robin-bubble"
      @mouseover="onMouseOver()"
      @mouseleave="onMouseLeave()"
      :class="validateMessages(message).includes('message-sender') ? 'robin-ml-5' : 'robin-mr-5'"
      data-testid="bubble"
    >
      <div
        class="robin-reactions"
        v-if="
          message &&
          message.reactions &&
          message.reactions.length > 0 &&
          isMessageReactionViewEnabled
        "
      >
        <div
          class="robin-reaction"
          :class="{ 'delete-enabled': isMessageReactionDeleteEnabled }"
          v-for="(value, key, index) in reactions"
          :key="index"
          @click="removeReaction(value[value.length - 1])"
          v-show="value.length > 0"
        >
          {{ key + ' ' + value.length }}
        </div>
      </div>

      <div
        class="robin-message-bubble-inner"
        :class="{ 'robin-non-clickable': isMessageClickable }"
      >
        <message-content
          v-if="
            validateMessages(message).includes('message-sender') && currentConversation.is_group
          "
          :font-size="12"
          :color="groupnameColors[message.sender_token]"
          as="span"
          :line-height="20"
          class="robin-messager-name robin-mb-4"
        >
          {{ getContactName(message.sender_token) }}
        </message-content>
        <!-- messagePopup.opened && (caretOpen || (validateMessages(message))) && (isMessageReactionViewEnabled || isReplyMessagesEnabled || isDeleteMessagesEnabled || isForwardMessagesEnabled || message.pseudo || (isMessageReactionViewEnabled && isReplyMessagesEnabled && isDeleteMessagesEnabled && isForwardMessagesEnabled) -->
        <div
          class="robin-caret-container robin-flex robin-flex-align-center robin-flex-justify-center"
          v-show="caretOpen"
          @click="openModal"
          data-testid="popup-caret"
        >
          <icon-button name="messagePopupCaret" :to-emit="false" :to-click-away="false" />
        </div>

        <svg-icon class="robin-forwarded" name="forwarded" v-show="message.is_forwarded" />

        <reply-message-bubble
          :messages="messages"
          :message="message"
          v-if="message.is_reply && isReplyMessagesEnabled"
          :sender="validateMessages(message).includes('message-sender')"
          @scroll-replied-message="scrollToRepliedMessage"
        />

        <div class="message-inner" :class="{ 'robin-flex-column': isLink }">
          <message-content
            :max-width="message.content.msg.length < 120 ? '217' : '270'"
            :font-size="17"
            textWrap="pre-line"
            wordBreak="break-word"
            as="span"
            v-if="
              !validateLinkInMessage().containsEmail && !validateLinkInMessage().containsWebsite
            "
          >
            {{ message.content.msg }}
          </message-content>

          <div class="robin-link-container" ref="message" v-if="isLink"></div>

          <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
            <message-content
              :font-weight="'300'"
              :font-size="10"
              :color="currentTheme === 'light' ? '#7a7a7a' : '#B6B6B6'"
              as="p"
              class="robin-flex"
            >
              {{ !message.pseudo ? formatTimeStamp(message.content.timestamp) : '' }}

              <SvgIcon
                name="read"
                v-if="
                  !validateMessages(message).includes('message-sender') &&
                  message.is_read &&
                  !message.pseudo
                "
              />

              <svg-icon
                name="not-read"
                v-if="
                  !validateMessages(message).includes('message-sender') &&
                  !message.is_read &&
                  !message.pseudo
                "
              />

              <i class="robin-material-icon" v-if="message.pseudo"> schedule </i>
            </message-content>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import store from '@/store/index'
import Component from 'vue-class-component'
import { EmailRegex, WebsiteRegex } from '@/utils/constants'
import moment from 'moment'
import IconButton from '@/components/IconButton/IconButton.vue'
import Content from '@/components/Content/Content.vue'
import CheckBox from '@/components/CheckBox/CheckBox.vue'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import ReplyMessageBubble from '../ReplyMessageBubble/ReplyMessageBubble.vue'

const ComponentProps = Vue.extend({
  props: {
    message: {
      type: Object as PropType<ObjectType>,
      default: () => {
        return {}
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
@Component<Message>({
  name: 'Message',
  components: {
    'message-content': Content,
    CheckBox,
    SvgIcon,
    ReplyMessageBubble,
    IconButton
  },
  watch: {
    selectMessagesOpen: {
      handler (val) {
        if (!val) {
          const checkbox = (this.$refs.checkbox as Vue).$el as HTMLElement

          (checkbox.childNodes[0] as HTMLInputElement).checked = false
        }
      }
    }
  }
})
export default class Message extends ComponentProps {
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
    this.injectHtml(this.message.content ? this.message.content.msg : null)
  }

  openModal () {
    this.$emit('open-modal', this.index)
  }

  closeModal () {
    this.$emit('close-modal', this.index)
  }

  onResize () {
    this.screenWidth = window.innerWidth

    if (this.screenWidth <= 1024) {
      this.caretOpen = true
    } else {
      this.caretOpen = false
    }
  }

  injectHtml (message: string): void {
    let returnedMessage = ''

    if (message) {
      for (const word of message.split(' ')) {
        if (this.emailRegex.test(word)) {
          returnedMessage += String.raw` <a target="_blank" href="mailto:${word}">${word}<a/>`
        } else if (this.websiteRegex.test(word) || word.includes('http://')) {
          returnedMessage += String.raw` <a target="_blank" href="${word}">${word}<a/>`
        } else if (this.websiteRegex.test(word) || word.includes('https://')) {
          returnedMessage += String.raw` <a target="_blank" href="${word}">${word}<a/>`
        } else if (this.websiteRegex.test(word)) {
          returnedMessage += String.raw` <a target="_blank" href="https://${word}">${word}<a/>`
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

  toggleCheckAction (val: boolean): void {
    const checkbox = (this.$refs.checkbox as Vue).$el as HTMLElement

    if ((checkbox.childNodes[0] as HTMLInputElement).checked) {
      this.$emit('toggle-check-action', false)
    } else {
      this.$emit('toggle-check-action', true)
    }
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
        this.message.pseudo ||
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
      return 'robin-message-receiver robin-w-100 robin-flex-align-end' // true
    }

    if (message.content && message.sender_token === this.$user_token) {
      return 'robin-message-receiver robin-w-100 robin-flex-align-end' // true
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

    return 'robin-message-sender' // false
  }

  async addReaction (emoji: string): Promise<void> {
    const robin = this.$robin as any
    const message = Array.isArray(this.message) ? this.message[0] : (this.message as any)

    await robin.reactToMessage(emoji, this.currentConversation._id, message._id, this.$user_token)
    // this.closeModal()
  }

  async removeReaction (reaction: any): Promise<void> {
    const robin = this.$robin as any

    if (this.isMessageReactionDeleteEnabled) {
      await robin.RemoveReaction(reaction._id, this.message._id)
    }
  }

  formatTimeStamp (value: any): string {
    return moment(value).format('h:mma').toUpperCase()
  }

  validateLinkInMessage () {
    const texts = this.message.content.msg.split(' ')

    return {
      containsWebsite: texts.some((text: string) => {
        if (this.websiteRegex.test(text)) return true
        else if (text.includes('http://')) return true
        else if (text.includes('https://')) return true

        return false
      }),
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
}
</script>
