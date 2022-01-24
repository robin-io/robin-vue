<template>
  <div class="robin-message-bubble robin-flex robin-flex-align-center" :class="validateMessages(message)">
    <RCheckBox ref="checkbox" v-show="selectMessagesOpen" @clicked="toggleCheckAction($event)" />

    <div class="robin-bubble" @mouseover="onMouseOver()" @mouseleave="onMouseLeave()" :class="validateMessages(message).includes('message-sender') ? 'robin-ml-5' : 'robin-mr-5'" v-if="!Array.isArray(message)" v-on-clickaway="closeModal">
      <div class="robin-popup-container reactions">
        <RReactionPopOver v-show="messagePopup.opened && validateMessages(message)" @close-modal="closeModal()" ref="popup-1" :id="message._id" :message="message" @reaction="addReaction" />
      </div>

      <div class="robin-reactions" v-if="message && message.reactions && message.reactions.length > 0">
        <div class="robin-reaction" v-for="(item, index) in message.reactions.slice(0, 4)" :key="index" @click="removeReaction(item)">{{ item.reaction }}</div>
      </div>

      <!-- Personal -->
      <div class="robin-message-bubble-inner" :class="{'robin-non-clickable': selectMessagesOpen, 'robin-flex-column': (validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) || validateLinkInMessage().containsEmail || validateLinkInMessage().containsWebsite }" v-if="!message.has_attachment && !conversation.is_group">
        <!-- Modal Open Caret -->
        <div class="robin-caret-container" v-show="caretOpen || (messagePopup.opened && validateMessages(message))" @click="openModal()">
          <IconButton name="messagePopupCaret" :to-emit="false" :to-click-away="false" />
        </div>
        <!-- Modal Open Caret -->

        <!-- place reply here -->
        <ReplyMessageBubble :messages="messages" :message="message" v-if="message.is_reply" :sender="validateMessages(message).includes('message-sender')" @scroll-replied-message="scrollToRepliedMessage" />
        <!-- place reply here -->
        <RText :max-width="message.content.msg.length < 120 ? '217' : '270'" textWrap="pre-line" wordBreak="break-word" as="span" v-if="!validateLinkInMessage().containsEmail && !validateLinkInMessage().containsWebsite" @click.native="openModal()">
          {{ message.content.msg }}
        </RText>

        <div class="robin-link-container" v-html="injectHtml()" v-if="(validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) || validateLinkInMessage().containsEmail || validateLinkInMessage().containsWebsite"></div>

        <link-prevue class="robin-link-preview" v-if="websiteRegex.test(getTextsInMessage().texts[getTextsInMessage().length - 1]) && !emailRegex.test(getTextsInMessage().texts[getTextsInMessage().length - 1])" :url="getTextsInMessage().texts[getTextsInMessage().length - 1].includes('http') || getTextsInMessage().texts[getTextsInMessage().length - 1].includes('https') ? getTextsInMessage().texts[getTextsInMessage().length - 1] : `https://${getTextsInMessage().texts[getTextsInMessage().length - 1]}`">
          <template slot-scope="props">
            <a :href="props.url" class="card" v-show="props.img">
              <img class="robin-card-img-top" :src="props.img" :alt="props.title" />

              <div class="robin-card-block" v-show="props.title">
                <RText :font-size="14" :line-height="24" textWrap="pre-line" wordBreak="break-word" color="#51545C" as="span">
                  {{ props.title }}
                </RText>

                <RText :font-size="12" :line-height="14" textWrap="pre-line" class="robin-card-text" wordBreak="break-word" color="#8D9091" as="p">
                  {{ props.description }}
                </RText>
              </div>
            </a>
          </template>

          <template slot="loading">
            <div></div>
          </template>
        </link-prevue>

        <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
          <RText :font-weight="'300'" :font-size="10" color="#7a7a7a" as="p" @click.native="openModal()" class="robin-flex">
            {{ formatTimeStamp(message.content.timestamp) }}

            <SvgIcon name="read" v-if="!validateMessages(message).includes('message-sender') && message.is_read" />

            <SvgIcon name="not-read" v-if="!validateMessages(message).includes('message-sender') && !message.is_read" />
          </RText>
        </span>
      </div>

      <!-- Group -->
      <div class="robin-message-bubble-inner robin-group" :class="{ 'robin-non-clickable': selectMessagesOpen }" v-if="!message.has_attachment && conversation.is_group">
        <RText v-if="validateMessages(message).includes('message-sender')" :font-size="12" color="#15AE73" as="span" :line-height="20" class="robin-messager-name robin-mb-4"> {{ getContactName(message.content.sender_token) }} </RText>

        <!-- Modal Open Caret -->
        <div class="robin-caret-container" v-show="caretOpen || (messagePopup.opened && validateMessages(message))" @click="openModal()">
          <IconButton name="messagePopupCaret" :to-emit="false" :to-click-away="false" />
        </div>
        <!-- Modal Open Caret -->

        <!-- place reply here -->
        <ReplyMessageBubble :messages="messages" :message="message" v-if="message.is_reply" :sender="validateMessages(message).includes('message-sender')" @scroll-replied-message="scrollToRepliedMessage" />
        <!-- place reply here -->

        <div class="message-inner" :class="{ 'robin-flex-column': (validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) || validateLinkInMessage().containsEmail || validateLinkInMessage().containsWebsite }">
          <RText :max-width="message.content.msg.length < 120 ? '217' : '270'" textWrap="pre-line" wordBreak="break-word" as="span" v-if="!validateLinkInMessage().containsEmail && !validateLinkInMessage().containsWebsite" @click.native="openModal()">
            {{ message.content.msg }}
          </RText>

          <div class="robin-link-container" v-html="injectHtml()" v-if="(validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) || validateLinkInMessage().containsEmail || validateLinkInMessage().containsWebsite"></div>

          <link-prevue class="robin-link-preview" v-if="websiteRegex.test(getTextsInMessage().texts[getTextsInMessage().length - 1]) && !emailRegex.test(getTextsInMessage().texts[getTextsInMessage().length - 1])" :url="getTextsInMessage().texts[getTextsInMessage().length - 1].includes('http') || getTextsInMessage().texts[getTextsInMessage().length - 1].includes('https') ? getTextsInMessage().texts[getTextsInMessage().length - 1] : `https://${getTextsInMessage().texts[getTextsInMessage().length - 1]}`">
            <template slot-scope="props">
              <a :href="props.url" class="card" v-show="props.img">
                <img class="robin-card-img-top" :src="props.img" :alt="props.title" />

                <div class="robin-card-block" v-show="props.title">
                  <RText :font-size="14" :line-height="24" textWrap="pre-line" wordBreak="break-word" color="#51545C" as="span">
                    {{ props.title }}
                  </RText>

                  <RText :font-size="12" :line-height="14" textWrap="pre-line" class="robin-card-text" wordBreak="break-word" color="#8D9091" as="p">
                    {{ props.description }}
                  </RText>
                </div>
              </a>
            </template>

            <template slot="loading">
              <div></div>
            </template>
          </link-prevue>

          <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
            <RText :font-weight="'300'" :font-size="10" color="#7a7a7a" as="p" @click.native="openModal()" class="robin-flex">
              {{ formatTimeStamp(message.content.timestamp) }}

              <SvgIcon name="read" v-if="!validateMessages(message).includes('message-sender') && message.is_read" />

              <SvgIcon name="not-read" v-if="!validateMessages(message).includes('message-sender') && !message.is_read" />
            </RText>
          </span>
        </div>
      </div>

      <div class="robin-message-bubble-image" :class="{'robin-non-clickable': selectMessagesOpen}" v-if="message.content.is_attachment && imageRegex.test(checkAttachmentType(message.content.attachment))">
        <!-- Modal Open Caret -->
        <div class="robin-caret-container" v-show="caretOpen || (messagePopup.opened && validateMessages(message))" @click="openModal()">
          <IconButton name="messagePopupCaret" :to-emit="false" :to-click-away="false" />
        </div>
        <!-- Modal Open Caret -->

        <!-- place reply here -->
        <ReplyMessageBubble :messages="messages" :message="message" v-if="message.is_reply" :sender="validateMessages(message).includes('message-sender')" @scroll-replied-message="scrollToRepliedMessage" />
        <!-- place reply here -->
        <v-lazy-image class="robin-uploaded-image" :src="message.content.attachment" @click.native="$emit('open-preview', [message])" />
        <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
          <RText :font-weight="'300'" :font-size="10" color="#7a7a7a" as="p" @click.native="openModal()" class="robin-flex">
            {{ formatTimeStamp(message.content.timestamp) }}

            <SvgIcon name="read" v-if="!validateMessages(message).includes('message-sender') && message.is_read" />

            <SvgIcon name="not-read" v-if="!validateMessages(message).includes('message-sender') && !message.is_read" />
          </RText>
        </span>
      </div>
      <div class="robin-message-bubble-video" :class="{'robin-non-clickable': selectMessagesOpen}"  v-if="message.content.is_attachment && videoRegex.test(checkAttachmentType(message.content.attachment))">
        <!-- place reply here -->
        <ReplyMessageBubble :messages="messages" :message="message" v-if="message.is_reply" :sender="validateMessages(message).includes('message-sender')" @scroll-replied-message="scrollToRepliedMessage" />
        <!-- place reply here -->

        <video controls :class="message.is_reply ? 'video-reply' : ''">
          <source :src="message.content.attachment" />
          Your browser does not support the video tag.
        </video>

        <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
          <RText :font-weight="'300'" :font-size="10" color="#7a7a7a" as="p" @click.native="openModal()" class="robin-flex">
            {{ formatTimeStamp(message.content.timestamp) }}

            <SvgIcon name="read" v-if="!validateMessages(message).includes('message-sender') && message.is_read" />

            <SvgIcon name="not-read" v-if="!validateMessages(message).includes('message-sender') && !message.is_read" />
          </RText>
        </span>
      </div>

      <div class="robin-message-bubble-document"  :class="{'robin-non-clickable': selectMessagesOpen}" v-if="message.content.is_attachment && documentRegex.test(checkAttachmentType(message.content.attachment))">
        <!-- Modal Open Caret -->
        <div class="robin-caret-container" v-show="caretOpen || (messagePopup.opened && validateMessages(message))" @click="openModal()">
          <IconButton name="messagePopupCaret" :to-emit="false" :to-click-away="false" />
        </div>
        <!-- Modal Open Caret -->

        <!-- place reply here -->
        <ReplyMessageBubble :messages="messages" :message="message" v-if="message.is_reply" :sender="validateMessages(message).includes('message-sender')" class="robin-mb-8" />
        <!-- place reply here -->

        <div class="robin-uploaded-document">
          <!-- <img v-if="images[getFileDetails(message.content.attachment).extension]" :src="`${images[getFileDetails(message.content.attachment).extension]}`" /> -->
          <inline-svg v-if="images[getFileDetails(message.content.attachment).extension]" :src="images[getFileDetails(message.content.attachment).extension]" />

          <img v-else src="@/assets/default.png" />

          <div class="details robin-flex robin-h-100 robin-flex-align-center">
            <RText as="span" :fontSize="14"> {{ getFileDetails(message.content.attachment).name.length > 9 ? getFileDetails(message.content.attachment).name.substring(0, 9) + '...' + '.' + getFileDetails(message.content.attachment).extension : getFileDetails(message.content.attachment).name + '.' + getFileDetails(message.content.attachment).extension }} </RText>
          </div>

          <IconButton name="download" color="#15AE73" @clicked="downloadFile(message.content.attachment)" :to-emit="true" :to-click-away="false" />
        </div>

        <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
          <RText :font-weight="'300'" :font-size="10" color="#7a7a7a" as="p" @click.native="openModal()" class="robin-flex">
            {{ formatTimeStamp(message.content.timestamp) }}

            <SvgIcon name="read" v-if="!validateMessages(message).includes('message-sender') && message.is_read" />

            <SvgIcon name="not-read" v-if="!validateMessages(message).includes('message-sender') && !message.is_read" />
          </RText>
        </span>
      </div>
    </div>

    <div class="robin-bubble" :class="validateMessages(message).includes('message-sender') ? 'robin-ml-5' : 'robin-mr-5'" v-if="Array.isArray(message) && message.filter((image) => !image.is_deleted).length === 1">
      <div class="robin-reactions" v-if="message && message[0].reactions">
        <div class="robin-reaction" v-for="(item, index) in message[0].reactions.slice(0, 4)" :key="index" @click="removeReaction(item)">{{ item.reaction }}</div>
      </div>

      <div class="robin-message-bubble-image" v-if="message[0].content.is_attachment && imageRegex.test(checkAttachmentType(message[0].content.attachment))">
        <!-- place reply here -->
        <ReplyMessageBubble :messages="messages" :message="message" v-if="message[0].is_reply" :sender="validateMessages(message).includes('message-sender')" @scroll-replied-message="scrollToRepliedMessage" />
        <!-- place reply here -->
        <v-lazy-image class="robin-uploaded-image" :src="message[0].content.attachment" @click.native="$emit('open-preview', [message[0]])" />

        <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
          <RText :font-weight="'300'" :font-size="10" color="#7a7a7a" as="p" class="robin-flex">
            {{ formatTimeStamp(message[0].content.timestamp) }}

            <SvgIcon name="read" v-if="!validateMessages(message).includes('message-sender') && (message[0].is_read || readReceipts.some((item) => item === message[0]._id))" />

            <SvgIcon name="not-read" v-if="!validateMessages(message).includes('message-sender') && (!message[0].is_read || !readReceipts.some((item) => item === message[0]._id))" />
          </RText>
        </span>
      </div>
    </div>

    <div class="robin-reactions" v-if="Array.isArray(message) && message[0] && message[0].reactions">
      <div class="robin-reaction" v-for="(item, index) in message[0].reactions.slice(0, 4)" :key="index" @click="removeReaction(item)">{{ item.reaction }}</div>
    </div>

    <MessageGrid ref="popup-2" :class="!validateMessages(message) ? 'robin-ml-5' : 'robin-mr-5'" v-if="Array.isArray(message) && message.filter((image) => !image.is_deleted).length > 1" :messages="messages" :message="message.filter((image) => !image.is_deleted)" :read-receipts="readReceipts" :conversation="conversation" :message-popup="messagePopup" @open-preview="openPreview($event)" @open-modal="openModal()" @close-modal="closeModal()" @add-reaction="addReaction" v-on-clickaway="closeModal" />

    <div class="robin-popup-container message" :class="{ top: (lastId === message._id || messages.length - 3 === index) && scroll }">
      <RMessagePopOver v-show="messagePopup.opened && validateMessages(message) && !Array.isArray(message)" @close-modal="closeModal()" @select-message="selectMessage()" @forward-message="$emit('forward-message')" @reply-message="$emit('reply-message', message)" ref="popup-3" :id="message._id" :message="message" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VLazyImage from 'v-lazy-image/v2'
import InlineSvg from 'vue-inline-svg'
import LinkPrevue from 'link-prevue'
import { mixin as clickaway } from 'vue-clickaway'
import store from '../../../store/index'
import Component from 'vue-class-component'
import EventBus from '@/event-bus'
import ReplyMessageBubble from '../ReplyMessageBubble/ReplyMessageBubble.vue'
import IconButton from '../../IconButton/IconButton.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import MessageGrid from '../MessageGrid/MessageGrid.vue'
import RMessagePopOver from '../RMessagePopOver/RMessagePopOver.vue'
import RReactionPopOver from '../RReactionPopOver/RReactionPopOver.vue'
import RCheckBox from '@/components/ChatList/RCheckBox/RCheckBox.vue'
import SvgIcon from '../../SvgIcon/SvgIcon.vue'
import moment from 'moment'
import mime from 'mime'

// file-extension-images
import pdf from '@/assets/pdf.svg'
import doc from '@/assets/doc.svg'
import ppt from '@/assets/ppt.svg'
import xls from '@/assets/xls.svg'
import txt from '@/assets/txt.svg'
import zip from '@/assets/zip.svg'
import avi from '@/assets/avi.svg'
import psd from '@/assets/psd.svg'
import gif from '@/assets/gif.svg'
import svg from '@/assets/svg.svg'
import ai from '@/assets/ai.svg'
import mp3 from '@/assets/mp3.svg'
import mkv from '@/assets/mkv.svg'

interface ReplyMessage {
  [index: string]: any
}

const ComponentProps = Vue.extend({
  props: {
    message: {
      type: [Object, Array],
      default: () => {}
    },
    index: {
      type: Number,
      default: 0
    },
    messages: {
      type: Array,
      default: () => []
    },
    conversation: {
      type: Object,
      default: () => {}
    },
    messagePopup: {
      type: Object,
      default: () => {}
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
    }
  }
})

// eslint-disable-next-line
@Component<MessageContent>({
  name: 'MessageContent',
  components: {
    RText,
    VLazyImage,
    InlineSvg,
    LinkPrevue,
    MessageGrid,
    RMessagePopOver,
    RReactionPopOver,
    RCheckBox,
    IconButton,
    ReplyMessageBubble,

    SvgIcon
  },
  mixins: [clickaway]
})
export default class MessageContent extends ComponentProps {
  props = {} as any
  caretOpen = false
  screenWidth = 0 as number
  images = {
    pdf: pdf,
    doc: doc,
    ppt: ppt,
    xls: xls,
    txt: txt,
    zip: zip,
    avi: avi,
    psd: psd,
    svg: svg,
    ai: ai,
    mp3: mp3,
    mkv: mkv,
    gif: gif
  } as any

  imageRegex = /^image/ as any
  videoRegex = /^video/ as any
  documentRegex = /(xls|doc|ppt|txt|pdf|ppt|zip|html|avi|psd|svg|ai|gif|mp3|ai|mkv)$/
  emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  websiteRegex = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

  get robinUsers () {
    return store.state.users
  }

  get selectMessagesOpen () {
    return store.state.selectMessagesOpen
  }

  created () {
    this.onNewReaction()
    this.onReactionDelete()
  }

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
  }

  formatTimeStamp (value: any): string {
    return moment(String(value)).format('h:mma').toUpperCase()
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

  downloadFile (attachmentUrl: string): void {
    const fileDetails = this.getFileDetails(attachmentUrl) as any
    const element = document.createElement('a')

    element.setAttribute('href', attachmentUrl)
    element.setAttribute('download', fileDetails.name + ' ' + fileDetails.extension)
    element.click()
  }

  openModal (): void {
    console.log('clicked')
    if (!this.selectMessagesOpen) {
      this.messagePopup.opened = true
    }
  }

  closeModal (): void {
    const popup = this.$refs as any
    for (const ref in popup) {
      if (ref !== 'checkbox') {
        popup[ref].$refs['popup-body'].classList.remove('robin-zoomIn')
        popup[ref].$refs['popup-body'].classList.add('robin-zoomOut')
      }
    }

    window.setTimeout(() => {
      for (const ref in popup) {
        if (ref !== 'checkbox') {
          popup[ref].$refs['popup-body'].classList.add('robin-zoomIn')
          popup[ref].$refs['popup-body'].classList.remove('robin-zoomOut')
        }
      }

      this.messagePopup.opened = false
    }, 300)
  }

  openPreview (event: any): void {
    this.$emit('open-preview', event)
  }

  checkArrayReceiverUserToken (message: any) {
    return message.some((item: { content: { sender_token: string } }) => item.content.sender_token === this.$user_token)
  }

  validateMessages (message: any): string {
    const nextMessage = this.messages[this.index + 1] as any

    if (Array.isArray(message) && this.checkArrayReceiverUserToken(message) && nextMessage && nextMessage.content.sender_token !== this.$user_token) {
      return 'robin-message-receiver robin-ml-auto robin-flex-row-reversed prev'
    }

    if (message.content && message.content.sender_token === this.$user_token && Array.isArray(nextMessage) && !this.checkArrayReceiverUserToken(nextMessage)) {
      return 'robin-message-receiver robin-ml-auto robin-flex-row-reversed prev'
    }

    if (Array.isArray(message) && this.checkArrayReceiverUserToken(message)) {
      return 'robin-message-receiver robin-ml-auto robin-flex-row-reversed' // true
    }

    if (message.content && message.content.sender_token === this.$user_token) {
      return 'robin-message-receiver robin-ml-auto robin-flex-row-reversed' // true
    }

    if (Array.isArray(message) && !this.checkArrayReceiverUserToken(message) && nextMessage && nextMessage.content.sender_token === this.$user_token) {
      return 'robin-message-sender prev'
    }

    if (message.content && message.content.sender_token !== this.$user_token && Array.isArray(nextMessage) && this.checkArrayReceiverUserToken(nextMessage)) {
      return 'robin-message-sender prev'
    }

    return 'robin-message-sender' // false
  }

  toggleCheckAction (val: boolean): void {
    this.$emit('toggle-check-action', val)
  }

  getContactName (sender_token: string): string {
    const index = this.robinUsers.findIndex((user) => user.userToken === sender_token) as number
    const user = this.robinUsers[index] as any
    return user ? user.userName : ''
  }

  getReplyMessage (id: string): ReplyMessage {
    const message: any = this.messages.find((element: any) => {
      if (Array.isArray(element)) {
        return element.find((item) => item._id === id)
      }

      if (!Array.isArray(element)) {
        if (element._id === id) {
          return element
        }
      }

      return false
    })

    return message
  }

  async addReaction (emoji: string): Promise<void> {
    const robin = this.$robin as any
    const message = Array.isArray(this.message) ? this.message[0] : (this.message as any)

    const filteredMessage = message.reactions?.filter((reaction: { reaction: any }) => reaction.reaction === emoji)

    if (!filteredMessage || filteredMessage.length === 0) {
      await robin.reactToMessage(emoji, this.conversation._id, message._id, this.$user_token)
    } else {
      this.removeReaction(filteredMessage[0])
    }
  }

  async removeReaction (reaction: any): Promise<void> {
    const robin = this.$robin as any
    const message = Array.isArray(this.message) ? this.message[0] : (this.message as any)

    await robin.RemoveReaction(reaction._id, message._id)
  }

  onNewReaction () {
    EventBus.$on('message.reaction', (message: any) => {
      if (!Array.isArray(this.message)) {
        if (!this.message.reactions) this.message.reactions = []

        if (this.message._id === message.message_id) {
          this.message.reactions.push(message)
        }
      } else {
        const messageArray = this.message as any
        if (!messageArray[0].reactions) messageArray[0].reactions = []

        if (this.message[0]._id === message.message_id) {
          this.message[0].reactions.push(message)
        }
      }

      this.$forceUpdate()
    })
  }

  onReactionDelete () {
    EventBus.$on('message.remove.reaction', (message: any) => {
      if (message.message_id === this.message._id) {
        const reactions = this.message.reactions as any

        const reactionIndex = reactions.findIndex((item: any) => item._id === message._id)
        console.log(reactions, reactionIndex)
        if (reactionIndex > -1) {
          reactions.splice(reactionIndex, 1)
          this.$forceUpdate()
        }
      }

      if (this.message[0] && message.message_id === this.message[0]._id) {
        const reactions = this.message[0].reactions as any

        const reactionIndex = reactions.findIndex((item: any) => item._id === message._id)
        if (reactionIndex > -1) {
          reactions.splice(reactionIndex, 1)
          this.$forceUpdate()
        }
      }
    })
  }

  validateLinkInMessage () {
    const texts = this.message.content.msg.split(' ')

    return {
      containsWebsite: texts.some((text: string) => this.websiteRegex.test(text)),
      containsEmail: texts.some((text: string) => this.emailRegex.test(text))
    }
  }

  getTextsInMessage () {
    return {
      texts: this.message.content.msg.split(' '),
      length: this.message.content.msg.split(' ').length
    }
  }

  injectHtml (): String {
    let returnedMessage = ''

    for (const word of this.message.content.msg.split(' ')) {
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

  onResize () {
    this.screenWidth = window.innerWidth

    if (this.screenWidth <= 1024) {
      this.caretOpen = true
    } else {
      this.caretOpen = false
    }
  }

  onMouseOver () {
    if (!this.selectMessagesOpen) {
      this.caretOpen = true
    } else {
      this.caretOpen = false
    }
  }

  onMouseLeave () {
    if (this.screenWidth > 1024) {
      this.caretOpen = false
    }
  }

  selectMessage () {
    const checkbox = this.$refs.checkbox as any
    checkbox.checked = true
    this.toggleCheckAction(false)
  }

  forwardMessage () {
    const checkbox = this.$refs.checkbox as any
    checkbox.checked = true
    this.toggleCheckAction(false)
  }

  // Method to scroll to the position of a replied message
  scrollToRepliedMessage (id: string) {
    this.$emit('scroll-replied-message', id)
  }
}
</script>

<style scoped>
.robin-message-sender + .robin-message-receiver {
  margin-top: 1rem;
}

.robin-message-sender + .robin-message-sender,
.robin-message-receiver + .robin-message-receiver {
  margin-top: 0.25rem;
}

.robin-checkbox-container {
  align-self: flex-end;
}

.robin-message-bubble {
  position: relative;
  border-radius: 8px;
}

.robin-bubble {
  width: max-content;
  border-radius: inherit;
  position: relative;
}

/* Bubble styles */

.robin-message-sender + .robin-message-receiver,
.robin-message-receiver + .robin-message-sender {
  margin-top: 1rem;
}

.robin-message-sender + .robin-message-sender,
.robin-message-receiver + .robin-message-receiver {
  margin-top: 0.25rem;
}

.robin-message-sender.prev {
  border-radius: 8px 8px 8px 0px;
}

.robin-message-receiver.prev {
  border-radius: 8px 8px 0px 8px;
}

.robin-inner-wrapper .robin-message-sender:last-child {
  border-radius: 8px 8px 8px 0px;
}

.robin-inner-wrapper .robin-message-receiver:last-child {
  border-radius: 8px 8px 0px 8px;
}

.robin-message-receiver .robin-side-text {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.robin-message-receiver .robin-side-text >>> p {
  display: flex;
  align-items: center;
}

.robin-message-sender .robin-side-text {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.robin-messager-name {
  margin-right: 1rem;
  display: block;
}

/* open modal caret */

.robin-bubble .robin-caret-container {
  position: absolute;
  z-index: 10;
  top: 1px;
  right: 5px;
  width: 14px;
  text-align: center;
  height: 14px;
  background-color: inherit;
  border-radius: 50%;
}

/* Text */

.robin-message-sender .robin-message-bubble-inner {
  background-color: #f5f7fc;
  transition: background-color 100ms;
  position: relative;
  max-width: 300px;
}

.robin-message-receiver .robin-message-bubble-inner {
  background-color: #dbe4ff;
  transition: background-color 100ms;
  position: relative;
  max-width: 300px;
}

.robin-message-sender .robin-message-bubble-inner >>> .robin-text,
.robin-message-receiver .robin-message-bubble-inner >>> .robin-text {
  text-align: left;
}

.robin-group.robin-message-bubble-inner {
  display: flex;
  flex-wrap: nowrap;
  gap: 0;
  flex-direction: column;
  /* min-width: 60px;
  width: max-content;
  max-width: 277px; */
  padding: 0.813rem 0.625rem 0.813rem 0.75rem;
  border-radius: inherit;
}

.message-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem 0.5rem;
}

.robin-message-bubble-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem 0.5rem;
  /* min-width: 60px;
  max-width: 277px; */
  padding: 0.813rem 0.625rem 0.813rem 0.75rem;
  border-radius: inherit;
}

/* Image */

.robin-message-sender .robin-message-bubble-image {
  background-color: #f5f7fc;
  transition: background-color 100ms;
}

.robin-message-receiver .robin-message-bubble-image {
  background-color: #dbe4ff;
  transition: background-color 100ms;
}

.robin-message-bubble-image {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  padding: 0.813rem 0.625rem 1.625rem 0.75rem;
  border-radius: inherit;
  position: relative;
}

.robin-uploaded-image {
  width: 100%;
  min-width: 170px;
  max-width: 291px;
  height: 200px;
  border-radius: inherit;
  background-color: #fff;
}

.robin-message-sender .robin-message-bubble-image .robin-side-text {
  margin: 0.375rem 0.3rem 0;
  position: absolute;
  bottom: 8px;
}

.robin-message-receiver .robin-message-bubble-image .robin-side-text {
  margin: 0.375rem 1rem 0;
  position: absolute;
  right: 0;
  bottom: 8px;
}

.robin-message-bubble-image img {
  cursor: pointer;
  /* height: 100%; */
  min-height: 90px;
  height: 90px;
  max-height: 350px;
  object-fit: cover;
}

/* Video */

.robin-message-sender .robin-message-bubble-video {
  background-color: #f5f7fc;
  transition: background-color 100ms;
  position: relative;
}

.robin-message-receiver .robin-message-bubble-video {
  background-color: #dbe4ff;
  transition: background-color 100ms;
  position: relative;
}

.robin-message-bubble-video {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  padding: 0.813rem 0.625rem 0.813rem 0.75rem;
  border-radius: inherit;
}

.robin-message-sender .robin-message-bubble-video .robin-side-text {
  margin: 0.375rem 0.3rem 0;
}

.robin-message-receiver .robin-message-bubble-video .robin-side-text {
  margin: 0.375rem 1rem 0;
}

video {
  width: 100%;
  height: 100%;
  border-radius: 8px 8px 0px 0px;
}

.robin-message-bubble-video >>> .robin-reply-message-bubble {
  width: 96%;
  margin: 0.5rem auto;
}

video.video-reply {
  width: 96%;
  margin: 0 auto;
}

.v-lazy-image {
  filter: blur(5px);
  transition: filter 1.6s;
  will-change: filter;
}

.v-lazy-image-loaded {
  filter: blur(0);
}

/* Document */

.robin-message-sender .robin-message-bubble-document {
  background-color: #f5f7fc;
  transition: background-color 100ms;
  position: relative;
}

.robin-message-receiver .robin-message-bubble-document {
  background-color: #dbe4ff;
  transition: background-color 100ms;
  position: relative;
}

.robin-message-bubble-document {
  display: flex;
  flex-direction: column;
  padding: 0.875rem 0.625rem 0.625rem 0.75rem;
  /* border: 1px solid rgba(21, 174, 115, 0.2); */
  border-radius: inherit;
  /* background-color: #fafafa; */
}

.robin-message-bubble-document .robin-uploaded-document {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #ecebeb;
  border-radius: 4px;
}

.robin-message-sender .robin-message-bubble-document .robin-uploaded-document {
  padding: 0.5rem 0.938rem 0.5rem 0.5rem;
}

.robin-message-receiver .robin-message-bubble-document .robin-uploaded-document {
  padding: 0.5rem 0.938rem 0.5rem 0.5rem;
}

.robin-message-bubble-document .robin-uploaded-document .details {
  margin-right: 2.2rem;
}

.robin-message-bubble-document .robin-uploaded-document svg {
  margin-right: 0.5rem;
  /* max-width: 100%;
  height: auto; */
}

.robin-message-receiver .robin-message-bubble-document .robin-side-text {
  margin: 0.375rem 0 0;
}

/* .robin-message-receiver .robin-message-bubble-document >>> .robin-text {
  color: #8fbfad !important;
}

.robin-message-sender .robin-message-bubble-document >>> .robin-text {
  color: #4568d1 !important;
} */

.robin-message-sender .robin-message-bubble-document {
  display: flex;
  align-items: center;
  border-radius: inherit;
  background-color: #fafafa;
}

/* .robin-message-bubble-document >>> .robin-text {
  margin-left: 0.75rem;
} */

.robin-message-receiver .robin-side-text >>> p .robin-svg {
  /* margin-top: 0.099rem; */
  height: 14px;
}

.robin-message-sender .robin-popup-container.message {
  position: absolute;
  top: 30px;
  left: 0;
  z-index: 100;
}

.robin-message-receiver .robin-popup-container.message {
  position: absolute;
  top: 30px;
  right: 0;
  z-index: 100;
}

.robin-message-sender .robin-popup-container.reactions {
  position: absolute;
  top: -50px;
  left: 50%;
  z-index: 100;
}

.robin-message-receiver .robin-popup-container.reactions {
  position: absolute;
  top: -50px;
  right: 50%;
  z-index: 100;
}

.robin-message-receiver .robin-popup-container.reactions >>> .robin-popup::before {
  bottom: -3px;
  left: 100px;
}

.robin-message-receiver .robin-popup-container.reactions >>> .robin-popup::after {
  bottom: -8px;
  left: 109px;
}

.robin-popup-container.message.top {
  /* top: -230px !important; */
  top: -170px;
}

.robin-message-sender .robin-popup-container.message >>> .robin-zoomIn,
.robin-message-sender .robin-popup-container.message >>> .robin-zoomOut {
  transform-origin: top center; /* left */
}

.robin-message-sender .robin-popup-container.reactions >>> .robin-zoomIn,
.robin-message-sender .robin-popup-container.reactions >>> .robin-zoomOut {
  transform-origin: bottom top;
}

.robin-message-receiver .robin-popup-container.message >>> .robin-zoomIn,
.robin-message-receiver .robin-popup-container.message >>> .robin-zoomOut {
  transform-origin: top center; /* right */
}

.robin-message-receiver .robin-popup-container.reactions >>> .robin-zoomIn,
.robin-message-receiver .robin-popup-container.reactions >>> .robin-zoomOut {
  transform-origin: bottom top;
}

.robin-message-sender .robin-popup-container.top >>> .robin-zoomIn,
.robin-message-sender .robin-popup-container.top >>> .robin-zoomOut {
  transform-origin: bottom center;
}

.robin-message-receiver .robin-popup-container.top >>> .robin-zoomIn,
.robin-message-receiver .robin-popup-container.top >>> .robin-zoomOut {
  transform-origin: bottom center;
}

.robin-message-receiver .robin-reactions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: max-content;
  /* height: 24px; */
  /* display: grid; */
  /* grid-template-columns: repeat(auto-fit, minmax(22px, 22px)); */
  gap: 0.25rem 0.25rem;
  padding: 0.25rem 0.375rem;
  background-color: #e6e6e6;
  border: 2px solid #E5E5E5;
  border-radius: 100px;
  position: absolute;
  top: -25px;
  left: -10px;
  z-index: 1;
}

.robin-message-sender .robin-reactions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: max-content;
  gap: 0.25rem 0.25rem;
  padding: 0.25rem 0.375rem;
  background-color: #e6e6e6;
  border: 2px solid #E5E5E5;
  border-radius: 100px;
  position: absolute;
  top: -25px;
  right: -10px;
  z-index: 1;
}

/* .robin-message-receiver .robin-reactions {
  place-content: start;
}

.robin-message-sender .robin-reactions {
  place-content: end; */
/* } */

.robin-message-receiver .robin-reactions::before {
  content: '';
  position: absolute;
  bottom: -4.5px;
  left: 45%;
  width: 10px;
  height: 5px;
  background-color: #e6e6e6;
  border: 2px solid #E5E5E5;
  border-bottom-left-radius: 110px;
  border-bottom-right-radius: 110px;
  border-top: none;
  transform: rotate(-5deg);
  z-index: 1;
}

.robin-message-sender .robin-reactions::before {
  content: '';
  position: absolute;
  bottom: -4.5px;
  right: 50%;
  width: 10px;
  height: 5px;
  background-color: #e6e6e6;
  border: 2px solid #E5E5E5;
  border-bottom-left-radius: 110px;
  border-bottom-right-radius: 110px;
  border-top: none;
  transform: rotate(-5deg);
  z-index: 1;
}

/* .robin-message-receiver .robin-reactions::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 45%;
  width: 9px;
  height: 4px;
  border-bottom-left-radius: 110px;
  border-bottom-right-radius: 110px;
  background-color: #e6e6e6;
  border: 2px solid #fff;
  transform: rotate(-10deg);
  border-top: none;
  z-index: 1;
} */

.robin-reaction {
  font-size: 0.825rem;
  width: 16px;
  height: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.robin-reaction:active {
  transform: scale(0.9);
}

/* Website & Email */

a {
  display: block;
  color: #4568d1;
  text-decoration: none;
  /* max-width: 220px; */
}

.robin-link-container {
  font-size: 1rem;
  max-width: 209px;
  word-break: break-word;
}

.robin-link-container >>> a {
  font-size: 0.75rem;
  color: #4568d1;
}

.robin-link-preview {
  width: 209px;
  margin-top: 0.5rem;
}

.robin-link-preview .robin-card {
  width: 100%;
  max-width: initial;
}

.robin-link-preview .robin-card-img-top {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 4px 4px 0px 0px;
}

.robin-link-preview .robin-card-block {
  text-overflow: ellipsis;
  height: 61px;
  max-height: 61px;
  background-color: #f5f7fc;
  border-radius: 0px 0px 4px 4px;
  padding: 0.438rem 0.25rem;
}

.robin-link-preview .robin-card-text {
  margin: 0;
}

@media (max-width: 480px) {
  .robin-message-bubble-inner,
  .robin-message-bubble-image,
  .robin-message-bubble-video,
  .robin-message-bubble-document {
    max-width: 220px;
  }

  .robin-message-bubble-document .robin-uploaded-document {
    justify-content: space-between;
  }

  .robin-message-bubble-document .robin-text {
    margin-left: 0;
  }

  .robin-message-bubble-document .robin-uploaded-document .details,
  .robin-message-bubble-document .robin-uploaded-document svg {
    margin-right: 0;
  }
}

@media (min-width: 1025px) {
  /* Sender */

  .robin-message-sender .robin-message-bubble-inner:hover {
    background-color: #fbfbfb;
  }

  .robin-message-sender .robin-message-bubble-document:hover {
    background-color: #fbfbfb;
  }

  .robin-message-sender .robin-message-bubble-video:hover {
    background-color: #fbfbfb;
  }

  .robin-message-sender .robin-message-bubble-image:hover {
    background-color: #fbfbfb;
  }

  .robin-message-sender .robin-non-clickable:hover {
    background-color: #F5F7FC;
  }

  /* Receiver */

  .robin-message-receiver .robin-message-bubble-inner:hover {
    background-color: #fbfbfb;
  }

  .robin-message-receiver .robin-message-bubble-document:hover {
    background-color: #fbfbfb;
  }

  .robin-message-receiver .robin-message-bubble-video:hover {
    background-color: #fbfbfb;
  }

  .robin-message-receiver .robin-message-bubble-image:hover {
    background-color: #fbfbfb;
  }

  .robin-message-receiver .robin-non-clickable:hover {
    background-color: #DBE4FF;
  }
}
</style>
