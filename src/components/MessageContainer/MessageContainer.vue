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
      @scroll="handleInfiniteScroll"
      data-testid="message"
    >
      <div
        class="robin-loader robin-flex robin-flex-align-center"
        v-if="
          (offlineMessages.messages[currentConversation._id] &&
            currentPage > 0 &&
            isMessagesLoading) ||
          (!offlineMessages.messages[currentConversation._id] && isMessagesLoading)
        "
      >
        <div class="robin-spinner"></div>
      </div>
      <div class="robin-inner-wrapper" v-if="offlineMessagesExist">
        <div class="robin-conversation-date" v-if="!isMessagesLoading && currentPage === pageCount">
          {{ conversationCreatedAt }}
        </div>
        <div
          class="robin-flex robin-flex-column"
          v-for="(message, index) in offlineMessages.messages[currentConversation._id]"
          :key="`message-${String(index)}`"
          :class="validateMessages(message, index)"
        >
          <div class="robin-activity" v-if="showDate(index) && index != 0">
            {{ formatDate(!Array.isArray(message) ? message.created_at : message[0].created_at) }}
          </div>
          <message
            v-if="!Array.isArray(message) && !message.has_attachment"
            :message="message"
            :index="index"
            :messages="offlineMessages.messages[currentConversation._id]"
            :groupname-colors="groupnameColors"
            :is-messages-loading="isMessagesLoading"
            @open-modal="openModal"
            @close-modal="closeModal"
            @toggle-check-action="toggleCheckAction($event, message)"
            @scroll-to-message="scrollToMessage"
            @remove-reaction="removeReaction"
          />
          <photo-message
            v-if="Array.isArray(message)"
            :message="message"
            :messages="offlineMessages.messages[currentConversation._id]"
            :index="index"
            :groupname-colors="groupnameColors"
            :is-messages-loading="isMessagesLoading"
            @open-modal="openModal"
            @close-modal="closeModal"
            @toggle-check-action="toggleCheckAction($event, message)"
            @open-preview="openImagePreview($event)"
            @scroll-to-message="scrollToMessage"
            @remove-reaction="removeReaction"
          />
          <document-message
            v-if="
              !Array.isArray(message) &&
              message.has_attachment &&
              documentRegex.test(checkAttachmentType(message.content.attachment, message))
            "
            :index="index"
            :message="message"
            :messages="offlineMessages.messages[currentConversation._id]"
            :groupname-colors="groupnameColors"
            :is-messages-loading="isMessagesLoading"
            @open-modal="openModal"
            @close-modal="closeModal"
            @toggle-check-action="toggleCheckAction($event, message)"
            @scroll-to-message="scrollToMessage"
            @remove-reaction="removeReaction"
          />
          <video-message
            v-if="
              !Array.isArray(message) &&
              message.has_attachment &&
              videoRegex.test(checkAttachmentType(message.content.attachment, message))
            "
            :message="message"
            :messages="offlineMessages.messages[currentConversation._id]"
            :index="index"
            :groupname-colors="groupnameColors"
            :is-messages-loading="isMessagesLoading"
            @open-modal="openModal"
            @close-modal="closeModal"
            @toggle-check-action="toggleCheckAction($event, message)"
            @scroll-to-message="scrollToMessage"
            @remove-reaction="removeReaction"
          />
        </div>
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
      :camera-opened="cameraOpened"
      @close="closeCamera()"
      @captured-image="handleCapturedImage"
      v-show="cameraOpened"
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
    <reaction-pop-up
      v-if="isMessageReactionViewEnabled"
      @reaction="addReaction"
      data-testid="reaction-popup"
    />
    <message-pop-up
      :message="
        !offlineMessagesExist
          ? {}
          : offlineMessages.messages[currentConversation._id][messageIndex] || {}
      "
      @forward-message="$emit('forward-message')"
      @reply-message="replyMessage"
      @delete-message="openPrompt('delete message')"
      data-testid="message-popup"
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
import { blobToArrayBuffer, checkAttachmentType } from '@/utils/helpers'
import ChatHeader from '../ChatHeader/ChatHeader.vue'
import MessageInputBar from '../MessageInputBar/MessageInputBar.vue'
import Content from '@/components/Content/Content.vue'
import Button from '@/components/Button/Button.vue'
import Camera from '../Camera/Camera.vue'
import moment from 'moment'
import localForage from 'localforage'
import store from '@/store/index'
import { Robin } from '../../../robin'
import Message from '../Message/Message.vue'
import PhotoMessage from '../PhotoMessage/PhotoMessage.vue'
import VideoMessage from '../VideoMessage/VideoMessage.vue'
import DocumentMessage from '../DocumentMessage/DocumentMessage.vue'
import ForwardMessage from '../ForwardMessage/ForwardMessage.vue'
import ForwardTab from '../ForwardTab/ForwardTab.vue'
import Prompt from '../Prompt/Prompt.vue'
import MessagePopUp from '../MessagePopUp/MessagePopUp.vue'
import ReactionPopUp from '../ReactionPopUp/ReactionPopUp.vue'

// eslint-disable-next-line
@Component<MessageContainer>({
  name: 'MessageContainer',
  components: {
    ChatHeader,
    Content,
    MessageInputBar,
    Camera,
    'message-content': Content,
    Message,
    DocumentMessage,
    ForwardMessage,
    ForwardTab,
    PhotoMessage,
    VideoMessage,
    Button,
    Prompt,
    MessagePopUp,
    ReactionPopUp
  },
  watch: {
    messages: {
      handler (val: any): void {
        EventBus.$emit('messages.get', [...val])
      },
      immediate: true
    },
    offlineMessages: {
      handler (): void {
        const messages = this.offlineMessages.messages[this.currentConversation._id]

        if (messages) {
          EventBus.$emit('messages.get', [...messages])
        }
      },
      immediate: true
    },
    selectMessagesOpen: {
      handler (val): void {
        if (!val) {
          this.selectedMessages = []
          this.closePrompt()
        }
      }
    },
    clearMessages: {
      handler (): void {
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
    },
    screenWidth () {
      this.scroll = false
      this.scrollUp = false
    }
  }
})
export default class MessageContainer extends Vue {
  promptOpen = false
  promptStatus = '' as any
  readReceipts = [] as Array<string>
  selectedMessages = [] as Array<any>
  forwardMessage = false as boolean
  messages = [] as any
  promise = null as any
  capturedImage = null as any
  scroll = false as boolean
  scrollUp = false as boolean
  lastScroll = 0
  messageDeleteFailed = false as boolean
  cameraOpened = false as boolean

  offlineMessages = { messages: {} } as any

  messageReply = {} as any
  messageError = false as boolean

  isMessagesLoading = true as boolean

  messagePopUpIndex = 0 as number
  key = 0 as number
  throttleTimer = false
  currentOfflinePage = 0
  currentPage = 1 as number
  pageCount = 0 as number

  imageRegex = ImageRegex
  videoRegex = VideoRegex
  documentRegex = DocumentRegex
  emailRegex = EmailRegex
  websiteRegex = WebsiteRegex
  checkAttachmentType = checkAttachmentType
  messageIndex = 0

  created () {
    this.handleConversationOpen()
    this.onNewPseudoMessage()
    this.onNewMessage()
    this.onImageDelete()
    this.getReadReceipts()
    this.onFailedMessageSend()
    this.onNewReaction()
    this.onRemoveReaction()
  }

  get allConversations () {
    return store.state.allConversations
  }

  get regularConversations () {
    return store.state.regularConversations
  }

  get conversationCreatedAt () {
    const messages = this.offlineMessages.messages[this.currentConversation._id]

    if (messages.length < 1) return ''

    const info = this.currentConversation.is_group
      ? 'This group was created by'
      : 'This conversation was created'
    let dateText = ''

    if (this.currentConversation.is_group) {
      const moderator = this.currentConversation.moderator
      const date = !Array.isArray(messages[0][0])
        ? this.formatDate(messages[0].created_at)
        : this.formatDate((messages[0][0] as ObjectType).created_at)
      dateText +=
        this.$user_token === moderator.user_token ? ' You' : ' ' + moderator.meta_data.display_name
      dateText += date === 'Today' ? ' today.' : ` on ${date}.`
    } else {
      if (!Array.isArray(messages[0])) {
        const date = this.formatDate(messages[0].created_at)
        dateText += date === 'Today' ? ' today.' : ` on ${date}.`
      } else {
        const date = this.formatDate(messages[0][0].created_at)
        dateText += date === 'Today' ? ' today.' : ` on ${date}.`
      }
    }

    return info + ' ' + dateText
  }

  get screenWidth () {
    return store.state.screenWidth
  }

  get isMessageReactionViewEnabled () {
    return store.state.messageReactionViewEnabled
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

  get isMessageReactionDeleteEnabled () {
    return store.state.messageReactionDeleteEnabled
  }

  handleConversationOpen (): void {
    EventBus.$on('conversation-opened', async (conversation: ObjectType) => {
      this.closeModal(this.messageIndex)

      this.messages = []
      this.messageReply = {}
      this.currentOfflinePage = 0
      this.currentPage = 1
      this.pageCount = 0

      this.scroll = false
      this.scrollUp = false

      this.isMessagesLoading = true

      store.setState('currentConversation', conversation)
      EventBus.$emit('mark-as-read', conversation)
      store.setState('messageViewProfileOpen', false)

      await this.getOfflineMessages()
      this.scrollToBottom()

      await this.getConversationMessages()
      if (!this.messageError) {
        this.isMessagesLoading = false
      }
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

  openModal (index: number) {
    this.messageIndex = index
    const messageBubbleEl = document.getElementById(
      `message-bubble-${this.messageIndex}`
    ) as HTMLElement
    const messagePopupEl = document.getElementById('message-popup') as HTMLElement
    const reactionPopupEl = document.getElementById('reaction-pop-up') as HTMLElement
    const lastThreeInArray =
      index >= this.offlineMessages.messages[this.currentConversation._id].length - 3
    let isMessageReceiver = false
    const offlineMessage =
      this.offlineMessages.messages[this.currentConversation._id][this.messageIndex]

    if (Array.isArray(offlineMessage)) {
      isMessageReceiver = this.isReceiver(offlineMessage)
    } else {
      isMessageReceiver = offlineMessage.sender_token === this.$user_token
    }

    /*
      Message popup.
    */

    if (messagePopupEl.style.display === 'block') messagePopupEl.style.display = 'none'

    if (lastThreeInArray && this.scroll) {
      messagePopupEl.style.top = `${messageBubbleEl.getBoundingClientRect().top - 90}px`
    } else {
      messagePopupEl.style.top = `${messageBubbleEl.getBoundingClientRect().top + 20}px`
    }

    if (isMessageReceiver) {
      messagePopupEl.style.left = 'initial'
      messagePopupEl.style.right = '3.688rem'
    } else {
      messagePopupEl.style.right = 'initial'
      messagePopupEl.style.left = `${this.getPopUpLeftPosition('message')}`
    }

    messagePopupEl.style.display = 'block'

    /*
      Reaction popup.
    */

    if (this.isMessageReactionViewEnabled) {
      if (reactionPopupEl.style.display === 'block') reactionPopupEl.style.display = 'none'

      if (lastThreeInArray && this.scroll) {
        reactionPopupEl.style.top = `${messageBubbleEl.getBoundingClientRect().top - 143}px`
      } else {
        reactionPopupEl.style.top = `${messageBubbleEl.getBoundingClientRect().top - 55}px`
      }

      if (isMessageReceiver) {
        reactionPopupEl.classList.add('receiver')
        reactionPopupEl.style.left = 'initial'
        reactionPopupEl.style.right = '3.688rem'
      } else {
        reactionPopupEl.classList.remove('receiver')
        reactionPopupEl.style.right = 'initial'
        reactionPopupEl.style.left = `${this.getPopUpLeftPosition('reaction')}`
      }
      reactionPopupEl.style.display = 'block'
    }
  }

  getPopUpLeftPosition (type: string) {
    const messageEl = this.$refs.message as HTMLElement
    const messageBubbleEl = document.getElementById(
      `message-bubble-${this.messageIndex}`
    ) as HTMLElement
    const pos =
      type === 'reaction'
        ? (messageBubbleEl.getBoundingClientRect().width - 20) / 16
        : messageBubbleEl.getBoundingClientRect().width / 16 + 1.688

    if (pos * 16 + 200 > messageEl.getBoundingClientRect().width) {
      return pos + '%'
    }
    return pos + 'rem'
  }

  closeModal (index: number) {
    const messagePopupEl = document.getElementById('message-popup') as HTMLElement
    const reactionPopupEl = document.getElementById('reaction-pop-up') as HTMLElement

    /*
      Message popup.
    */

    if (this.messageIndex === index) {
      messagePopupEl.classList.remove('robin-zoomIn')
      messagePopupEl.classList.add('robin-zoomOut')

      window.setTimeout(() => {
        messagePopupEl.style.display = 'none'
        messagePopupEl.classList.add('robin-zoomIn')
        messagePopupEl.classList.remove('robin-zoomOut')
      }, 300)
    }

    /*
      Reaction popup.
    */

    if (this.isMessageReactionViewEnabled && this.messageIndex === index) {
      reactionPopupEl.classList.remove('robin-zoomIn')
      reactionPopupEl.classList.add('robin-zoomOut')

      window.setTimeout(() => {
        reactionPopupEl.style.display = 'none'
        reactionPopupEl.classList.add('robin-zoomIn')
        reactionPopupEl.classList.remove('robin-zoomOut')
      }, 300)
    }
  }

  onFailedMessageSend () {
    EventBus.$on('message-send-failed', (message: ObjectType) => {
      const offlineMessageIndex = this.offlineMessages.messages[message.conversation_id].findIndex(
        (item: Array<ObjectType> | ObjectType) => {
          if (Array.isArray(item)) {
            if (item[0].pseudo && !item[0].failed) {
              return message.content.local_id === item[0].content.local_id
            }
          } else {
            if (item.pseudo && !item.failed) {
              return message.content.local_id === item.content.local_id
            }
          }

          return false
        }
      )

      // check if offline message already exists.
      if (offlineMessageIndex !== -1) {
        const tempOfflineMessages = [...this.offlineMessages.messages[message.conversation_id]]
        const tempMessage = tempOfflineMessages[offlineMessageIndex]
        let data = null

        if (Array.isArray(tempMessage)) {
          data = [...tempMessage]
          data[0].failed = true
        } else {
          data = { ...tempMessage }
          data.failed = true
        }

        tempOfflineMessages.splice(offlineMessageIndex, 1, data)

        this.sortOfflineMessages(tempOfflineMessages)
      }
    })
  }

  onNewPseudoMessage () {
    EventBus.$on('new-pseudo-message', async (message: ObjectType) => {
      if (message.conversation_id === this.currentConversation._id) {
        const newMessage =
          message.has_attachment &&
          this.imageRegex.test(this.checkAttachmentType(message.content.attachment, message))
            ? [message]
            : message

        if (
          message.has_attachment &&
          this.imageRegex.test(this.checkAttachmentType(message.content.attachment, message))
        ) {
          const file = newMessage[0].content.attachment
          const blob = file.slice(0, file.size, file.type)
          newMessage[0].content.attachment = await blobToArrayBuffer(blob)
        }

        if (
          message.has_attachment &&
          !this.imageRegex.test(this.checkAttachmentType(message.content.attachment, message))
        ) {
          const file = newMessage.content.attachment
          const blob = file.slice(0, file.size, file.type)
          newMessage.content.attachment = await blobToArrayBuffer(blob)
        }

        this.messages.push(newMessage)

        if (this.offlineMessages.messages[message.conversation_id]) {
          const tempOfflineMessages = [
            ...this.offlineMessages.messages[message.conversation_id],
            newMessage
          ]

          // this.resetCurrentOfflinePage()
          this.sortOfflineMessages(tempOfflineMessages)
        }

        this.scrollToBottom()
      }
      this.allConversations.forEach((conversation, index) => {
        if (conversation._id === message.conversation_id) {
          this.allConversations[index].updated_at = message.content.timestamp
          this.allConversations[index].last_message = message.content

          const newConv = this.allConversations[index]

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
    EventBus.$on('new-message', (message: ObjectType) => {
      if (message.conversation_id === this.currentConversation._id) {
        console.log(message)
        const messageIndex = this.messages.findIndex((item: Array<ObjectType> | ObjectType) => {
          if (Array.isArray(item)) {
            return item.some((obj) => message.content.local_id === obj.content.local_id)
          } else {
            return message.content.local_id === item.content.local_id
          }
        })

        const newMessage =
          message.has_attachment &&
          this.imageRegex.test(this.checkAttachmentType(message.content.attachment, message))
            ? [message]
            : message

        // check if message already exists.
        if (messageIndex !== -1) {
          this.messages.splice(messageIndex, 1, newMessage)
        } else {
          this.messages.push(newMessage)
        }

        if (this.offlineMessages.messages[message.conversation_id]) {
          const offlineMessageIndex = this.offlineMessages.messages[
            message.conversation_id
          ].findIndex((item: Array<ObjectType> | ObjectType) => {
            if (Array.isArray(item)) {
              return item.some((obj) => message.content.local_id === obj.content.local_id)
            } else {
              return message.content.local_id === item.content.local_id
            }
          })

          // console.log(offlineMessageIndex, message)

          const tempOfflineMessages = [...this.offlineMessages.messages[message.conversation_id]]

          // check if offline message already exists.
          if (offlineMessageIndex !== -1) {
            tempOfflineMessages.splice(offlineMessageIndex, 1, newMessage)
          } else {
            tempOfflineMessages.push(newMessage)
          }

          // this.resetCurrentOfflinePage()
          this.currentOfflinePage += 1
          this.sortOfflineMessages(tempOfflineMessages)
        }

        this.scrollToBottom()

        if (message.sender_token !== this.$user_token) {
          const tempMessage = this.messages[this.messages.length - 1]
          const messageId = Array.isArray(tempMessage) ? tempMessage[0]._id : tempMessage._id
          const messageIds = [messageId]

          this.initializeReadReceipts(messageIds)
        }
      }
      if (message.conversation_id !== this.currentConversation._id) {
        const index = this.regularConversations.findIndex(
          (item) => item._id === message.conversation_id
        )

        EventBus.$emit('mark-as-unread', this.regularConversations[index])
      }
      this.allConversations.forEach((conversation, index) => {
        if (conversation._id === message.conversation_id) {
          this.allConversations[index].updated_at = message.content.timestamp
          this.allConversations[index].last_message = message.content

          const newConv = this.allConversations[index]

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

  onMessageDelete (message: ObjectType) {
    const messageIndex = this.messages.findIndex((item: Array<ObjectType> | ObjectType) => {
      if (Array.isArray(item)) return item.some((image) => image._id === message._id)
      return item._id === message._id
    }) as number

    this.messages.splice(messageIndex, 1)
    this.offlineMessages.messages[this.currentConversation._id].splice(this.messageIndex, 1)

    const offlineMessages = [...this.offlineMessages.messages[this.currentConversation._id]]

    const currentPage = offlineMessages.length > 10 ? offlineMessages.length - 10 : 0

    this.setOfflineMessages(offlineMessages.slice(currentPage, offlineMessages.length))
  }

  onImageDelete () {
    EventBus.$on('image-deleted', (message: ObjectType) => {
      const messageIndex = this.messages.findIndex((item: ObjectType | ObjectType[]) => {
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
        if (this.messages[messageIndex].length > 1) {
          const index = this.messages[messageIndex].findIndex(
            (item: ObjectType) => item._id === message._id
          ) as number

          const data = [...(this.messages[messageIndex] as ObjectType[])] as Array<ObjectType>
          data.splice(index, 1)
          this.messages.splice(messageIndex, 1, data)
        } else {
          this.messages.splice(messageIndex, 1)
        }
      }

      if (offlineMessageIndex >= 0) {
        // Delete message from image grid.
        const offlineMessages = { ...this.offlineMessages.messages }

        if (offlineMessages[this.currentConversation._id][offlineMessageIndex].length > 1) {
          const index = offlineMessages[this.currentConversation._id][
            offlineMessageIndex
          ].findIndex((item: any) => item._id === message._id) as number

          offlineMessages[this.currentConversation._id][offlineMessageIndex].splice(index, 1)

          this.$set(this.offlineMessages, 'messages', offlineMessages)

          store.setState(
            'imagesToPreview',
            offlineMessages[this.currentConversation._id][offlineMessageIndex]
          )
        } else {
          offlineMessages[this.currentConversation._id].splice(offlineMessageIndex, 1)
          this.closeImagePreview()
        }

        const currentPage = offlineMessages.length > 10 ? offlineMessages.length - 10 : 0

        this.setOfflineMessages(
          offlineMessages[this.currentConversation._id].slice(currentPage, offlineMessages.length)
        )
      }
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

  throttleConversationMessages (callback: () => void, time: number) {
    if (this.throttleTimer) return

    this.throttleTimer = true

    setTimeout(() => {
      callback()
      this.throttleTimer = false
    }, time)
  }

  handleInfiniteScroll () {
    const wrapper = this.$refs.message as HTMLElement
    const scrollSpaceLeft = Math.floor(wrapper.scrollHeight - wrapper.clientHeight) - 2
    const endOfScroll = Math.floor(wrapper.scrollTop) >= scrollSpaceLeft

    if (!endOfScroll) {
      this.scroll = true
      this.scrollUp = true
    } else {
      this.scroll = false
      this.scrollUp = false
    }

    this.throttleConversationMessages(async () => {
      const scrollSpaceLeft = Math.floor(wrapper.scrollHeight - wrapper.clientHeight) - 2
      const endOfScroll = Math.floor(wrapper.scrollTop) >= scrollSpaceLeft

      if (this.currentPage < this.pageCount) {
        if (wrapper.scrollTop === 0 && !endOfScroll) {
          this.isMessagesLoading = true
          this.currentPage += 1
          await this.paginateConversationMessages(this.currentPage)
          wrapper.scrollTop = 160
          this.isMessagesLoading = false
        }
      }
    }, 500)
  }

  async getConversationMessages (): Promise<void> {
    const res = await this.$robin.getConversationMessages(
      this.currentConversation._id,
      this.$user_token,
      10,
      this.currentPage
    )

    if (res && !res.error) {
      console.log('old ->', res.data.messages)
      this.testMessages(res.data.messages ? res.data.messages : [])

      this.messageError = false
      this.pageCount = res.data.pagination.pagination.totalPage
      this.currentOfflinePage = res.data.pagination.pagination.total

      const offlineMessages =
        this.offlineMessages.messages[this.currentConversation._id] && res.data.messages
          ? [...this.offlineMessages.messages[this.currentConversation._id]]
          : ([] as Array<ObjectType>)

      this.sortOfflineMessages(offlineMessages)

      this.handleReadReceipts(res.data.messages)
    } else {
      this.messageError = true
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  async paginateConversationMessages (page: number) {
    const res = await this.$robin.getConversationMessages(
      this.currentConversation._id,
      this.$user_token,
      10,
      page
    )

    if (res && !res.error) {
      console.log('new ->', res.data.messages, this.currentPage, page)
      console.log('pagination ->', res.data.pagination)
      this.testMessages(res.data.messages ? res.data.messages : [])

      this.messageError = false

      // this.resetCurrentOfflinePage()
      this.currentOfflinePage -= this.currentPage === this.pageCount ? 0 : 10

      // if (res.data.messages) {
      //   for (let i = res.data.messages.length - 1; i >= 0; i--) {
      //     this.offlineMessages.messages[this.currentConversation._id].unshift(res.data.messages[i])
      //   }
      // }

      this.sortOfflineMessages(this.offlineMessages.messages[this.currentConversation._id])

      this.handleReadReceipts(res.data.messages)
    } else {
      this.messageError = true
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  scrollToBottom (): void {
    const message = document.getElementById('message-container') as HTMLElement
    window.setTimeout(() => {
      message.scrollTop = message.scrollHeight + 100
    }, 0)
  }

  openCamera (): void {
    this.cameraOpened = true
  }

  closeCamera (): void {
    const popup = this.$refs['popup-1'] as any
    popup.$refs['popup-body'].classList.remove('robin-squeezeOut')
    popup.$refs['popup-body'].classList.add('robin-squeezeIn')

    window.setTimeout(() => {
      popup.$refs['popup-body'].classList.remove('robin-squeezeIn')
      popup.$refs['popup-body'].classList.add('robin-squeezeOut')

      this.cameraOpened = false
    }, 100)
  }

  openImagePreview ($event: any): void {
    store.setState('imagePreviewOpen', true)
    store.setState('imagesToPreview', $event)
  }

  closeImagePreview (): void {
    store.setState('imagePreviewOpen', false)
    store.setState('imagesToPreview', [])
  }

  handleCapturedImage (val: ObjectType): void {
    this.capturedImage = val
  }

  testMessages (messages: Array<ObjectType>): void {
    const newMessages = []
    let temp = []

    for (let index = 0; index < messages.length; index += 1) {
      const fileMimeType = this.checkAttachmentType(
        messages[index].content.attachment || '',
        messages[index]
      ) as any
      const isImage = this.imageRegex.test(
        fileMimeType &&
          (!messages[index].content.msg || messages[index].content.msg === 'undefined')
          ? fileMimeType
          : ''
      ) as boolean

      const nextFileMimeType = this.checkAttachmentType(
        messages[index + 1] ? messages[index + 1].content.attachment || '' : '',
        messages[index + 1]
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

    this.messages = [...newMessages, ...this.messages]
  }

  async clearAllMessages (): Promise<void> {
    const id = [] as Array<string>

    for (let i = 0; i < this.messages.length; i += 1) {
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
      await this.getConversationMessages()
      // this.scrollToBottom()
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }

    store.setState('clearMessages', false)
  }

  // onScroll (): void {
  //   if (!this.scroll) this.scroll = true

  //   this.handleInfiniteScroll()
  // }

  toggleCheckAction (val: boolean, message: Array<ObjectType> | ObjectType): void {
    if (!val) {
      this.selectMessage(message)
    } else {
      this.removeSelectedMessage(message)
    }
  }

  selectMessage (message: Array<ObjectType> | ObjectType): void {
    this.selectedMessages.push(message)
  }

  removeSelectedMessage (message: Array<ObjectType> | ObjectType): void {
    const index = this.selectedMessages.findIndex((item) => {
      if (Array.isArray(message)) {
        return item[0]._id === message[0]._id
      }

      return item._id === message._id
    })

    this.selectedMessages.splice(index, 1)
  }

  onChatClickAway (): void {
    store.setState('selectMessagesOpen', false)
  }

  onCloseForwardMessagePopup (): void {
    this.forwardMessage = false
    store.setState('selectMessagesOpen', false)
  }

  replyMessage (): void {
    const offlineMessage =
      this.offlineMessages.messages[this.currentConversation._id][this.messageIndex]
    const isArray = Array.isArray(offlineMessage)
    this.messageReply = !isArray ? { ...offlineMessage } : { ...offlineMessage[0] }
  }

  onCloseReply (): void {
    this.messageReply = {}
  }

  async deleteSelectedMessages () {
    const res = await this.$robin.deleteMessages(
      this.selectedMessages.map((message) => {
        if (Array.isArray(message)) {
          message.forEach((item) => {
            return item._id
          })
        }

        return message._id
      }),
      this.$user_token
    )

    if (res && !res.error) {
      this.selectedMessages.forEach(async (message) => {
        if (Array.isArray(message)) {
          for (const item of message) {
            await this.deleteMessage(item)
          }
        } else {
          await this.deleteMessage(message)
        }
      })

      this.selectedMessages = []
      store.setState('selectMessagesOpen', false)
      this.promptOpen = false

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

  openPrompt (status: string) {
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
    const message = document.querySelector(`#message-bubble-${messageIndex}`) as HTMLElement
    message.scrollIntoView({ behavior: 'smooth', block: 'end' })
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
    if (this.promptStatus === 'delete message') {
      this.setMessageToDelete()
    }
  }

  async getOfflineMessages (): Promise<any> {
    try {
      const value = (await localForage.getItem('messages')) as Array<ObjectType>
      this.offlineMessages = value ? { ...value } : { messages: {} }
      // this.scrollToBottom()
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
      // this.getOfflineMessages()
    } catch (error) {
      console.error(error)
    }
  }

  async sortOfflineMessages (messages: Array<ObjectType>) {
    const messageIds = new Set()
    const findMessage = (item: ObjectType | Array<ObjectType>) => {
      if (Array.isArray(item)) {
        return item[0].conversation_id === this.currentConversation._id
      }

      return item.conversation_id === this.currentConversation._id
    }
    // this.messages.slice(this.currentOfflinePage, this.messages.length).filter(findMessage)
    const removedDuplicates = [
      ...this.messages.filter(findMessage),
      ...messages.filter(findMessage)
    ]
      .filter((item: ObjectType) => {
        const itemId = Array.isArray(item) ? item[0].content.local_id : item.content.local_id
        const isDuplicate = messageIds.has(itemId)

        messageIds.add(itemId)

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
      this.$set(this.offlineMessages, 'messages', data)
    }

    this.$set(this.offlineMessages.messages, this.currentConversation._id, [...removedDuplicates])

    this.setOfflineMessages(
      [...removedDuplicates].slice(removedDuplicates.length - 10, removedDuplicates.length)
    )
  }

  async setMessageToDelete () {
    this.messageDeleteFailed = false

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

    if (!this.messageDeleteFailed) {
      this.$toast.open({
        message: 'Message Deleted.',
        type: 'success',
        position: 'bottom-left'
      })
      this.closePrompt()
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  async deleteMessage (message: ObjectType): Promise<void> {
    const res = await this.$robin.deleteMessages([message._id], this.$user_token)

    if (res && !res.error) {
      this.onMessageDelete(message)
      this.messageDeleteFailed = false
    } else {
      this.messageDeleteFailed = true
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
      !Array.isArray(message) &&
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

    if (!Array.isArray(message) && message.content && message.sender_token === this.$user_token) {
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
      !Array.isArray(message) &&
      message.content &&
      message.sender_token !== this.$user_token &&
      Array.isArray(nextMessage) &&
      this.isReceiver(nextMessage)
    ) {
      return 'robin-message-sender robin-flex-align-start prev'
    }

    return 'robin-message-sender robin-flex-align-start' // false
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
        moment((dateA as ObjectType).created_at).format('YYYY-MM-DD') !==
        moment((dateB as ObjectType).created_at).format('YYYY-MM-DD')
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

  async addReaction (emoji: string): Promise<void> {
    const robin = this.$robin as any
    const offlineMessage =
      this.offlineMessages.messages[this.currentConversation._id][this.messageIndex]
    const message = Array.isArray(offlineMessage)
      ? offlineMessage[0]
      : (offlineMessage as ObjectType)

    await robin.reactToMessage(emoji, this.currentConversation._id, message._id, this.$user_token)
  }

  async removeReaction (reaction: ObjectType, index: number): Promise<void> {
    const robin = this.$robin as Robin
    this.messageIndex = index
    const offlineMessage =
      this.offlineMessages.messages[this.currentConversation._id][this.messageIndex]
    const tempMessage = Array.isArray(offlineMessage)
      ? offlineMessage[0]
      : (offlineMessage as ObjectType)

    if (this.isMessageReactionDeleteEnabled) {
      console.log(reaction, tempMessage, index)
      await robin.RemoveReaction(reaction._id, tempMessage._id)
    }
  }

  onNewReaction () {
    EventBus.$on('message.reaction', (message: ObjectType) => {
      const offlineMessage =
        this.offlineMessages.messages[this.currentConversation._id][this.messageIndex]
      const isImage = Array.isArray(offlineMessage)
      const tempMessage = isImage ? { ...offlineMessage[0] } : { ...offlineMessage }

      if (!tempMessage.reactions) {
        this.$set(
          this.offlineMessages.messages[this.currentConversation._id][this.messageIndex],
          'reactions',
          []
        )
      }

      if (tempMessage._id === message.message_id) {
        const reactions = [...(tempMessage.reactions ?? []), message]

        tempMessage.reactions = reactions

        if (isImage) {
          this.$set(
            this.offlineMessages.messages[this.currentConversation._id][this.messageIndex],
            0,
            tempMessage
          )
        } else {
          this.$set(
            this.offlineMessages.messages[this.currentConversation._id][this.messageIndex],
            'reactions',
            reactions
          )
        }
      }
    })
  }

  onRemoveReaction () {
    EventBus.$on('message.remove.reaction', (message: ObjectType) => {
      const offlineMessage =
        this.offlineMessages.messages[this.currentConversation._id][this.messageIndex]
      const isImage = Array.isArray(offlineMessage)
      const tempMessage = isImage ? { ...offlineMessage[0] } : { ...offlineMessage }

      if (message.message_id === tempMessage._id) {
        const reactions = [...(tempMessage.reactions ?? [])] as Array<ObjectType>
        const reactionIndex = reactions.findIndex((item: any) => item._id === message._id)
        if (reactionIndex > -1) {
          reactions.splice(reactionIndex, 1)
          tempMessage.reactions = reactions

          if (isImage) {
            this.$set(
              this.offlineMessages.messages[this.currentConversation._id][this.messageIndex],
              0,
              tempMessage
            )
          } else {
            this.$set(
              this.offlineMessages.messages[this.currentConversation._id][this.messageIndex],
              'reactions',
              reactions
            )
          }
        }
      }
    })
  }
}
</script>
