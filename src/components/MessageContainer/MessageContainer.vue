<template>
  <div class="robin-message-container" v-on-clickaway="onChatClickAway">
    <ChatHeader :conversation="conversation" :key="key" :selected-messages="selectedMessages" @delete-selected-messages="openPrompt('delete select')" />

    <div class="robin-wrapper robin-flex robin-flex-column robin-flex-space-between" id="message-container" ref="message" @scroll="onScroll()" data-testid="message">
      <div class="robin-inner-wrapper-loader robin-flex robin-flex-align-center" id="infinite-loader" v-if="(isMessagesLoading && currentPage > 0) || (!offlineMessages.messages[conversation._id] && isMessagesLoading)">
        <div class="robin-spinner"></div>
      </div>

      <div class="robin-inner-wrapper-offline" v-if="offlineMessages.messages[conversation._id]">
        <MessageContent v-for="(message, index) in offlineMessages.messages[conversation._id]" :ref="`message-${String(index)}`" :groupname-colors="groupnameColors" :uncheck="uncheck" @open-preview="openImagePreview($event)" :key="`message-${String(index + key)}`" v-show="!message.is_deleted" :message="message" :conversation="conversation" :message-popup="getMessagePopup(index)" :messages="offlineMessages.messages[conversation._id]" :stored-messages="messages" :index="index" :scroll="scroll" :last-id="!Array.isArray(message) && messages.length - 3 < parseInt(String(index)) ? message._id : ''" :read-receipts="readReceipts" @toggle-check-action="toggleCheckAction($event, message)" @reply-message="replyMessage($event)" @forward-message="forwardMessage = true" @scroll-replied-message="scrollToRepliedMessage" />
      </div>

      <!-- <div class="robin-inner-wrapper" v-if="!isMessagesLoading">
        <MessageContent v-for="(message, index) in messages" :ref="`message-${String(index)}`" :uncheck="uncheck" @open-preview="openImagePreview($event)" :key="`message-${String(index + key)}`" v-show="!message.is_deleted" :message="message" :conversation="conversation" :message-popup="getMessagePopup(index)" :messages="messages" :index="index" :scroll="scroll" :last-id="!Array.isArray(message) && messages.length - 3 < parseInt(String(index)) ? message._id : ''" :read-receipts="readReceipts" @toggle-check-action="toggleCheckAction($event, message)" @reply-message="replyMessage($event)" @forward-message="forwardMessage = true" @scroll-replied-message="scrollToRepliedMessage" />
      </div> -->

      <div class="robin-scroll-to-bottom robin-bounceIn" v-show="scrollUp && scroll" @click="scrollToBottom()" data-testid="scroll-bottom-button">
        <i class="robin-material-icon"> arrow_downward </i>
      </div>
    </div>

    <MessageInputBar :conversation="conversation" :key="'input-' + newConversationOpenCount" :message-reply="messageReply" @open-camera="openCamera()" :captured-image="capturedImage" @on-close-reply="onCloseReply()" v-show="!selectMessagesOpen || !isForwardMessagesEnabled" />

    <div class="robin-forward-tab" v-if="selectMessagesOpen && isForwardMessagesEnabled">
      <Content color="#51545C"> {{ selectedMessages.length }} Messages Selected </Content>
      <Button emit="forward-message" v-show="selectedMessages.length > 0" @forward-message="forwardMessage = true"> Forward Messages </Button>
    </div>

    <Camera ref="popup-1" :camera-opened="popUpState.cameraOpened" @close="closeCamera()" @captured-image="handleCapturedImage" v-show="popUpState.cameraOpened" />
    <ForwardMessage v-if="forwardMessage == true" @closemodal="onCloseForwardMessagePopup()" :selected-messages="selectedMessages" />
    <Prompt :status="promptStatus" @proceed="proceed()" v-show="promptOpen" @closemodal="closePrompt()" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import EventBus from '@/event-bus'
import Component from 'vue-class-component'
import { mixin as clickaway } from 'vue-clickaway'
import ChatHeader from '../ChatHeader/ChatHeader.vue'
import MessageInputBar from '../MessageInputBar/MessageInputBar.vue'
import Content from '@/components/Content/Content.vue'
import Button from '@/components/Button/Button.vue'
import Camera from '../Camera/Camera.vue'
import mime from 'mime'
import localForage from 'localforage'
import store from '@/store/index'
import MessageContent from '../MessageContent/MessageContent.vue'
import ForwardMessage from '../ForwardMessage/ForwardMessage.vue'
import Prompt from '../Prompt/Prompt.vue'

// eslint-disable-next-line
@Component<MessageContainer>({
  name: 'MessageContainer',
  components: {
    ChatHeader,
    Content,
    MessageInputBar,
    Camera,
    MessageContent,
    ForwardMessage,
    Button,
    Prompt
  },
  mixins: [clickaway],
  watch: {
    messages: {
      handler (val: any): void {
        this.popUpState.messagePopUp = []
        ;[...val].forEach((val) => {
          this.popUpState.messagePopUp.push({
            opened: false,
            _id: val._id
          })
        })

        EventBus.$emit('messages.get', [...val])
      },
      immediate: true
    },
    offlineMessages: {
      handler (val: any): void {
        this.popUpState.messagePopUp = []
        const messages = this.offlineMessages.messages[this.conversation._id]

        if (messages) {
          messages.forEach((val: any) => {
            this.popUpState.messagePopUp.push({
              opened: false,
              _id: val._id
            })
          })

          EventBus.$emit('messages.get', [...messages])
        }
      },
      immediate: true
    },
    selectMessagesOpen: {
      handler (val): void {
        if (!val) {
          this.selectedMessages = []
          this.uncheck = true
          this.closePrompt()
        }

        if (val) {
          this.uncheck = false
        }
      }
    },
    clearMessages: {
      handler (val): void {
        if (this.clearMessages) {
          this.openPrompt('clear messages')
        } else {
          this.closePrompt()
        }
      }
    },
    exitGroup: {
      handler (val): void {
        if (this.exitGroup) {
          this.openPrompt('exit group')
        } else {
          this.closePrompt()
        }
      }
    },
    removeParticipant: {
      handler (val): void {
        if (this.removeParticipant) {
          this.openPrompt('remove participant')
        } else {
          this.closePrompt()
        }
      }
    },
    isImageReplying: {
      handler (val): void {
        this.messageReply = this.imagesToPreview[this.imageSelected]
      }
    }
  }
})
export default class MessageContainer extends Vue {
  promptOpen = false
  promptStatus = '' as any
  uncheck = false
  windowHeight = 0 as number
  readReceipts = [] as Array<string>
  selectedMessages = [] as Array<any>
  forwardMessage = false as boolean
  conversation = {} as any
  messages = [] as any
  promise = null as any
  capturedImage = null as any
  scroll = false as boolean
  scrollUp = false as boolean
  lastScroll = 0
  popUpState = {
    cameraOpened: false,
    messagePopUp: [] as Array<any>
  }

  offlineMessages = { messages: {} } as any

  messageReply = {} as any
  messageError = false as boolean

  isMessagesLoading = true as boolean

  messagePopUpIndex = 0 as number
  key = 0 as number
  newConversationOpenCount = 0 as number
  observer = null as any
  currentPage = 0 as number
  totalPages = 0 as number

  imageRegex = /^image/ as any
  videoRegex = /^video/ as any
  documentRegex = /(csv|xlsx|xls|doc|docx|ppt|pptx|txt|pdf|ppt|rtf|rar|tar|odt|md|zip|7z|zip|html)$/
  emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  websiteRegex = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

  created () {
    this.handleConversationOpen()
    this.onNewMessage()
    this.onMessageDelete()
    this.onImageDelete()
    this.handleUserConnect()
    this.handleUserDisconnect()
    this.getReadReceipts()
  }

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
  }

  get groupnameColors () {
    const colors: string[] = ['#F8863D', '#18C583', '#FF0000', '#0F0FFE', '#9B2226', '#AE2012', '#BB3E03', '#CA6702', '#7F5539', '#606C38', '#283618', '#03045E', '#370617', '#6A040F', '#EE9B00', '#0A9396', '#005F73', '#0AFF99', '#9D4EDD', '#7400B8', '#6B705C', '#CB997E', '#A4133C', '#38B000', '#14213D', '#007200', '#7209B7', '#3D405B', '#8338EC', '#3A86FF', '#5A189A', '#3C096C', '#BBC4DF']
    const userColors = {} as any

    for (const user of this.$robin_users) {
      userColors[user.userToken] = colors[Math.floor(Math.random() * colors.length)]
    }

    return userColors
  }

  get currentConversation () {
    return store.state.currentConversation
  }

  get selectMessagesOpen () {
    return store.state.selectMessagesOpen
  }

  get isForwardMessagesEnabled () {
    return store.state.forwardMessagesEnabled
  }

  get clearMessages () {
    return store.state.clearMessages
  }

  get exitGroup () {
    return store.state.exitGroup
  }

  get imagePreviewOpen () {
    return store.state.imagePreviewOpen
  }

  get imagesToPreview () {
    return store.state.imagesToPreview
  }

  get imageSelected () {
    return store.state.imageSelected
  }

  get isImageReplying () {
    return store.state.isImageReplying
  }

  get participantToken () {
    return store.state.participantToken
  }

  get removeParticipant () {
    return store.state.removeParticipant
  }

  handleConversationOpen (): void {
    EventBus.$on('conversation-opened', (conversation: any) => {
      this.getOfflineMessages()

      this.messageReply = {}
      this.messages = []
      this.currentPage = 0
      this.totalPages = 0
      this.newConversationOpenCount += 1
      this.conversation = conversation || {}

      store.setState('currentConversation', conversation)

      this.scroll = false
      this.scrollUp = false

      this.isMessagesLoading = true

      EventBus.$emit('mark-as-read', conversation)
      store.setState('messageViewProfileOpen', false)

      this.getConversationMessages().then(() => {
        if (!this.messageError) {
          this.isMessagesLoading = false
        }
      })
    })
  }

  async initializeReadReceipts (messageIds: Array<string>): Promise<void> {
    const res = await this.$robin.sendReadReceipts(messageIds, this.conversation._id)
    // (res, messageIds)

    if (!res.error) {
      // (res.error, res)
    }

    if (res.error) {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  getReadReceipts () {
    EventBus.$on('read.reciept', (message: any) => {
      this.readReceipts.push(...message.message_ids)
    })
  }

  handleUserConnect () {
    EventBus.$on('user.connect', (conversation: string) => {
      this.refresh()
    })
  }

  handleUserDisconnect () {
    EventBus.$on('user.disconnect', (conversation: string) => {
      this.refresh()
    })
  }

  refresh () {
    this.key += 1
  }

  onNewMessage () {
    EventBus.$on('new-message', (message: any) => {
      // ('new-message', message)
      if (message.conversation_id === this.conversation._id) {
        this.messages.push(message)

        if (this.offlineMessages.messages[message.conversation_id]) {
          this.offlineMessages.messages[message.conversation_id].push(message)
        }

        this.scrollToBottom()

        if (message.sender_token !== this.$user_token) {
          const messageIds = [this.messages[this.messages.length - 1]._id]
          this.initializeReadReceipts(messageIds)
        }
      }
      if (message.conversation_id !== this.currentConversation._id) {
        const index = this.$regularConversations.findIndex((item) => item._id === message.conversation_id)
        // (message, index)

        EventBus.$emit('mark-as-unread', this.$regularConversations[index])
      }
      this.$conversations.forEach((conversation, index) => {
        if (conversation._id === message.conversation_id) {
          // ('Conversation: ', conversation, this.conversation)
          this.$conversations[index].updated_at = message.content.timestamp
          this.$conversations[index].last_message = message.content
          const newConv = this.$conversations[index]
          if (!newConv.archived_for || newConv.archived_for.length === 0) {
            EventBus.$emit('search-text.reset')
            EventBus.$emit('regular-conversation.delete', newConv)
            EventBus.$emit('regular-conversation.add', newConv)
          } else {
            EventBus.$emit('archived-conversation.delete', newConv)
            EventBus.$emit('archived-conversation.add', newConv)
          }
        }
      })
    })
  }

  onMessageDelete () {
    EventBus.$on('message-deleted', (message: any) => {
      const index = this.messages.findIndex((item: any) => item._id === message._id) as number
      const offlineMessageIndex = this.offlineMessages.messages[this.conversation._id].findIndex((item: any) => item._id === message._id) as number

      this.messages[index].is_deleted = true
      this.offlineMessages.messages[this.conversation._id][offlineMessageIndex].is_deleted = true
      this.$forceUpdate()
    })
  }

  onImageDelete () {
    EventBus.$on('image-deleted', (message: any) => {
      // (message)
      const messageIndex = this.messages.findIndex((item: any) => {
        if (Array.isArray(item)) return item.some((image) => image._id === message._id)
        return false
      }) as number

      const offlineMessageIndex = this.offlineMessages.messages[this.conversation._id].findIndex((item: any) => {
        if (Array.isArray(item)) return item.some((image) => image._id === message._id)
        return false
      }) as number

      if (messageIndex >= 0) {
        // Delete message from image grid.
        const index = this.messages[messageIndex].findIndex((item: any) => item._id === message._id) as number
        this.messages[messageIndex][index].is_deleted = true
        this.$forceUpdate()
      }

      if (messageIndex === -1) {
        // Delete message from message list.
        EventBus.$emit('message-deleted', message)
      }

      if (offlineMessageIndex >= 0) {
        // Delete message from image grid.
        const index = this.offlineMessages.messages[this.conversation._id][offlineMessageIndex].findIndex((item: any) => item._id === message._id) as number
        this.offlineMessages.messages[this.conversation._id][offlineMessageIndex][index].is_deleted = true
        this.$forceUpdate()
      }

      if (offlineMessageIndex === -1) {
        // Delete message from message list.
        EventBus.$emit('message-deleted', message)
      }

      EventBus.$emit('messages.get', this.messages)
    })
  }

  handleReadReceipts (data: any) {
    const filterMessage = data ? data.filter((item: any) => !item.is_read && item.sender_token !== this.$user_token) : []
    const messageIds = filterMessage.map((item: any) => item._id)

    if (messageIds.length > 0) {
      this.initializeReadReceipts(messageIds)
    }
  }

  async getConversationMessages (): Promise<void> {
    const res = await this.$robin.getConversationMessages(this.conversation._id, this.$user_token)

    if (res && !res.error) {
      this.messageError = false
      this.testMessages(res.data ? res.data : [])

      this.currentPage = this.messages.length > 20 ? this.messages.length - 20 : 0

      if (!this.offlineMessages.messages[this.conversation._id]) {
        this.offlineMessages.messages[this.conversation._id] = [...this.messages.slice(this.currentPage, this.messages.length)]
      }

      if (this.messages.length > 19) {
        this.setOfflineMessages(this.messages.slice(this.currentPage, this.messages.length))
      } else {
        this.setOfflineMessages(this.messages.slice(0, this.messages.length))
      }

      this.handleReadReceipts(res.data)
    } else {
      this.messageError = true
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }

    this.scrollToBottom()
  }

  loadMoreMessages () {
    const message = this.$refs.message as HTMLElement

    this.isMessagesLoading = true

    setTimeout(() => {
      this.isMessagesLoading = false
      this.currentPage -= 20

      const lastPage = this.messages.length - (this.messages.length - this.currentPage) + 20
      const messages = this.messages.slice(this.currentPage < 20 ? 0 : this.currentPage, lastPage)

      for (let i = messages.length - 1; i >= 0; i--) {
        this.offlineMessages.messages[this.conversation._id].unshift(messages[i])
      }

      message.scrollTop = 160
    }, 500)
  }

  scrollToBottom (): void {
    window.setTimeout(() => {
      const message = this.$refs.message as HTMLElement
      if (message) {
        message.scrollTop = message.scrollHeight
        this.scrollUp = false
      }
    }, 100)
  }

  openCamera (): void {
    this.popUpState.cameraOpened = true
  }

  closeCamera (): void {
    const popup = this.$refs['popup-1'] as any
    popup.$refs['popup-body'].classList.remove('robin-squeezeOut')
    popup.$refs['popup-body'].classList.add('robin-squeezeIn')

    window.setTimeout(() => {
      popup.$refs['popup-body'].classList.remove('robin-squeezeIn')
      popup.$refs['popup-body'].classList.add('robin-squeezeOut')

      this.popUpState.cameraOpened = false
    }, 100)
  }

  openImagePreview ($event: any): void {
    store.setState('imagePreviewOpen', true)
    store.setState('imagesToPreview', $event)
    // this.imagesToPreview = $event
  }

  openMessagePopup (val: number): void {
    this.messagePopUpIndex = val
    this.popUpState.messagePopUp[this.messagePopUpIndex].opened = true
  }

  closeMessagePopup (event: any): void {
    this.popUpState.messagePopUp[this.messagePopUpIndex].opened = false
    this.messagePopUpIndex = 0
  }

  getMessagePopup (index: any): { opened: boolean; _id: string } {
    return this.popUpState.messagePopUp[parseInt(index)]
  }

  handleCapturedImage (val: Object): void {
    this.capturedImage = val
  }

  checkAttachmentType (attachmentUrl: String): string {
    const strArr = attachmentUrl.split('.')
    return `${mime.getType(strArr[strArr.length - 1])}`
  }

  testMessages (messages: Array<any>): void {
    const newMessages = []
    let temp = [] as any

    for (let index = 0; index < messages.length; index += 1) {
      const fileMimeType = this.checkAttachmentType(messages[index].content.attachment || '') as any
      const isImage = this.imageRegex.test(fileMimeType && (!messages[index].content.msg || messages[index].content.msg === 'undefined') ? fileMimeType : '') as any

      const nextFileMimeType = this.checkAttachmentType(messages[index + 1] ? messages[index + 1].content.attachment || '' : '') as any
      const isImageNext = this.imageRegex.test(messages[index + 1] ? (nextFileMimeType && (!messages[index + 1].content.msg || messages[index + 1].content.msg === 'undefined') ? nextFileMimeType : '') : '') as any

      if (isImage) {
        temp.push(messages[index])
      }

      if (temp.length > 1) {
        if (!Array.isArray(newMessages[newMessages.length - 1])) {
          newMessages[newMessages.length] = temp
        }
      }

      if (!isImageNext || !isImage) {
        // eslint-disable-next-line
        if (Array.isArray(newMessages[newMessages.length - 1]) && isImage) {
        } else {
          temp = []
          newMessages.push(messages[index])
        }
      }
    }

    this.messages = newMessages
  }

  async clearAllMessages (): Promise<void> {
    const id = [] as Array<any>

    for (let i: number = 0; i < this.messages.length; i += 1) {
      if (Array.isArray(this.messages[i])) {
        this.messages[i].forEach((item: { _id: any }) => {
          id.push(item._id)
        })
      }

      if (!Array.isArray(this.messages[i])) {
        id.push(this.messages[i]._id)
      }
    }

    const res = await this.$robin.deleteMessages([...id], this.$user_token)
    if (res && !res.error) {
      this.$toast.open({
        message: 'Messages Deleted.',
        type: 'success',
        position: 'bottom-left'
      })
      this.promptOpen = false
      this.promise = this.getConversationMessages()
      this.promise.then(() => {
        this.scrollToBottom()
      })
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }

    store.setState('clearMessages', false)
  }

  onScroll (): void {
    this.handleScrollUp()

    this.scroll = true
  }

  handleScrollUp () {
    const message = this.$refs.message as HTMLElement
    const endOfScroll = Math.floor(message.scrollTop) > Math.floor((message.scrollHeight - message.clientHeight) - 20)

    if (endOfScroll) {
      this.scrollUp = false
    }

    if (message.scrollTop <= this.lastScroll) {
      if (!this.isMessagesLoading) {
        this.scrollUp = true
      }
    }

    // console.log(message.scrollTop, this.currentPage, endOfScroll)
    // this.currentPage > 19
    if (message.scrollTop === 0 && this.offlineMessages.length !== this.messages.length && this.currentPage > 19) {
      this.loadMoreMessages()
    }

    this.lastScroll = message.scrollTop <= 0 ? 0 : message.scrollTop
  }

  toggleCheckAction (val: boolean, message: any): void {
    if (!val) {
      this.selectMessage(message)
    } else {
      this.removeSelectedMessage(message)
    }
  }

  selectMessage (message: any): void {
    if (Array.isArray(message)) {
      message.forEach((item) => {
        this.selectedMessages.push(item)
      })
    } else {
      this.selectedMessages.push(message)
    }
  }

  removeSelectedMessage (message: any): void {
    const index = this.selectedMessages.findIndex((item) => item._id === message._id)

    this.selectedMessages.splice(index, 1)
  }

  onChatClickAway (): void {
    store.setState('selectMessagesOpen', false)
  }

  onCloseForwardMessagePopup (): void {
    this.forwardMessage = false
    store.setState('selectMessagesOpen', false)
    this.uncheck = true
    // this.refresh()
  }

  replyMessage (message: any): void {
    this.messageReply = message
  }

  onCloseReply (): void {
    this.messageReply = {}
  }

  async deleteSelectedMessages () {
    const res = await this.$robin.deleteMessages(
      this.selectedMessages.map((message) => message._id),
      this.$user_token
    )

    if (res && !res.error) {
      this.selectedMessages.forEach((message) => EventBus.$emit('message-deleted', message))

      this.selectedMessages = []
      store.setState('selectMessagesOpen', false)
      this.uncheck = true
      this.promptOpen = false
      this.refresh()

      this.$toast.open({
        message: this.selectedMessages.length > 0 ? 'Messages Deleted.' : 'Message Deleted.',
        type: 'success',
        position: 'bottom-left'
      })
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  async handleRemoveParticipant () {
    const res = await this.$robin.removeGroupParticipant(this.currentConversation._id, this.participantToken)

    if (res && !res.error) {
      // EventBus.$emit('participant.left.group', { conversation_id: this.currentConversation._id, user_token: this.participantToken })
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  openPrompt (status: String) {
    this.promptOpen = true

    this.promptStatus = status
  }

  closePrompt () {
    this.promptOpen = false
    store.setState('selectMessagesOpen', false)
    store.setState('clearMessages', false)
    store.setState('exitGroup', false)
    store.setState('removeParticipant', false)
  }

  // Method to scroll to the position of a replied message
  scrollToRepliedMessage (id: string): void {
    const messageIndex: any = this.offlineMessages.messages[this.conversation._id].findIndex((element: any) => {
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
    const messageRef: any = this.$refs[`message-${messageIndex}`]
    messageRef[0].$el.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  onResize () {
    ('resized')
    this.scrollUp = false
    this.windowHeight = window.innerHeight
  }

  async handleLeaveGroup () {
    const res = await this.$robin.removeGroupParticipant(this.conversation._id, this.$user_token)

    if (res && !res.error) {
      this.$toast.open({
        message: 'You left group',
        type: 'success',
        position: 'bottom-left'
      })

      EventBus.$emit('regular-conversation.delete', this.conversation)
      EventBus.$emit('close-conversation')

      store.setState('exitGroup', false)
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  proceed () {
    if (this.promptStatus === 'delete select' && this.selectMessagesOpen) {
      this.deleteSelectedMessages()
    }
    if (this.promptStatus === 'clear messages' && this.clearMessages) {
      this.clearAllMessages()
    }
    if (this.promptStatus === 'exit group' && this.exitGroup) {
      this.handleLeaveGroup()
    }
    if (this.promptStatus === 'remove participant' && this.removeParticipant) {
      this.handleRemoveParticipant()
    }
  }

  async getOfflineMessages (): Promise<any> {
    try {
      const value = (await localForage.getItem('messages')) as Array<any>
      this.offlineMessages = value
        ? { ...value }
        : { messages: {} }
    } catch (error) {
      console.error(error)
    }
  }

  async setOfflineMessages (messages: Array<any>): Promise<void> {
    try {
      const data = { messages: { [this.conversation._id]: messages } } as any

      for (const item in this.offlineMessages.messages) {
        if (!data.messages[item]) {
          data.messages[item] = this.offlineMessages.messages[item]
        }
      }

      await localForage.setItem('messages', data)
      this.getOfflineMessages()
    } catch (error) {
      console.error(error)
    }
  }
}
</script>

<style scoped>
.robin-message-container {
  width: 100%;
  /* height: 100vh; */
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 0;
  overflow-y: hidden;
}

.robin-wrapper {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  background-color: #fff;
}

.robin-inner-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  /* height: 100%; */
  padding: 1rem clamp(3%, 5vw, 2.688rem) 1.25rem clamp(3%, 5vw, 3.125rem);
}

.robin-inner-wrapper-loader {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  /* height: 10%; */
  padding: 1rem clamp(3%, 5vw, 2.688rem) 1rem clamp(3%, 5vw, 3.125rem);
}

.robin-inner-wrapper-offline {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  /* height: 100%; */
  padding: 1rem clamp(3%, 5vw, 2.688rem) 1.25rem clamp(3%, 5vw, 3.125rem);
}

.network-error {
  font-size: 1rem;
  color: var(--primary-color);
}

.robin-forward-tab {
  height: 88px;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  padding-right: 2.5rem;
  justify-content: space-between;
  box-shadow: 0px 3px 20px 5px rgba(69, 104, 209, 0.1);
  background-color: #fff;
}

.robin-scroll-to-bottom {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  position: absolute;
  bottom: 120px;
  right: 30px;
  z-index: 1;
  background-color: #fff;
  box-shadow: 0 1px 6px 0 rgb(0 0 0 / 6%), 0 2px 32px 0 rgb(0 0 0 / 16%);
  cursor: pointer;
}

.robin-scroll-to-bottom i {
  color: rgba(21, 174, 115, 1);
  font-size: 1.25rem;
  max-height: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@media (min-width: 768px) {
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-track {
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

@media (min-width: 1200px) {
  .robin-message-container {
    overflow-y: auto;
  }
}
</style>
