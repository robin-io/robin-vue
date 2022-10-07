<template>
  <div class="robin-message-container" v-clickaway="onChatClickAway">
    <chat-header
      :key="key"
      :selected-messages="selectedMessages"
      @delete-selected-messages="openPrompt('delete select')"
    />
    <div
      class="robin-wrapper robin-flex robin-flex-column robin-flex-space-between"
      id="message-container"
      ref="message"
      @scroll="onScroll()"
      data-testid="message"
    >
      <div
        class="robin-loader robin-flex robin-flex-align-center"
        id="infinite-loader"
        v-if="
          (isMessagesLoading && currentPage > 0) ||
          (!offlineMessages.messages[currentConversation._id] && isMessagesLoading)
        "
      >
        <div class="robin-spinner"></div>
      </div>
      <div class="robin-inner-wrapper" v-if="offlineMessagesExist">
        <div
          class="robin-flex robin-flex-column"
          v-for="(message, index) in offlineMessages.messages[currentConversation._id]"
          :key="`message-${String(index)}`"
          :class="validateMessages(message, index)"
        >
          <div
            class="robin-conversation-date"
            v-if="
              index == 0 && isDataEqual(message, messages[index]) && currentConversation.is_group
            "
          >
            This group was created by
            {{
              $user_token == currentConversation.moderator.user_token
                ? 'You'
                : currentConversation.moderator.meta_data.display_name
            }}
            {{
              formatDate(!Array.isArray(message) ? message.created_at : message[0].created_at) ==
              'Today'
                ? 'today.'
                : `on ${formatDate(
                    !Array.isArray(message) ? message.created_at : message[0].created_att
                  )}.`
            }}
          </div>
          <div
            class="robin-conversation-date"
            v-if="
              index == 0 && isDataEqual(message, messages[index]) && !currentConversation.is_group
            "
          >
            This conversation was created
            {{
              formatDate(!Array.isArray(message) ? message.created_at : message[0].created_at) ==
              'Today'
                ? 'today.'
                : `on ${formatDate(
                    !Array.isArray(message) ? message.created_at : message[0].created_at
                  )}.`
            }}
          </div>
          <div class="robin-activity" v-if="showDate(index) && index != 0">
            {{ formatDate(!Array.isArray(message) ? message.created_at : message[0].created_at) }}
          </div>
          <message
            v-if="!Array.isArray(message) && !message.has_attachment && !message.is_deleted"
            :message="message"
            :index="index"
            :messages="offlineMessages.messages[currentConversation._id]"
            :groupname-colors="groupnameColors"
            @open-modal="openModal"
            @close-modal="closeModal"
            @toggle-check-action="toggleCheckAction($event, message)"
            @scroll-to-message="scrollToMessage"
          />
          <photo-message
            v-if="Array.isArray(message) && imagesDeleted(message)"
            :message="message"
            :messages="offlineMessages.messages[currentConversation._id]"
            :index="index"
            :groupname-colors="groupnameColors"
            @open-modal="openModal"
            @close-modal="closeModal"
            @toggle-check-action="toggleCheckAction($event, message)"
            @open-preview="openImagePreview($event)"
            @scroll-to-message="scrollToMessage"
          />
          <document-message
            v-if="
              !Array.isArray(message) &&
              message.has_attachment &&
              documentRegex.test(checkAttachmentType(message.content.attachment)) &&
              !message.is_deleted
            "
            :index="index"
            :message="message"
            :messages="offlineMessages.messages[currentConversation._id]"
            :groupname-colors="groupnameColors"
            @open-modal="openModal"
            @close-modal="closeModal"
            @toggle-check-action="toggleCheckAction($event, message)"
            @scroll-to-message="scrollToMessage"
          />
          <video-message
            v-if="
              !Array.isArray(message) &&
              message.has_attachment &&
              videoRegex.test(checkAttachmentType(message.content.attachment)) &&
              !message.is_deleted
            "
            :message="message"
            :messages="offlineMessages.messages[currentConversation._id]"
            :index="index"
            :groupname-colors="groupnameColors"
            @open-modal="openModal"
            @close-modal="closeModal"
            @toggle-check-action="toggleCheckAction($event, message)"
            @scroll-to-message="scrollToMessage"
          />
        </div>
        <!-- <MessageContent
          v-for="(message, index) in offlineMessages.messages[conversation._id]"
          :ref="`message-${String(index)}`"
          :groupname-colors="groupnameColors"
          :uncheck="uncheck"
          @open-preview="openImagePreview($event)"
          :key="`message-${String(index + key)}`"
          v-show="!message.is_deleted"
          :message="message"
          :conversation="conversation"
          :message-popup="getMessagePopup(index)"
          :messages="offlineMessages.messages[conversation._id]"
          :stored-messages="messages"
          :index="index"
          :scroll="scroll"
          :last-id="
            !Array.isArray(message) &&
            parseInt(String(index)) >= offlineMessages.messages[conversation._id].length - 3
              ? message._id
              : ''
          "
          :read-receipts="readReceipts"
          @toggle-check-action="toggleCheckAction($event, message)"
          @reply-message="replyMessage($event)"
          @forward-message="forwardMessage = true"
          @scroll-replied-message="scrollToMessage"
        /> -->
      </div>

      <div
        class="robin-scroll-to-bottom robin-bounceIn"
        v-if="scrollUp && scroll"
        @click="scrollToBottom()"
        data-testid="scroll-bottom-button"
      >
        <i class="robin-material-icon"> arrow_downward </i>
      </div>
    </div>
    <!-- v-if="Object.keys(currentConversation).length > 0" -->
    <message-input-bar
      :message-reply="messageReply"
      @open-camera="openCamera()"
      :captured-image="capturedImage"
      @on-close-reply="onCloseReply()"
      v-show="!selectMessagesOpen || !isForwardMessagesEnabled"
    />
    <forward-tab
      class="robin-forward-tab"
      v-if="selectMessagesOpen && isForwardMessagesEnabled"
      :selected-messages="selectedMessages"
      @forward-message="forwardMessage = true"
    />
    <camera
      ref="popup-1"
      :camera-opened="popUpState.cameraOpened"
      @close="closeCamera()"
      @captured-image="handleCapturedImage"
      v-show="popUpState.cameraOpened"
    />
    <forward-message
      v-if="forwardMessage == true"
      @closemodal="onCloseForwardMessagePopup()"
      :selected-messages="selectedMessages"
    />
    <prompt
      :status="promptStatus"
      @proceed="proceed()"
      v-show="promptOpen"
      @closemodal="closePrompt()"
    />
    <message-pop-over
      :message="!offlineMessagesExist ? {} : offlineMessages.messages[currentConversation._id][messageIndex] || {}"
      @forward-message="$emit('forward-message')"
      @reply-message="replyMessage"
      data-testid="message-popover"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import EventBus from '@/event-bus'
import Component from 'vue-class-component'
import {
  DocumentRegex,
  EmailRegex,
  WebsiteRegex,
  ImageRegex,
  VideoRegex,
  Colors
} from '@/utils/constants'
import ChatHeader from '../ChatHeader/ChatHeader.vue'
import MessageInputBar from '../MessageInputBar/MessageInputBar.vue'
import Content from '@/components/Content/Content.vue'
import Button from '@/components/Button/Button.vue'
import Camera from '../Camera/Camera.vue'
import mime from 'mime'
import moment from 'moment'
import localForage from 'localforage'
import store from '@/store/index'
import Message from '../Message/Message.vue'
import PhotoMessage from '../PhotoMessage/PhotoMessage.vue'
import VideoMessage from '../VideoMessage/VideoMessage.vue'
import DocumentMessage from '../DocumentMessage/DocumentMessage.vue'
import MessageContent from '../MessageContent/MessageContent.vue'
import ForwardMessage from '../ForwardMessage/ForwardMessage.vue'
import ForwardTab from '../ForwardTab/ForwardTab.vue'
import Prompt from '../Prompt/Prompt.vue'
import MessagePopOver from '../MessagePopOver/MessagePopOver.vue'

// eslint-disable-next-line
@Component<MessageContainer>({
  name: 'MessageContainer',
  components: {
    ChatHeader,
    Content,
    MessageInputBar,
    Camera,
    MessageContent,
    Message,
    DocumentMessage,
    ForwardMessage,
    ForwardTab,
    PhotoMessage,
    VideoMessage,
    Button,
    Prompt,
    MessagePopOver
  },
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
        const messages = this.offlineMessages.messages[this.currentConversation._id]

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
      handler (): void {
        if (this.exitGroup) {
          this.openPrompt('exit group')
        } else {
          this.closePrompt()
        }
      }
    },
    removeParticipant: {
      handler (): void {
        if (this.removeParticipant) {
          this.openPrompt('remove participant')
        } else {
          this.closePrompt()
        }
      }
    },
    isImageReplying: {
      handler (): void {
        this.messageReply = this.imagesToPreview[this.imageSelected]
      }
    }
  }
})
export default class MessageContainer extends Vue {
  promptOpen = false
  promptStatus = '' as any
  uncheck = false
  readReceipts = [] as Array<string>
  selectedMessages = [] as Array<any>
  forwardMessage = false as boolean
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
  currentPage = 0 as number
  totalPages = 0 as number

  imageRegex = ImageRegex
  videoRegex = VideoRegex
  documentRegex = DocumentRegex
  emailRegex = EmailRegex
  websiteRegex = WebsiteRegex
  messageIndex = 0

  created () {
    this.handleConversationOpen()
    this.onNewPseudoMessage()
    this.onNewMessage()
    // this.onMessageDelete()
    this.onImageDelete()
    // this.handleUserConnect()
    // this.handleUserDisconnect()
    this.getReadReceipts()
    this.onFailedMessageSend()
  }

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
  }

  get groupnameColors () {
    const userColors = {} as ObjectType

    for (const user of this.$robin_users) {
      userColors[user.userToken] = Colors[Math.floor(Math.random() * Colors.length)]
    }

    return userColors
  }

  get offlineMessagesExist () {
    const offlineMessages = this.offlineMessages.messages[this.currentConversation._id]
    console.log('conversation', offlineMessages)
    return !!offlineMessages
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
      this.closeModal(this.messageIndex)
      this.getOfflineMessages()

      this.messageReply = {}
      this.messages = []
      this.currentPage = 0
      this.totalPages = 0
      this.newConversationOpenCount += 1

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
    const res = await this.$robin.sendReadReceipts(
      messageIds,
      this.currentConversation._id,
      this.$user_token
    )

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
      // this.refresh()
    })
  }

  handleUserDisconnect () {
    EventBus.$on('user.disconnect', (conversation: string) => {
      // this.refresh()
    })
  }

  openModal (index: number) {
    this.messageIndex = index
    const messageEl = this.$refs.message as HTMLElement
    const messageBubbleEl = document.getElementById(
      `message-bubble-${this.messageIndex}`
    ) as HTMLElement
    const popupEl = document.getElementById('message-popup') as HTMLElement
    const lastThreeInArray =
      index >= this.offlineMessages.messages[this.currentConversation._id].length - 3
    let isMessageReceiver = false
    const offlineMessage = this.offlineMessages.messages[this.currentConversation._id][this.messageIndex]

    if (Array.isArray(offlineMessage)) {
      isMessageReceiver = this.isReceiver(offlineMessage)
    } else {
      isMessageReceiver = offlineMessage.sender_token === this.$user_token
    }

    if (popupEl.style.display === 'block') popupEl.style.display = 'none'

    if (lastThreeInArray) {
      popupEl.style.top = `${messageBubbleEl.getBoundingClientRect().top - 90}px`
    } else {
      popupEl.style.top = `${messageBubbleEl.getBoundingClientRect().top + 20}px`
    }

    if (isMessageReceiver) {
      popupEl.style.right = '0'
      popupEl.style.left = `${
        ((messageEl.getBoundingClientRect().width + messageBubbleEl.getBoundingClientRect().width) /
          window.innerWidth) *
          100 -
        3
      }%`
    } else {
      popupEl.style.left = '0'
      popupEl.style.right = `${
        ((messageEl.getBoundingClientRect().width + messageBubbleEl.getBoundingClientRect().width) /
          window.innerWidth) *
          100 -
        3
      }%`
    }
    popupEl.style.display = 'block'
  }

  closeModal (index: number) {
    const popup = document.getElementById('message-popup') as HTMLElement

    if (this.messageIndex === index) {
      popup.classList.remove('robin-zoomIn')
      popup.classList.add('robin-zoomOut')

      window.setTimeout(() => {
        popup.style.display = 'none'
        popup.classList.add('robin-zoomIn')
        popup.classList.remove('robin-zoomOut')
      }, 300)
    }
  }

  // refresh () {
  //   this.key += 1
  // }

  onFailedMessageSend () {
    EventBus.$on('message-send-failed', (message: ObjectType) => {
      const offlineMessageIndex = this.offlineMessages.messages[message.conversation_id].findIndex(
        (item: ObjectType) => {
          if (item.pseudo && !item.failed) {
            const isText = item.content.msg === message.content.msg
            const isDocument = Object.is(
              JSON.stringify(message.content.attachment),
              JSON.stringify(item.content.attachment)
            )
            const isTextAndDocument =
              Object.is(
                JSON.stringify(message.content.attachment),
                JSON.stringify(item.content.attachment)
              ) && item.content.msg === message.content.msg

            return (
              isText ||
              isDocument ||
              isTextAndDocument ||
              (isText && !isDocument && isTextAndDocument)
            )
          }

          return false
        }
      )

      // check if offline message already exists.
      if (offlineMessageIndex !== -1) {
        const offlineMessages = this.offlineMessages.messages[message.conversation_id]
        const currentPage = offlineMessages.length > 20 ? offlineMessages.length - 20 : 0

        offlineMessages[offlineMessageIndex] = Object.assign(
          {},
          offlineMessages[offlineMessageIndex],
          { failed: true }
        )

        this.setOfflineMessages(offlineMessages.slice(currentPage, offlineMessages.length))
      }
    })
  }

  onNewPseudoMessage () {
    EventBus.$on('new-pseudo-message', (message: any) => {
      if (message.conversation_id === this.currentConversation._id) {
        this.messages.push(message)

        if (this.offlineMessages.messages[message.conversation_id]) {
          const tempOfflineMessages = [...this.offlineMessages.messages[message.conversation_id]]

          tempOfflineMessages.push(message)

          this.resetCurrentPage()
          this.sortOfflineMessages(tempOfflineMessages)
        }

        this.scrollToBottom()
      }
      this.$conversations.forEach((conversation, index) => {
        if (conversation._id === message.conversation_id) {
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

  onNewMessage () {
    EventBus.$on('new-message', (message: any) => {
      if (message.conversation_id === this.currentConversation._id) {
        const messageIndex = this.messages.findIndex((item: ObjectType) => {
          if (item.pseudo) {
            const isText = item.content.msg === message.content.msg
            const isDocument =
              message.content.attachment &&
              message.content.attachment.includes(item.content.attachment.name || '')
            const isTextAndDocument =
              message.content.attachment &&
              message.content.attachment.includes(item.content.attachment.name || '') &&
              item.content.msg === message.content.msg

            return (
              isText ||
              isDocument ||
              isTextAndDocument ||
              (isText && !isDocument && isTextAndDocument)
            )
          }

          return false
        })

        // check if message already exists.
        if (messageIndex !== -1) {
          this.messages.splice(messageIndex, 1, message)
        } else {
          this.messages.push(message)
        }

        if (this.offlineMessages.messages[message.conversation_id]) {
          const offlineMessageIndex = this.offlineMessages.messages[
            message.conversation_id
          ].findIndex((item: ObjectType) => {
            if (item.pseudo) {
              const isText = item.content.msg === message.content.msg
              const isDocument =
                message.content.attachment &&
                message.content.attachment.includes(item.content.attachment.name || '')
              const isTextAndDocument =
                message.content.attachment &&
                message.content.attachment.includes(item.content.attachment.name || '') &&
                item.content.msg === message.content.msg

              return (
                isText ||
                isDocument ||
                isTextAndDocument ||
                (isText && !isDocument && isTextAndDocument)
              )
            }

            return false
          })

          const tempOfflineMessages = [...this.offlineMessages.messages[message.conversation_id]]

          // check if offline message already exists.
          if (offlineMessageIndex !== -1) {
            tempOfflineMessages.splice(offlineMessageIndex, 1, message)
          } else {
            tempOfflineMessages.push(message)
          }

          this.resetCurrentPage()
          this.sortOfflineMessages(tempOfflineMessages)

          // this.refresh()
        }

        this.scrollToBottom()

        if (message.sender_token !== this.$user_token) {
          const messageIds = [this.messages[this.messages.length - 1]._id]
          this.initializeReadReceipts(messageIds)
        }
      }
      if (message.conversation_id !== this.currentConversation._id) {
        const index = this.$regularConversations.findIndex(
          (item) => item._id === message.conversation_id
        )

        EventBus.$emit('mark-as-unread', this.$regularConversations[index])
      }
      this.$conversations.forEach((conversation, index) => {
        if (conversation._id === message.conversation_id) {
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
    const offlineMessage = this.offlineMessages.messages[this.currentConversation._id][
      this.messageIndex
    ] as Array<ObjectType> | ObjectType
    const isArray = Array.isArray(offlineMessage)

    if (isArray) {
      const imageData = [...(offlineMessage as Array<ObjectType>)] as Array<ObjectType>
      const data = { ...this.offlineMessages.messages }

      for (const item of imageData) {
        item.is_deleted = true
      }

      data[this.currentConversation._id][this.messageIndex] = imageData

      this.$set(this.messages, this.messages[this.messageIndex], imageData)
      this.$set(this.offlineMessages, this.offlineMessages.messages, data)
    } else {
      const data = { ...this.offlineMessages.messages }
      data[this.currentConversation._id][this.messageIndex].is_deleted = true

      this.$set(
        this.messages,
        this.messages[this.messageIndex],
        data[this.currentConversation._id][this.messageIndex]
      )
      this.$set(this.offlineMessages, this.offlineMessages.messages, data)
    }
  }

  onImageDelete () {
    EventBus.$on('image-deleted', (message: ObjectType) => {
      const messageIndex = this.messages.findIndex((item: Array<ObjectType>) => {
        if (Array.isArray(item)) return item.some((image) => image._id === message._id)
        return false
      }) as number

      const offlineMessageIndex = this.offlineMessages.messages[
        this.currentConversation._id
      ].findIndex((item: Array<ObjectType>) => {
        if (Array.isArray(item)) return item.some((image) => image._id === message._id)
        return false
      }) as number

      if (messageIndex >= 0) {
        // Delete message from image grid.
        const index = this.messages[messageIndex].findIndex(
          (item: ObjectType) => item._id === message._id
        ) as number

        const data = [...this.messages[messageIndex]] as Array<ObjectType>
        data[index].is_deleted = true
        this.$set(this.messages, this.messages[messageIndex], data)
      }

      // if (messageIndex === -1) {
      //   // Delete message from message list.
      //   EventBus.$emit('message-deleted', message)
      // }

      if (offlineMessageIndex >= 0) {
        // Delete message from image grid.
        const index = this.offlineMessages.messages[this.currentConversation._id][
          offlineMessageIndex
        ].findIndex((item: any) => item._id === message._id) as number

        const data = { ...this.offlineMessages.messages }
        data[this.currentConversation._id][offlineMessageIndex][index].is_deleted = true
        this.$set(this.offlineMessages, this.offlineMessages.messages, data)
      }

      // if (offlineMessageIndex === -1) {
      //   // Delete message from message list.
      //   EventBus.$emit('message-deleted', message)
      // }

      // EventBus.$emit('messages.get', this.messages)
    })
  }

  handleReadReceipts (data: any) {
    const filterMessage = data
      ? data.filter((item: any) => !item.is_read && item.sender_token !== this.$user_token)
      : []
    const messageIds = filterMessage.map((item: any) => item._id)

    if (messageIds.length > 0) {
      this.initializeReadReceipts(messageIds)
    }
  }

  async getConversationMessages (): Promise<void> {
    const res = await this.$robin.getConversationMessages(
      this.currentConversation._id,
      this.$user_token
    )

    if (res && !res.error) {
      this.testMessages(res.data ? res.data : [])

      this.messageError = false

      this.resetCurrentPage()

      const offlineMessages =
        this.offlineMessages.messages[this.currentConversation._id] ?? ([] as Array<ObjectType>)

      this.sortOfflineMessages(offlineMessages)

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
        this.offlineMessages.messages[this.currentConversation._id].unshift(messages[i])
      }

      message.scrollTop = 160
    }, 500)
  }

  scrollToBottom (): void {
    window.setTimeout(() => {
      const message = this.$refs.message as HTMLElement

      if (message) {
        message.scrollTop = message.scrollHeight + 100
        this.scrollUp = false
        this.scroll = false
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
      const isImage = this.imageRegex.test(
        fileMimeType &&
          (!messages[index].content.msg || messages[index].content.msg === 'undefined')
          ? fileMimeType
          : ''
      ) as boolean

      const nextFileMimeType = this.checkAttachmentType(
        messages[index + 1] ? messages[index + 1].content.attachment || '' : ''
      ) as any
      const isImageNext = this.imageRegex.test(
        messages[index + 1]
          ? nextFileMimeType &&
            (!messages[index + 1].content.msg || messages[index + 1].content.msg === 'undefined')
            ? nextFileMimeType
            : ''
          : ''
      ) as any

      if (isImage) {
        temp.push(messages[index])
      }

      if (temp.length > 0) {
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

    if (!this.scroll) this.scroll = true
  }

  handleScrollUp () {
    const messagesLen = this.messages.length
    const offlineMessagesLen = this.offlineMessages.messages[this.currentConversation._id].length
    const message = this.$refs.message as HTMLElement
    const endOfScroll =
      Math.floor(message.scrollTop) > Math.floor(message.scrollHeight - message.clientHeight - 20)

    if (endOfScroll && this.scrollUp) {
      this.scrollUp = false
    }

    if (message.scrollTop + 10 <= this.lastScroll && offlineMessagesLen !== messagesLen) {
      if (!this.isMessagesLoading && !this.scrollUp) {
        this.scrollUp = true
      }
    }

    if (message.scrollTop === 0 && offlineMessagesLen !== messagesLen && this.currentPage > 19) {
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
  }

  replyMessage (): void {
    const offlineMessage = this.offlineMessages.messages[this.currentConversation._id][
      this.messageIndex
    ]
    const isArray = Array.isArray(offlineMessage)
    this.messageReply = !isArray ? { ...offlineMessage } : [...offlineMessage]
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
      // this.refresh()

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
    const res = await this.$robin.removeGroupParticipant(
      this.currentConversation._id,
      this.participantToken
    )

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
  scrollToMessage (id: string): void {
    const messageIndex: any = this.offlineMessages.messages[this.currentConversation._id].findIndex(
      (element: any) => {
        if (Array.isArray(element)) {
          return element.find((item) => item._id === id)
        }

        if (!Array.isArray(element)) {
          if (element._id === id) {
            return element
          }
        }

        return false
      }
    )
    const messageRef: any = this.$refs[`message-${messageIndex}`]
    messageRef[0].$el.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  onResize () {
    this.scrollUp = false
  }

  async handleLeaveGroup () {
    const res = await this.$robin.removeGroupParticipant(
      this.currentConversation._id,
      this.$user_token
    )

    if (res && !res.error) {
      this.$toast.open({
        message: 'You left group',
        type: 'success',
        position: 'bottom-left'
      })

      EventBus.$emit('regular-conversation.delete', this.currentConversation)
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
      this.offlineMessages = value ? { ...value } : { messages: {} }
    } catch (error) {
      console.error(error)
    }
  }

  async setOfflineMessages (messages: Array<ObjectType>): Promise<void> {
    try {
      const data = { messages: { [this.currentConversation._id]: messages } } as ObjectType

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

  sortOfflineMessages (messages: Array<ObjectType>) {
    const messageIds = new Set()

    const removedDuplicates = [
      ...messages,
      ...this.messages.slice(this.currentPage, this.messages.length)
    ]
      .filter((item: ObjectType) => {
        const isDuplicate = messageIds.has(item._id)

        messageIds.add(item._id)

        if (!isDuplicate) {
          return true
        }

        return false
      })
      .sort((a, b) => {
        const messageA: ObjectType = Array.isArray(a) ? a[0] : a
        const messageB: ObjectType = Array.isArray(b) ? b[0] : b

        return Number(new Date(messageA.created_at)) - Number(new Date(messageB.created_at))
      })

    if (messages.length > 0) {
      const data = { ...this.offlineMessages.messages }
      data[this.currentConversation._id] = [...removedDuplicates]
      this.$set(this.offlineMessages, this.offlineMessages.messages, data)
    }

    this.setOfflineMessages([...removedDuplicates])
  }

  resetCurrentPage () {
    this.currentPage = this.messages.length > 20 ? this.messages.length - 20 : 0
  }

  async processMessageToDelete () {
    const message = this.offlineMessages.messages[this.currentConversation._id][
      this.messageIndex
    ] as Array<ObjectType> | ObjectType

    if (Array.isArray(message)) {
      for (const item of message) {
        await this.deleteMessage(item)
      }
    } else {
      await this.deleteMessage(message)
    }
  }

  async deleteMessage (message: ObjectType): Promise<void> {
    const res = await this.$robin.deleteMessages([message._id], this.$user_token)

    if (res && !res.error) {
      this.onMessageDelete()
      this.$toast.open({
        message: 'Message Deleted.',
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

  isReceiver (message: Array<ObjectType>) {
    return message.some((item: ObjectType) => item.sender_token === this.$user_token)
  }

  validateMessages (message: ObjectType | Array<ObjectType>, index: number): string {
    const nextMessage = this.messages[index + 1] as any

    if (
      Array.isArray(message) &&
      this.isReceiver(message) &&
      nextMessage &&
      nextMessage.sender_token !== this.$user_token
    ) {
      return 'robin-message-receiver robin-w-100 robin-flex-align-end prev'
    }

    if (
      message.content &&
      message.sender_token === this.$user_token &&
      Array.isArray(nextMessage) &&
      !this.isReceiver(nextMessage)
    ) {
      return 'robin-message-receiver robin-w-100 robin-flex-align-end prev'
    }

    if (Array.isArray(message) && this.isReceiver(message)) {
      return 'robin-message-receiver robin-w-100 robin-flex-align-end' // true
    }

    if (message.content && message.sender_token === this.$user_token) {
      return 'robin-message-receiver robin-w-100 robin-flex-align-end' // true
    }

    if (
      Array.isArray(message) &&
      !this.isReceiver(message) &&
      nextMessage &&
      nextMessage.sender_token === this.$user_token
    ) {
      return 'robin-message-sender robin-flex-align-start prev'
    }

    if (
      message.content &&
      message.sender_token !== this.$user_token &&
      Array.isArray(nextMessage) &&
      this.isReceiver(nextMessage)
    ) {
      return 'robin-message-sender robin-flex-align-start prev'
    }

    return 'robin-message-sender robin-flex-align-start' // false
  }

  imagesDeleted (message: Array<ObjectType>) {
    return message.every((image: ObjectType) => !image.is_deleted)
  }

  isDataEqual (dataA: Array<ObjectType> | ObjectType, dataB: Array<ObjectType> | ObjectType) {
    return Object.is(JSON.stringify(dataA), JSON.stringify(dataB))
  }

  showDate (index: number) {
    if (index - 1 > -1) {
      const dateA = this.offlineMessages.messages[this.currentConversation._id][index] as
        | Array<ObjectType>
        | ObjectType
      const dateB = this.offlineMessages.messages[this.currentConversation._id][index - 1] as
        | Array<ObjectType>
        | ObjectType

      // console.log(dateA, dateB, index)

      if (Array.isArray(dateA) && !Array.isArray(dateB)) {
        return (
          moment(dateA[0].created_at).format('YYYY-MM-DD') !==
          moment(dateB.created_at).format('YYYY-MM-DD')
        )
      }

      if (!Array.isArray(dateA) && Array.isArray(dateB)) {
        return (
          moment(dateA.created_at).format('YYYY-MM-DD') !==
          moment(dateB[0].created_at).format('YYYY-MM-DD')
        )
      }

      if (Array.isArray(dateA) && Array.isArray(dateB)) {
        return (
          moment(dateA[0].created_at).format('YYYY-MM-DD') !==
          moment(dateB[0].created_at).format('YYYY-MM-DD')
        )
      }

      return (
        moment(dateA.created_at).format('YYYY-MM-DD') !==
        moment(dateB.created_at).format('YYYY-MM-DD')
      )
    }

    return false
  }

  formatDate (value: any): string {
    const today = moment().format('MMM DD YYYY')
    const formattedValue = moment(value).format('MMM DD YYYY')

    if (today === formattedValue) return 'Today'

    return moment(value).format('MMM DD YYYY')
  }
}
</script>
