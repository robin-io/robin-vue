<template>
  <div class="robin-message-bubble robin-flex robin-flex-align-center"  v-clickaway="closeModal" :id="`message-bubble-${index}`">
    <CheckBox v-show="selectMessagesOpen" ref="checkbox" @clicked="toggleCheckAction()" />

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
          isMessageReactionViewEnabled &&
          !isMessagesLoading
        "
      >
        <div
          class="robin-reaction"
          :class="{ 'delete-enabled': isMessageReactionDeleteEnabled }"
          v-for="(value, key, reactionIndex) in reactions"
          :key="reactionIndex"
          @click="removeReaction(key)"
          v-show="value.length > 0"
        >
          {{ key + ' ' + value.length }}
        </div>
      </div>

      <div
        class="robin-message-bubble-video"
        :class="{ 'robin-non-clickable': isMessageClickable }"
      >
        <Content
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
        </Content>

        <div class="robin-caret-container" v-show="caretOpen" @click="openModal()">
          <IconButton name="messagePopupCaret" :to-emit="false" :to-click-away="false" />
        </div>

        <SvgIcon class="robin-forwarded" name="forwarded" v-show="message.is_forwarded" />

        <ReplyMessageBubble
          :messages="messages"
          :message="message"
          v-if="message.is_reply && isReplyMessagesEnabled"
          :sender="validateMessages(message).includes('message-sender')"
          @scroll-to-message="scrollToRepliedMessage"
        />

        <video controls :class="message.is_reply ? 'video-reply' : ''" :id="`video-${index}`">
          <source :src="typeof message.content.attachment !== 'string' ? convertArrayBufferToFile(message.content.attachment, message) : message.content.attachment" />
          Your browser does not support the video tag.
        </video>

        <Content
          :max-width="message.content.msg.length < 120 ? '217' : '270'"
          textWrap="pre-line"
          wordBreak="break-word"
          as="span"
          v-if="
            !validateLinkInMessage().containsEmail &&
            !validateLinkInMessage().containsWebsite &&
            message.content.msg &&
            message.content.msg != 'undefined'
          "
        >
          {{ message.content.msg }}
        </Content>

        <div
          class="robin-link-container"
          ref="message"
          v-if="
            (validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) ||
            validateLinkInMessage().containsEmail ||
            (validateLinkInMessage().containsWebsite &&
              message.content.msg &&
              message.content.msg != 'undefined')
          "
        ></div>

        <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
          <Content
            :font-weight="'300'"
            :font-size="10"
            :color="currentTheme === 'light' ? '#7a7a7a' : '#B6B6B6'"
            as="p"
          >
            {{ !message.pseudo ? getTimestamp(message.created_at) : '' }}

            <SvgIcon
              name="read"
              v-if="
                !validateMessages(message).includes('message-sender') &&
                message.is_read &&
                !message.pseudo
              "
            />

            <SvgIcon
              name="not-read"
              v-if="
                !validateMessages(message).includes('message-sender') &&
                !message.is_read &&
                !message.pseudo
              "
            />

            <i class="robin-material-icon" v-if="message.pseudo"> schedule </i>
          </Content>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component, { mixins } from 'vue-class-component'
import ConversationMixin from '@/mixins/conversation-mixins'
import { EmailRegex, WebsiteRegex } from '@/utils/constants'
import { convertArrayBufferToFile } from '@/utils/helpers'
import { formatTimestamp } from '@/utils/date'
import IconButton from '@/components/IconButton/IconButton.vue'
import CheckBox from '@/components/CheckBox/CheckBox.vue'
import Content from '@/components/Content/Content.vue'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import ReplyMessageBubble from '../ReplyMessageBubble/ReplyMessageBubble.vue'

const ComponentProps = mixins(ConversationMixin).extend({
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
    isMessagesLoading: {
      type: Boolean,
      default: false
    }
  }
})

// eslint-disable-next-line
@Component<VideoMessage>({
  name: 'VideoMessage',
  components: {
    Content,
    SvgIcon,
    CheckBox,
    ReplyMessageBubble,
    IconButton
  },
  watch: {
    selectMessagesOpen: {
      handler (val) {
        if (!val) {
          const checkbox = (this.$refs.checkbox as Vue).$el as HTMLInputElement
          checkbox.checked = false
        }
      }
    },
    message: {
      handler (_, newMessage) {
        this.msgReactions = newMessage.reactions ?? []
      },
      deep: true
    }
  }
})
export default class VideoMessage extends ComponentProps {
  caretOpen = false
  msgReactions = [] as Array<ObjectType>
  emailRegex = EmailRegex
  websiteRegex = WebsiteRegex
  convertArrayBufferToFile = convertArrayBufferToFile
  isMessageReactionViewEnabled!: boolean
  isMessageReactionDeleteEnabled!: boolean
  isReplyMessagesEnabled!: boolean
  isDeleteMessagesEnabled!: boolean
  isForwardMessagesEnabled!: boolean
  selectMessagesOpen!: boolean
  screenWidth!: number
  currentTheme!: string
  currentConversation!: ObjectType
  groupnameColors!: Array<string>
  getContactName!: (sender_token: string) => string

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

  get reactions () {
    const newReactions = { '❤️': [], '👍': [], '👎': [], '😂': [], '⁉️': [] } as ObjectType

    for (const reaction of this.msgReactions) {
      newReactions[reaction.reaction].push(reaction.reaction)
    }

    return newReactions
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

  toggleCheckAction (): void {
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

  removeReaction (reaction: string): void {
    const messageReaction = this.message.reactions.find(
      (item: ObjectType) => item.reaction === reaction
    ) as ObjectType
    this.$emit('remove-reaction', messageReaction, this.index)
  }

  getTimestamp (value: string): string {
    return formatTimestamp(new Date(value), 'h:mma')
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

  scrollToRepliedMessage (id: string) {
    this.$emit('scroll-to-message', id)
  }

  checkArrayReceiverUserToken (message: any) {
    return message.some((item: ObjectType) => item.sender_token === this.$user_token)
  }
}
</script>
