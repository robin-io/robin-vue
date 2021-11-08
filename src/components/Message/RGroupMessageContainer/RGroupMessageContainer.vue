<template>
  <div class="robin-message-container" v-on-clickaway="onChatClickAway">
    <RGroupChatHeader :conversation="conversation" @forward-message="forwardMessage = true" :key="key" :selected-messages="selectedMessages" />
    <div class="robin-wrapper robin-flex robin-flex-column robin-flex-space-between">
      <div class="robin-inner-wrapper robin-flex robin-flex-align-center" v-if="isMessagesLoading">
        <div class="robin-spinner"></div>
      </div>
      <div class="robin-inner-wrapper" ref="message" @scroll="onScroll()" v-else>
        <MessageContent v-for="(message, index) in messages" @open-preview="openImagePreview($event)" :key="`message-${String(index + key)}`" v-show="!message.is_deleted" :message="message" :conversation="conversation" :message-popup="getMessagePopup(index)" :messages="messages" :index="index" :scroll="scroll" :last-id="!Array.isArray(message) && messages.length - 3 < parseInt(String(index)) ? message._id : ''" @toggle-check-action="toggleCheckAction($event, message)" @reply-message="replyMessage($event)" />
      </div>
    </div>
    <RMessageInputBar :conversation="conversation" :message-reply="messageReply" @open-camera="openCamera()" :captured-image="capturedImage" @on-close-reply="onCloseReply()" />
    <RCamera ref="popup-1" :camera-opened="popUpState.cameraOpened" @close="closeCamera()" @captured-image="handleCapturedImage" v-show="popUpState.cameraOpened" />
    <RForwardMessage v-if="forwardMessage" @closemodal="onCloseForwardMessagePopup()" :selected-messages="selectedMessages" />
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
import RCamera from '../RCamera/RCamera.vue'
import mime from 'mime'
import store from '../../../store/index'
import MessageContent from '../MessageContent/MessageContent.vue'
import MessageGrid from '../MessageGrid/MessageGrid.vue'
import RMessagePopOver from '../RMessagePopOver/RMessagePopOver.vue'
import RForwardMessage from '../RForwardMessage/RForwardMessage.vue'

// eslint-disable-next-line
@Component<RGroupMessageContainer>({
  name: 'RGroupMessageContainer',
  components: {
    RGroupChatHeader,
    RText,
    RMessageInputBar,
    RCamera,
    MessageContent,
    MessageGrid,
    RMessagePopOver,
    RForwardMessage
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
      },
      immediate: true
    },
    selectMessagesOpen: {
      handler (val): void {
        if (!val) {
          this.selectedMessages = []
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
  selectedMessages = [] as Array<any>
  forwardMessage = false as boolean
  conversation = {} as any
  messages = [] as any
  // imagesToPreview = [] as any
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

  images = {
    pdf: 'pdf.png',
    doc: 'doc.png',
    docx: 'docx.png',
    csv: 'csv.csv',
    ppt: 'ppt.png',
    rtf: 'rtf.png',
    rar: 'rar.png',
    tar: 'tar.png',
    xls: 'xls.png',
    xlsx: 'xlsx.png',
    txt: 'txt.png',
    odt: 'odt.png',
    md: 'md.png',
    '7z': '7z.png',
    zip: 'zip.png',
    html: 'html.png'
  }

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
      this.getConversationMessages(conversation._id).then(() => {
        this.isMessagesLoading = false
      })
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
      if (message.conversation_id === this.conversation._id) {
        this.messages.push(message)
        this.scrollToBottom()
      }
      this.$conversations.forEach((conversation, index) => {
        if (conversation._id === message.conversation_id) {
          console.log('Conversation: ', conversation, this.conversation)
          this.$conversations[index].updated_at = message.content.timestamp
          this.$conversations[index].last_message = message.content
          const newConv = this.$conversations[index]
          if (!newConv.archived_for || newConv.archived_for.length === 0) {
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

  // onNewReaction () {
  //   EventBus.$on('message.reaction', (message: any) => {
  //     const messageIndex: any = this.messages.findIndex((messageItem: any) => {
  //       if (Array.isArray(messageItem)) {
  //         return !!messageItem.findIndex((item) => item._id === message.message_id)
  //       }

  //       if (!Array.isArray(messageItem)) {
  //         if (messageItem._id === message.message_id) {
  //           return true
  //         }
  //       }

  //       return false
  //     })

  //     if (!this.messages[messageIndex].reactions) {
  //       this.messages[messageIndex].reactions = []
  //     }

  //     this.messages[messageIndex].reactions = [...this.messages[messageIndex].reactions, message]
  //     console.log(this.messages[messageIndex].reactions, message)
  //   })
  // }

  // onReactionDelete () {
  //   EventBus.$on('message.remove.reaction', (message: any) => {
  //     const messageIndex: any = this.messages.findIndex((messageItem: any) => {
  //       if (Array.isArray(messageItem)) {
  //         return !!messageItem.findIndex((item) => item._id === message.message_id)
  //       }

  //       if (!Array.isArray(messageItem)) {
  //         if (messageItem._id === message.message_id) {
  //           return true
  //         }
  //       }

  //       return false
  //     })

  //     const reactions = this.messages[messageIndex].reactions as Array<any>

  //     const reactionIndex = reactions.findIndex((item: any) => item.reaction_id === message.reaction_id)
  //     reactions.splice(reactionIndex, 1)
  //   })
  // }

  onMessageDelete () {
    EventBus.$on('message-deleted', (message: any) => {
      const index = this.messages.findIndex((item: any) => item._id === message._id) as number
      this.messages[index].is_deleted = true
      this.$forceUpdate()
    })
  }

  onImageDelete () {
    EventBus.$on('image-deleted', (message: any) => {
      const messageIndex = this.messages.findIndex((item: any) => {
        if (Array.isArray(item)) return item.some((image) => image._id === message._id)
        return false
      }) as number

      const index = this.messages[messageIndex].findIndex((item: any) => item._id === message._id) as number
      this.messages[messageIndex][index].is_deleted = true
      this.$forceUpdate()
    })
  }

  async getConversationMessages (id: string): Promise<void> {
    const res = await this.$robin.getConversationMessages(id, this.$user_token)

    if (res && !res.error) {
      this.testMessages(res.data == null ? [] : res.data)
    } else {
      this.$toasted.global.custom_error('Check your connection.')
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
      this.$toasted.global.custom_success('Messages Deleted.')
      this.promise = this.getConversationMessages(this.conversation._id)
      this.promise.then(() => {
        this.scrollToBottom()
      })
    } else {
      this.$toasted.global.custom_error('Check your connection.')
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
  }

  replyMessage (message: any): void {
    this.messageReply = message
  }

  onCloseReply (): void {
    this.messageReply = {}
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
  /* z-index: 0; */
}

.robin-wrapper {
  flex: 1;
  height: 100%;
  overflow-y: hidden;
  background-color: #fafafa;
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
