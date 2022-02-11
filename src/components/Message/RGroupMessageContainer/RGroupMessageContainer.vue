<template>
  <div class="robin-message-container" v-on-clickaway="onChatClickAway">
    <RGroupChatHeader :conversation="conversation" :key="key" :selected-messages="selectedMessages" @delete-selected-messages="openPrompt()" />

    <div class="robin-wrapper robin-flex robin-flex-column robin-flex-space-between">
      <div class="robin-inner-wrapper robin-flex robin-flex-align-center" v-if="isMessagesLoading">
        <div class="robin-spinner"></div>
      </div>

      <div class="robin-inner-wrapper" ref="message" @scroll="onScroll()" v-else>
        <MessageContent v-for="(message, index) in messages" :ref="`message-${String(index)}`" :uncheck="uncheck" @open-preview="openImagePreview($event)" :key="`message-${String(index + key)}`" v-show="!message.is_deleted" :message="message" :conversation="conversation" :message-popup="getMessagePopup(index)" :messages="messages" :index="index" :scroll="scroll" :last-id="!Array.isArray(message) && messages.length - 3 < parseInt(String(index)) ? message._id : ''" :read-receipts="readReceipts" @toggle-check-action="toggleCheckAction($event, message)" @reply-message="replyMessage($event)" @forward-message="forwardMessage = true" @scroll-replied-message="scrollToRepliedMessage" />
      </div>
    </div>

    <RMessageInputBar :conversation="conversation" :message-reply="messageReply" @open-camera="openCamera()" :captured-image="capturedImage" @on-close-reply="onCloseReply()" v-show="!selectMessagesOpen" />

    <div class="robin-forward-tab" v-show="selectMessagesOpen">
      <RText color="#51545C">
        {{ selectedMessages.length }} Messages Selected
      </RText>

      <RButton emit="forward-message" v-show="selectedMessages.length > 0" @forward-message="forwardMessage = true">
        Forward Messages
      </RButton>
    </div>

    <RCamera ref="popup-1" :camera-opened="popUpState.cameraOpened" @close="closeCamera()" @captured-image="handleCapturedImage" v-show="popUpState.cameraOpened" />

    <RForwardMessage v-if="forwardMessage == true" @closemodal="onCloseForwardMessagePopup()" :selected-messages="selectedMessages" />

    <RPrompt @proceed="deleteSelectedMessages()" v-show="promptOpen" @closemodal="closePrompt()" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import EventBus from '@/event-bus'
import Component from 'vue-class-component'
import { mixin as clickaway } from 'vue-clickaway'
import RGroupChatHeader from '../RGroupChatHeader/RGroupChatHeader.vue'
import RMessageInputBar from '../RMessageInputBar/RMessageInputBar.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import RButton from '@/components/ChatList/RButton/RButton.vue'
import RCamera from '../RCamera/RCamera.vue'
import mime from 'mime'
import store from '../../../store/index'
import MessageContent from '../MessageContent/MessageContent.vue'
import RForwardMessage from '../RForwardMessage/RForwardMessage.vue'
import RPrompt from '../RPrompt/RPrompt.vue'
// eslint-disable-next-line
@Component<RGroupMessageContainer>({
  name: 'RGroupMessageContainer',
  components: {
    RGroupChatHeader,
    RText,
    RMessageInputBar,
    RCamera,
    MessageContent,
    RForwardMessage,
    RButton,
    RPrompt
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
    selectMessagesOpen: {
      handler (val): void {
        if (!val) {
          this.selectedMessages = []
          this.uncheck = true
        }

        if (val) {
          this.uncheck = false
        }
      }
    },
    clearMessages: {
      handler (val): void {
        if (val) {
          this.clearAllMessages()
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
export default class RGroupMessageContainer extends Vue {
  promptOpen = false
  uncheck = false
  readReceipts = [] as Array<string>
  selectedMessages = [] as Array<any>
  forwardMessage = false as boolean
  conversation = {} as any
  messages = [] as any
  promise = null as any
  capturedImage = null as any
  scroll = false as boolean
  popUpState = {
    cameraOpened: false,
    messagePopUp: [] as Array<any>
  }

  messageReply = {} as any

  isMessagesLoading = true as boolean

  messagePopUpIndex = 0 as number
  key = 0 as number

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

  get currentConversation () {
    return store.state.currentConversation
  }

  get selectMessagesOpen () {
    return store.state.selectMessagesOpen
  }

  get clearMessages () {
    return store.state.clearMessages
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

  handleConversationOpen (): void {
    EventBus.$on('conversation-opened', (conversation: any) => {
      this.messageReply = {}
      this.messages = []
      this.conversation = conversation || []
      store.setState('currentConversation', conversation)
      this.scroll = false
      this.isMessagesLoading = true
      EventBus.$emit('mark-as-read', conversation)
      store.setState('viewMessageProfileOpen', false)
      this.getConversationMessages(conversation._id).then(() => {
        this.isMessagesLoading = false
      })
    })
  }

  async initializeReadReceipts (messageIds: Array<string>): Promise<void> {
    const res = await this.$robin.sendReadReceipts(messageIds, this.conversation._id)
    console.log(res, messageIds)

    if (!res.error) {
      console.log(res.error, res)
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
      console.log('new-message', message)
      if (message.conversation_id === this.conversation._id) {
        this.messages.push(message)
        this.scrollToBottom()

        if (message.sender_token !== this.$user_token) {
          const messageIds = [this.messages[this.messages.length - 1]._id]
          this.initializeReadReceipts(messageIds)
        }
      }
      if (message.conversation_id !== this.currentConversation._id) {
        const index = this.$regularConversations.findIndex((item) => item._id === message.conversation_id)

        EventBus.$emit('mark-as-unread', this.$regularConversations[index])
      }
      this.$conversations.forEach((conversation, index) => {
        if (conversation._id === message.conversation_id) {
          console.log('Conversation: ', conversation, this.conversation)
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
      this.messages[index].is_deleted = true
      this.$forceUpdate()
    })
  }

  onImageDelete () {
    EventBus.$on('image-deleted', (message: any) => {
      console.log(message)
      const messageIndex = this.messages.findIndex((item: any) => {
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

  async getConversationMessages (id: string): Promise<void> {
    const res = await this.$robin.getConversationMessages(id, this.$user_token)

    if (res && !res.error) {
      this.testMessages(res.data ? res.data : [])
      this.handleReadReceipts(res.data)
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }

    this.scrollToBottom()
  }

  scrollToBottom (): void {
    window.setTimeout(() => {
      const message = this.$refs.message as HTMLElement
      if (message) {
        message.scrollTop = message.scrollHeight
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
      const isImage = this.imageRegex.test(fileMimeType) as any

      const nextFileMimeType = this.checkAttachmentType(messages[index + 1] ? messages[index + 1].content.attachment || '' : '') as any
      const isImageNext = this.imageRegex.test(nextFileMimeType) as any

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
      this.promise = this.getConversationMessages(this.conversation._id)
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
    this.scroll = true
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
    const res = await this.$robin.deleteMessages(this.selectedMessages.map(message => message._id), this.$user_token)

    if (res && !res.error) {
      this.selectedMessages.forEach(message => EventBus.$emit('message-deleted', message))

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

  openPrompt () {
    this.promptOpen = true
  }

  closePrompt () {
    this.promptOpen = false
  }

  // Method to scroll to the position of a replied message
  scrollToRepliedMessage (id: string): void {
    const messageIndex: any = this.messages.findIndex((element: any) => {
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
}
</script>

<style scoped>
.robin-message-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 0;
}

.robin-wrapper {
  flex: 1;
  height: 100%;
  overflow-y: hidden;
  background-color: #fff;
}

.robin-inner-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 2.688rem clamp(3%, 5vw, 2.688rem) 1.25rem clamp(3%, 5vw, 3.125rem);
  overflow-y: auto;
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
</style>
