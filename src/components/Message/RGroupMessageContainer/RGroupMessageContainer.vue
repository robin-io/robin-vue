<template>
  <div class="robin-message-container" v-on-clickaway="onChatClickAway">
    <RGroupChatHeader :conversation="conversation" @forward-message="forwardMessage = true" :key="key" :selected-messages="selectedMessages" />
    <div class="robin-wrapper robin-flex robin-flex-column robin-flex-space-between">
      <Promised :promise="promise">
        <template v-slot:pending>
          <div class="robin-inner-wrapper robin-flex robin-flex-align-center">
            <div class="robin-spinner"></div>
          </div>
        </template>
        <template v-slot:default>
          <div class="robin-inner-wrapper" ref="message" @scroll="onScroll()">
            <MessageContent v-for="(message, index) in messages" @open-preview="openImagePreview($event)" :key="`message-${index}`" v-show="!message.is_deleted" :message="message" :conversation="conversation" :message-popup="popUpState.messagePopUp[index]" :scroll="scroll" :last-id="!Array.isArray(message) && index > messages.length - 3 ? message._id : ''" @toggle-check-action="toggleCheckAction($event, message)" />
          </div>
        </template>
        <template v-slot:rejected>
          <div class="robin-inner-wrapper robin-flex robin-flex-align-center">
            <div class="network-error">please check your connection</div>
          </div>
        </template>
      </Promised>
      <!-- <RUnreadMessageBar :number="1" /> -->
    </div>
    <RMessageInputBar :conversation="conversation" @open-camera="openCamera()" :captured-image="capturedImage" />
    <RCamera ref="popup-1" :camera-opened="popUpState.cameraOpened" @close="closeCamera()" @captured-image="handleCapturedImage" v-show="popUpState.cameraOpened" />
    <MessageImagePreviewer ref="popup-2" v-show="imagePreviewOpen" @close="closeImagePreview()" :images-to-preview="imagesToPreview" />
    <RForwardMessage v-if="forwardMessage" @closemodal="onCloseForwardMessagePopup()" :selected-messages="selectedMessages" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Promised } from 'vue-promised'
import EventBus from '@/event-bus'
import Component from 'vue-class-component'
import { mixin as clickaway } from 'vue-clickaway'
import RGroupChatHeader from '../RGroupChatHeader/RGroupChatHeader.vue'
import RMessageInputBar from '../RMessageInputBar/RMessageInputBar.vue'
import RDownloadButton from '../RDownloadButton/RDownloadButton.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import RCamera from '../RCamera/RCamera.vue'
import mime from 'mime'
import { State, Mutation } from 'vuex-class'
import { RootState } from '@/utils/types'
import MessageContent from '../MessageContent/MessageContent.vue'
import MessageGrid from '../MessageGrid/MessageGrid.vue'
import MessageImagePreviewer from '../MessageImagePreviewer/MessageImagePreviewer.vue'
import RMessagePopOver from '../RMessagePopOver/RMessagePopOver.vue'
// import ForwardMessage from '../ForwardMessage.vue'
// import RUnreadMessageBar from '../RUnreadMessagesBar/RUnreadMessagesBar.vue'
import RForwardMessage from '../RForwardMessage/RForwardMessage.vue'

// eslint-disable-next-line
@Component<RGroupMessageContainer>({
  name: 'RGroupMessageContainer',
  components: {
    RGroupChatHeader,
    RText,
    RMessageInputBar,
    RCamera,
    RDownloadButton,
    Promised,
    MessageContent,
    MessageGrid,
    MessageImagePreviewer,
    RMessagePopOver,
    // ForwardMessage
    // RUnreadMessageBar
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
    }
  }
})
export default class RGroupMessageContainer extends Vue {
  @State('selectMessagesOpen') selectMessagesOpen?: RootState
  @State('clearMessages') clearMessages?: RootState
  @State('imagePreviewOpen') imagePreviewOpen?: RootState
  @Mutation('setSelectMessagesOpen') setSelectMessagesOpen: any
  @Mutation('setClearMessages') setClearMessages: any
  @Mutation('setImagePreviewOpen') setImagePreviewOpen: any

  selectedMessages = [] as Array<any>
  forwardMessage = false as boolean
  conversation = {} as any
  messages = [] as any
  imagesToPreview = [] as any
  promise = null as any
  capturedImage = null as any
  scroll = false as boolean
  popUpState = {
    cameraOpened: false,
    messagePopUp: [] as Array<any>
  }

  loading = true as boolean

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

  handleConversationOpen (): void {
    EventBus.$on('conversation-opened', (conversation: any) => {
      this.messages = []
      this.conversation = conversation || []
      this.scroll = false
      this.promise = this.getConversationMessages(conversation._id)
      this.promise.then(() => {
        this.scrollToBottom()
      })
      console.log(this.promise)
    })
  }

  handleUserConnect () {
    EventBus.$on('user.connect', (conversation: string) => {
      this.key += 1
    })
  }

  handleUserDisconnect () {
    EventBus.$on('user.disconnect', (conversation: string) => {
      this.key += 1
    })
  }

  onNewMessage () {
    EventBus.$on('new-message', (message: any) => {
      if (message.conversation_id === this.conversation._id) {
        this.messages.push(message)
      }
      this.$conversations.forEach((conversation, index) => {
        if (conversation._id === this.conversation._id) {
          this.scrollToBottom()
          this.$conversations[index].updated_at = message.content.timestamp
          this.$conversations[index].last_message = message.content
          const newConv = this.$conversations[index]
          console.log('emit', newConv)
          if (!newConv.archived_for || newConv.archived_for.length === 0) {
            const regularConversationIndex = this.$regularConversations.findIndex((item) => item._id === newConv._id)
            this.$regularConversations.splice(regularConversationIndex, 1)
            this.$regularConversations.unshift(newConv)
          } else {
            const archivedConversationIndex = this.$archivedConversations.findIndex((item) => item._id === newConv._id)
            this.$archivedConversations.splice(archivedConversationIndex, 1)
            this.$archivedConversations.unshift(newConv)
          }
        }
      })
    })

    // EventBus.$on('message.forward', (message: any) => {
    //   if (message.conversation_id === this.conversation.conversation_id) {
    //     // this.messages.push(message)
    //     this.scrollToBottom()
    //   }
    // })
  }

  onMessageDelete () {
    EventBus.$on('message-deleted', (message: any) => {
      const index = this.messages.findIndex((item: any) => item._id === message._id) as number
      this.messages[index].is_deleted = true
    })
  }

  onImageDelete () {
    EventBus.$on('image-deleted', (message: any) => {
      console.log(message)
      const messageIndex = this.messages.findIndex((item: any) => {
        if (Array.isArray(item)) return item.some((image) => image._id === message._id)
        return false
      }) as number

      const index = this.messages[messageIndex].findIndex((item: any) => item._id === message._id) as number
      this.messages[messageIndex][index].is_deleted = true
    })
  }

  async getConversationMessages (id: string): Promise<void> {
    const res = await this.$robin.getConversationMessages(id, this.$user_token)

    if (res && !res.error) {
      // this.messages = resp.data == null ? [] : resp.data
      this.testMessages(res.data == null ? [] : res.data)
      // this.getMutatedMessages(resp.data == null ? [] : resp.data)
      // console.log(this.getMutatedMessages(resp.data == null ? [] : resp.data))
    } else {
      this.$toasted.global.custom_error('Check your connection.')
    }

    // console.log(this.messages)
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
    }, 300)
  }

  openImagePreview ($event: any): void {
    this.setImagePreviewOpen(true)
    this.imagesToPreview = $event
  }

  closeImagePreview (): void {
    const popup = this.$refs['popup-2'] as any
    popup.$refs['popup-body'].classList.remove('robin-squeezeOut')
    popup.$refs['popup-body'].classList.add('robin-squeezeIn')

    window.setTimeout(() => {
      popup.$refs['popup-body'].classList.remove('robin-squeezeIn')
      popup.$refs['popup-body'].classList.add('robin-squeezeOut')

      this.setImagePreviewOpen(false)
      this.imagesToPreview = []
    }, 300)
  }

  openMessagePopup (val: number): void {
    this.messagePopUpIndex = val
    this.popUpState.messagePopUp[this.messagePopUpIndex].opened = true
  }

  closeMessagePopup (event: any): void {
    console.log(event)
    this.popUpState.messagePopUp[this.messagePopUpIndex].opened = false
    this.messagePopUpIndex = 0
  }

  handleCapturedImage (val: Object): void {
    this.capturedImage = val
  }

  checkAttachmentType (attachmentUrl: String): string {
    const strArr = attachmentUrl.split('.')
    return `${mime.getType(strArr[strArr.length - 1])}`
  }

  testMessages (messages: Array<any>): void {
    // const imageGrids = [] as any
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

    console.log(newMessages)
    this.messages = newMessages
  }

  async clearAllMessages (): Promise<void> {
    const id = [] as Array<any>
    console.log('before ->', id)

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

    this.setClearMessages(false)
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
    console.log(index)

    this.selectedMessages.splice(index, 1)
  }

  onChatClickAway (): void {
    this.setSelectMessagesOpen(false)
  }

  onCloseForwardMessagePopup (): void {
    this.forwardMessage = false
    this.setSelectMessagesOpen(false)
  }

  // isReceiverInGroup (conversation: any): boolean {
  //   return conversation.participants.some((item: any) => item.user_token === conversation.moderator.user_token)
  // }
}
</script>

<style scoped>
.robin-message-container {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  /* box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.07); */
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
  padding: 2.688rem 2.688rem 1.25rem 3.125rem;
  overflow-y: auto;
}

.network-error {
  font-size: 1rem;
  color: var(--primary-color);
}

/* .robin-message-sender {
  background-color: #f4f6f8;
  border: 1px solid rgba(35, 107, 248, 0.2);
}

.robin-message-receiver {
  background-color: #d3d7ea;
} */

/* Default bubble styles */
/*
.robin-message-receiver .robin-side-text {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.robin-message-sender .robin-side-text {
  flex: 1;
  display: flex;
  justify-content: flex-start;
} */

@media (min-width: 768px) {
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
