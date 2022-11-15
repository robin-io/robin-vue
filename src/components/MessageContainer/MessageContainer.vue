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
          (offlineMessages.messages[currentConversation._id] &&
            currentPage > 0 &&
            isMessagesLoading) ||
          (!offlineMessages.messages[currentConversation._id] && isMessagesLoading)
        "
      >
        <div class="robin-spinner"></div>
      </div>
      <div class="robin-inner-wrapper" v-if="offlineMessagesExist">
        <div class="robin-conversation-date" v-if="!isMessagesLoading">
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
          <!-- && !message.is_deleted -->
          <message
            v-if="!Array.isArray(message) && !message.has_attachment"
            :message="message"
            :index="index"
            :messages="offlineMessages.messages[currentConversation._id]"
            :groupname-colors="groupnameColors"
            @open-modal="openModal"
            @close-modal="closeModal"
            @toggle-check-action="toggleCheckAction($event, message)"
            @scroll-to-message="scrollToMessage"
          />
          <!-- && !imagesDeleted(message) -->
          <photo-message
            v-if="Array.isArray(message)"
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
          <!-- && !message.is_deleted -->
          <document-message
            v-if="
              !Array.isArray(message) &&
              message.has_attachment &&
              documentRegex.test(checkAttachmentType(message.content.attachment))
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
          <!-- && !message.is_deleted -->
          <video-message
            v-if="
              !Array.isArray(message) &&
              message.has_attachment &&
              videoRegex.test(checkAttachmentType(message.content.attachment))
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
          : !Array.isArray(offlineMessages.messages[currentConversation._id][messageIndex])
          ? offlineMessages.messages[currentConversation._id][messageIndex] || {}
          : {}
      "
      @forward-message="$emit('forward-message')"
      @reply-message="replyMessage"
      @delete-message="setMessageToDelete"
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
import ForwardMessage from '../ForwardMessage/ForwardMessage.vue'
import ForwardTab from '../ForwardTab/ForwardTab.vue'
import Prompt from '../Prompt/Prompt.vue'
import MessagePopUp from '../MessagePopUp/MessagePopUp.vue'
import ReactionPopUp from '../ReactionPopUp/ReactionPopUp.vue'
import debounce from 'lodash.debounce'

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
      handler (val: any): void {
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
  messageDeleteFailed = false as boolean
  cameraOpened = false as boolean

  offlineMessages = { messages: {} } as any

  messageReply = {} as any
  messageError = false as boolean

  isMessagesLoading = true as boolean

  messagePopUpIndex = 0 as number
  key = 0 as number
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
    this.onImageDelete()
    this.getReadReceipts()
    this.onFailedMessageSend()
  }

  get conversationCreatedAt () {
    if (this.messages.length < 1) return ''

    const info = this.currentConversation.is_group
      ? 'This group was created by'
      : 'This conversation was created'
    let message = ''

    if (this.currentConversation.is_group) {
      const moderator = currentConversation.moderator
      const date = !Array.isArray(this.messages[0][0])
        ? this.formatDate(this.messages[0].created_at)
        : this.formatDate(this.messages[0][0].created_at)
      message +=
        this.$user_token === moderator.user_token ? ' You' : ' ' + moderator.meta_data.display_name
      message += date === 'Today' ? ' today.' : ` on ${date}.`
    } else {
      if (!Array.isArray(this.messages[0])) {
        const date = this.formatDate(this.messages[0].created_at)
        message += date === 'Today' ? ' today.' : ` on ${date}.`
      } else {
        const date = this.formatDate(this.messages[0][0].created_at)
        message += date === 'Today' ? ' today.' : ` on ${date}.`
      }
    }

    return info + ' ' + message
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

  handleConversationOpen (): void {
    EventBus.$on('conversation-opened', async (conversation: ObjectType) => {
      this.closeModal(this.messageIndex)

      this.messages = []
      this.messageReply = {}
      this.currentPage = 0
      this.totalPages = 0

      this.scroll = false
      this.scrollUp = false

      this.isMessagesLoading = true

      store.setState('currentConversation', conversation)
      EventBus.$emit('mark-as-read', conversation)
      store.setState('messageViewProfileOpen', false)

      await this.getOfflineMessages()

      debounce(async () => {
        await this.getConversationMessages()
        if (!this.messageError) {
          this.isMessagesLoading = false
        }
      }, 2000)()
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

  // checkMessageNotDeleted (index: number) {
  //   const offlineMessage = this.offlineMessages.messages[this.currentConversation._id][index]
  //   if (Array.isArray(offlineMessage)) {
  //     return offlineMessage.every((item) => !item.is_deleted)
  //   }

  //   return !offlineMessage.is_deleted
  // }

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

  getPopUpLeftPosition (type: String) {
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
    EventBus.$on('new-pseudo-message', (message: ObjectType) => {
      if (message.conversation_id === this.currentConversation._id) {
        const newMessage =
          message.has_attachment &&
          this.imageRegex.test(this.checkAttachmentType(message.content.attachment))
            ? [message]
            : message

        console.log(newMessage)

        this.messages.push(newMessage)

        if (this.offlineMessages.messages[message.conversation_id]) {
          const tempOfflineMessages = [
            ...this.offlineMessages.messages[message.conversation_id],
            newMessage
          ]

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
          this.imageRegex.test(this.checkAttachmentType(message.content.attachment))
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

          console.log(offlineMessageIndex, message)

          const tempOfflineMessages = [...this.offlineMessages.messages[message.conversation_id]]

          // check if offline message already exists.
          if (offlineMessageIndex !== -1) {
            tempOfflineMessages.splice(offlineMessageIndex, 1, newMessage)
          } else {
            tempOfflineMessages.push(newMessage)
          }

          this.resetCurrentPage()
          this.sortOfflineMessages(tempOfflineMessages)

          // this.refresh()
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

  onMessageDelete (message) {
    const messageIndex = this.messages.findIndex((item: Array<ObjectType> | ObjectType) => {
      if (Array.isArray(item)) return item.some((image) => image._id === message._id)
      return item._id === message._id
    }) as number

    this.messages.splice(messageIndex, 1)
    this.offlineMessages.messages[this.currentConversation._id].splice(this.messageIndex, 1)

    const offlineMessages = [...this.offlineMessages.messages[this.currentConversation._id]]

    const currentPage = offlineMessages.length > 20 ? offlineMessages.length - 20 : 0

    this.setOfflineMessages(offlineMessages.slice(currentPage, offlineMessages.length))

    // this.resetCurrentPage()
    // this.sortOfflineMessages(this.offlineMessages.messages[this.currentConversation._id])
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
        if (this.messages[messageIndex].length > 1) {
          const index = this.messages[messageIndex].findIndex(
            (item: ObjectType) => item._id === message._id
          ) as number

          const data = [...this.messages[messageIndex]] as Array<ObjectType>
          data.splice(index, 1)

          this.$set(this.messages, this.messages[messageIndex], data)
        } else {
          this.messages.splice(messageIndex, 1)
        }
      }

      // if (messageIndex === -1) {
      //   // Delete message from message list.
      //   EventBus.$emit('message-deleted', message)
      // }

      if (offlineMessageIndex >= 0) {
        // Delete message from image grid.
        const offlineMessages = { ...this.offlineMessages.messages }

        if (offlineMessages[this.currentConversation._id][offlineMessageIndex].length > 1) {
          const index = offlineMessages[this.currentConversation._id][
            offlineMessageIndex
          ].findIndex((item: any) => item._id === message._id) as number

          offlineMessages[this.currentConversation._id][offlineMessageIndex].splice(index, 1)

          this.$set(this.offlineMessages, this.offlineMessages.messages, offlineMessages)

          store.setState(
            'imagesToPreview',
            offlineMessages[this.currentConversation._id][offlineMessageIndex]
          )
        } else {
          offlineMessages[this.currentConversation._id].splice(offlineMessageIndex, 1)
          this.closeImagePreview()
        }

        const currentPage = offlineMessages.length > 20 ? offlineMessages.length - 20 : 0

        this.setOfflineMessages(
          offlineMessages[this.currentConversation._id].slice(currentPage, offlineMessages.length)
        )
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
      this.$user_token,
      100,
      1
    )

    if (res && !res.error) {
      this.testMessages(res.data.messages ? res.data.messages : [])

      this.messageError = false

      this.resetCurrentPage()

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
    const message = document.getElementById('message-container') as HTMLElement
    window.setTimeout(() => {
      message.scrollTop = message.scrollHeight + 100
      this.scrollUp = false
      this.scroll = false
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

  handleCapturedImage (val: Object): void {
    this.capturedImage = val
  }

  checkAttachmentType (attachment: any): string {
    let strArr = [] as Array<string>

    if (typeof attachment !== 'string') {
      strArr = attachment.name.split('.')
    } else {
      strArr = attachment.split('.')
    }

    return `${mime.getType(strArr[strArr.length - 1])}`
  }

  testMessages (messages: Array<ObjectType>): void {
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
    const id = [] as Array<ObjectType>

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

  onScroll (): void {
    this.handleScrollUp()

    if (!this.scroll) this.scroll = true
  }

  handleScrollUp () {
    const message = this.$refs.message as HTMLElement
    const messagesLen = this.messages.length
    const offlineMessagesLen = this.offlineMessages.messages[this.currentConversation._id]
      ? this.offlineMessages.messages[this.currentConversation._id].length
      : 0
    const scrollSpaceLeft = Math.floor(message.scrollHeight - message.clientHeight - 20)
    const endOfScroll = Math.floor(message.scrollTop) > scrollSpaceLeft

    if (endOfScroll && this.scrollUp) {
      this.scrollUp = false
    }

    if (message.scrollTop < scrollSpaceLeft) {
      if (!this.isMessagesLoading && !this.scrollUp) {
        this.scrollUp = true
      }
    }

    if (message.scrollTop === 0 && offlineMessagesLen !== messagesLen && this.currentPage > 0) {
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
    this.uncheck = true
  }

  replyMessage (): void {
    const offlineMessage =
      this.offlineMessages.messages[this.currentConversation._id][this.messageIndex]
    const isArray = Array.isArray(offlineMessage)
    this.messageReply = !isArray ? { ...offlineMessage } : [...offlineMessage]
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
      const value = (await localForage.getItem('messages')) as Array<ObjectType>
      this.offlineMessages = value ? { ...value } : { messages: {} }
      this.scrollToBottom()
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

  async sortOfflineMessages (messages: Array<ObjectType>) {
    const messageIds = new Set()
    const findMessage = (item) => {
      if (Array.isArray(item)) {
        return item[0].conversation_id === this.currentConversation._id
      }

      return item.conversation_id === this.currentConversation._id
    }
    const removedDuplicates = [
      ...messages.filter(findMessage),
      ...this.messages.slice(this.currentPage, this.messages.length).filter(findMessage)
    ]
      .filter((item: ObjectType) => {
        const itemId = Array.isArray(item) ? item[0]._id : item._id
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
      this.$set(this.offlineMessages, this.offlineMessages.messages, data)
    }

    this.setOfflineMessages([...removedDuplicates])
  }

  resetCurrentPage () {
    this.currentPage = this.messages.length > 20 ? this.messages.length - 20 : 0
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

  // imagesDeleted (message: Array<ObjectType>) {
  //   return message.every((image: ObjectType) => image.is_deleted)
  // }

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

  async addReaction (emoji: string): Promise<void> {
    const robin = this.$robin as any
    const offlineMessage =
      this.offlineMessages.messages[this.currentConversation._id][this.messageIndex]
    const message = Array.isArray(offlineMessage)
      ? offlineMessage[0]
      : (offlineMessage as ObjectType)

    await robin.reactToMessage(emoji, this.currentConversation._id, message._id, this.$user_token)
  }
}
</script>
