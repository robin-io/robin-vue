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
      <div class="robin-loader robin-flex robin-flex-align-center" v-if="isMessagesLoading">
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
            {{
              formatDate(
                !Array.isArray(message)
                  ? message.created_at || message.content.timestamp
                  : message[0].created_at || message[0].content.timestamp
              )
            }}
          </div>
          <message
            v-if="!Array.isArray(message) && !message.has_attachment"
            :message="message"
            :index="index"
            :messages="offlineMessages.messages[currentConversation._id]"
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
        <svg-icon name="downward" />
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
import EventBus from '@/event-bus'
import Component, { mixins } from 'vue-class-component'
import { DocumentRegex, EmailRegex, WebsiteRegex, ImageRegex, VideoRegex } from '@/utils/constants'
import { blobToArrayBuffer, checkAttachmentType } from '@/utils/helpers'
import ChatHeader from '../ChatHeader/ChatHeader.vue'
import MessageInputBar from '../MessageInputBar/MessageInputBar.vue'
import Button from '@/components/Button/Button.vue'
import Camera from '../Camera/Camera.vue'
import { formatTimestamp } from '@/utils/date'
import localForage from 'localforage'
import ConversationMixin from '@/mixins/conversation-mixins'
import store from '@/store/index'
import { Robin } from 'robin.io-js'
import Message from '../Message/Message.vue'
import PhotoMessage from '../PhotoMessage/PhotoMessage.vue'
import VideoMessage from '../VideoMessage/VideoMessage.vue'
import DocumentMessage from '../DocumentMessage/DocumentMessage.vue'
import ForwardMessage from '../ForwardMessage/ForwardMessage.vue'
import ForwardTab from '../ForwardTab/ForwardTab.vue'
import Prompt from '../Prompt/Prompt.vue'
import MessagePopUp from '../MessagePopUp/MessagePopUp.vue'
import ReactionPopUp from '../ReactionPopUp/ReactionPopUp.vue'
import SvgIcon from '../SvgIcon/SvgIcon.vue'

// eslint-disable-next-line
@Component<MessageContainer>({
  name: 'MessageContainer',
  components: {
    ChatHeader,
    MessageInputBar,
    Camera,
    Message,
    DocumentMessage,
    ForwardMessage,
    ForwardTab,
    PhotoMessage,
    VideoMessage,
    Button,
    Prompt,
    MessagePopUp,
    ReactionPopUp,
    SvgIcon
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
        if (this.imageSelected) {
          this.messageReply = this.imagesToPreview[this.imageSelected]
        }
      }
    },
    isWebSocketConnected: {
      handler (val): void {
        if (val) {
          this.sendUnsentMessages()
        }
      }
    }
  }
})
export default class MessageContainer extends mixins(ConversationMixin) {
  promptOpen = false;
  forwardMessage = false;
  scroll = false;
  scrollUp = false;
  messageDeleteFailed = false;
  cameraOpened = false;
  messageError = false;
  isMessagesLoading = true;

  lastScroll = 0;
  messagePopUpIndex = 0;
  key = 0;
  currentOfflinePage = 0;
  currentPage = 1;
  pageCount = 1;
  messageIndex = 0;

  promptStatus = '';

  selectedMessages = [] as ObjectType[];
  messages = [] as ObjectType[];

  promise = null;
  capturedImage = null as ObjectType | null;
  offlineMessages = { messages: {} } as ObjectType;
  messageReply = {} as ObjectType;

  imageRegex = ImageRegex;
  videoRegex = VideoRegex;
  documentRegex = DocumentRegex;
  emailRegex = EmailRegex;
  websiteRegex = WebsiteRegex;

  checkAttachmentType = checkAttachmentType;
  throttleTimer = false;

  created () {
    this.handleConversationOpen()
    this.onNewPseudoMessage()
    this.onNewMessage()
    this.onImageDelete()
    this.readReceipts()
    this.onFailedMessageSend()
    this.onNewReaction()
    this.onRemoveReaction()
  }

  get conversationCreatedAt () {
    const date = this.formatDate?.(this.currentConversation.created_at)
    return this.currentConversation.is_group
      ? `This group was created ${date === 'Today' ? 'today.' : `on ${date}.`}`
      : `This conversation was created ${date === 'Today' ? 'today.' : ` on ${date}.`}`
  }

  handleConversationOpen (): void {
    EventBus.$on('conversation-opened', async (conversation: ObjectType) => {
      this.closeModal(this.messageIndex)

      this.messages = []
      this.messageReply = {}
      this.currentPage = 1
      this.pageCount = 1

      this.scroll = false
      this.scrollUp = false

      this.isMessagesLoading = true

      store.setState('currentConversation', conversation)
      EventBus.$emit('mark-as-read', conversation)
      store.setState('messageViewProfileOpen', false)

      await this.getOfflineMessages()
      await this.getConversationMessages()
      this.scrollToBottom()
      if (!this.messageError) {
        this.sendUnsentMessages()
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
      this.showToast('Failed to read messages.', 'error')
    }
  }

  readReceipts () {
    EventBus.$on('read.reciept', (message: ObjectType) => {
      if (this.currentConversation._id) {
        const messages = this.copyConversations(
          this.offlineMessages.messages[this.currentConversation._id] ?? []
        )
        const index = messages.findIndex((item: ObjectType) => {
          if (item._id) {
            return item._id === message.message_ids[0]
          }

          return false
        })

        if (index !== -1) {
          messages[index].is_read = true
          this.$set(this.offlineMessages.messages, this.currentConversation._id, messages)
        }
      }
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
      index > this.offlineMessages.messages[this.currentConversation._id].length - 3
    const offlineMessage =
      this.offlineMessages.messages[this.currentConversation._id][this.messageIndex]
    const isMessageReceiver = Array.isArray(offlineMessage)
      ? this.isReceiver(offlineMessage)
      : offlineMessage.sender_token === this.$user_token

    /*
      Message popup.
    */
    if (messagePopupEl.style.display === 'block') {
      messagePopupEl.style.display = 'none'
    }

    messagePopupEl.style.top = `${
      messageBubbleEl.getBoundingClientRect().top + (lastThreeInArray ? -55 : 20)
    }px`
    messagePopupEl.style.left = isMessageReceiver
      ? 'initial'
      : `${this.getPopUpLeftPosition('message')}`
    messagePopupEl.style.right = isMessageReceiver ? '3.688rem' : 'initial'
    messagePopupEl.style.display = 'block'

    /*
      Reaction popup.
    */
    if (this.isMessageReactionViewEnabled) {
      if (reactionPopupEl.style.display === 'block') {
        reactionPopupEl.style.display = 'none'
      }

      reactionPopupEl.style.top = `${
        messageBubbleEl.getBoundingClientRect().top + (lastThreeInArray ? -100 : -55)
      }px`

      reactionPopupEl.style.left = isMessageReceiver
        ? 'initial'
        : `${this.getPopUpLeftPosition('reaction')}`
      reactionPopupEl.style.right = isMessageReceiver ? '3.688rem' : 'initial'
      reactionPopupEl.classList.toggle('receiver', isMessageReceiver)
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

    if (this.messageIndex === index) {
      messagePopupEl.classList.remove('robin-zoomIn')
      messagePopupEl.classList.add('robin-zoomOut')
      setTimeout(() => {
        messagePopupEl.style.display = 'none'
        messagePopupEl.classList.add('robin-zoomIn')
        messagePopupEl.classList.remove('robin-zoomOut')
      }, 300)
      if (this.isMessageReactionViewEnabled) {
        reactionPopupEl.classList.remove('robin-zoomIn')
        reactionPopupEl.classList.add('robin-zoomOut')
        setTimeout(() => {
          reactionPopupEl.style.display = 'none'
          reactionPopupEl.classList.add('robin-zoomIn')
          reactionPopupEl.classList.remove('robin-zoomOut')
        }, 300)
      }
    }
  }

  onFailedMessageSend () {
    EventBus.$on('message-send-failed', (message: ObjectType) => {
      const offlineMessageIndex = this.offlineMessages.messages[message.conversation_id].findIndex(
        (item: ObjectType[] | ObjectType) => {
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

        // this.sortOfflineMessages(tempOfflineMessages)
        this.$set(this.offlineMessages.messages, this.currentConversation._id, [
          ...tempOfflineMessages
        ])
        this.setOfflineMessages(tempOfflineMessages)
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

          // this.sortOfflineMessages(tempOfflineMessages)

          this.$set(this.offlineMessages.messages, this.currentConversation._id, [
            ...tempOfflineMessages
          ])
          this.setOfflineMessages(tempOfflineMessages)
        }

        this.scrollToBottom()
      }
      this.reorderConversation(message)
    })
  }

  onNewMessage () {
    EventBus.$on('new-message', (message: ObjectType) => {
      if (message.conversation_id === this.currentConversation._id) {
        const messageIndex = this.messages.findIndex((item: ObjectType[] | ObjectType) => {
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
        if (messageIndex !== -1 && !message.is_forwarded) {
          this.messages.splice(messageIndex, 1, newMessage)
        } else {
          this.messages.push(newMessage)
        }

        if (this.offlineMessages.messages[message.conversation_id]) {
          const offlineMessageIndex = this.offlineMessages.messages[
            message.conversation_id
          ].findIndex((item: ObjectType[] | ObjectType) => {
            if (Array.isArray(item)) {
              return item.some((obj) => message.content.local_id === obj.content.local_id)
            } else {
              return message.content.local_id === item.content.local_id
            }
          })

          const tempOfflineMessages = [...this.offlineMessages.messages[message.conversation_id]]

          // check if offline message already exists.
          if (offlineMessageIndex !== -1 && !message.is_forwarded) {
            tempOfflineMessages.splice(offlineMessageIndex, 1, newMessage)
          } else {
            tempOfflineMessages.push(newMessage)
          }

          this.currentOfflinePage += 1
          // this.sortOfflineMessages(tempOfflineMessages)
          this.$set(this.offlineMessages.messages, this.currentConversation._id, [
            ...tempOfflineMessages
          ])
          this.setOfflineMessages(tempOfflineMessages)
        }

        this.scrollToBottom()
        this.isSenderInConversation(message)
      }
      this.markConversationAsUnread(message)
      this.reorderConversation(message)
    })
  }

  isSenderInConversation (message: ObjectType) {
    if (message.sender_token !== this.$user_token) {
      const tempMessage = this.messages[this.messages.length - 1]
      const messageId = Array.isArray(tempMessage) ? [tempMessage[0]._id] : [tempMessage._id]

      this.initializeReadReceipts(messageId)
    }
  }

  reorderConversation (message: ObjectType) {
    this.generalConversations.forEach((conversation, index) => {
      if (conversation._id === message.conversation_id) {
        this.generalConversations[index].updated_at = message.content.timestamp
        this.generalConversations[index].last_message = message.content

        const newConv = this.generalConversations[index]

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
  }

  markConversationAsUnread (message: ObjectType) {
    if (message.conversation_id !== this.currentConversation._id) {
      const index = this.regularConversations.findIndex(
        (item) => item._id === message.conversation_id
      )

      if (index !== -1) {
        EventBus.$emit('mark-as-unread', this.regularConversations[index])
      }
    }
  }

  onMessageDelete (message: ObjectType) {
    const messageIndex = this.messages.findIndex((item: ObjectType[] | ObjectType) => {
      if (Array.isArray(item)) { return item.some((image) => image.content.local_id === message.content.local_id) }

      return item.content.local_id === message.content.local_id
    }) as number

    const offlineMessageIndex = this.offlineMessages.messages[
      this.currentConversation._id
    ].findIndex((item: ObjectType[] | ObjectType) => {
      if (Array.isArray(item)) { return item.some((image) => image.content.local_id === message.content.local_id) }

      return item.content.local_id === message.content.local_id
    }) as number

    if (messageIndex > -1) {
      this.messages.splice(messageIndex, 1)
    }

    const offlineMessages = { ...this.offlineMessages.messages }

    if (offlineMessageIndex > -1) {
      offlineMessages[this.currentConversation._id].splice(offlineMessageIndex, 1)

      this.$set(this.offlineMessages, 'messages', offlineMessages)
    }

    // const currentPage = offlineMessages.length > 20 ? offlineMessages.length - 20 : 0

    this.setOfflineMessages(offlineMessages[this.currentConversation._id])
  }

  onImageDelete () {
    EventBus.$on('image-deleted', (message: ObjectType) => {
      const messageIndex = this.messages.findIndex((item: ObjectType | ObjectType[]) => {
        if (Array.isArray(item)) return item.some((image) => image.content.local_id === message.content.local_id)
        return false
      }) as number

      const offlineMessageIndex = this.offlineMessages.messages[
        this.currentConversation._id
      ].findIndex((item: ObjectType[]) => {
        if (Array.isArray(item)) return item.some((image) => image.content.local_id === message.content.local_id)
        return false
      }) as number

      if (messageIndex >= 0) {
        // Delete message from image grid.
        if (this.messages[messageIndex].length > 1) {
          const index = this.messages[messageIndex].findIndex(
            (item: ObjectType) => item.content.local_id === message.content.local_id
          ) as number

          const data = [...(this.messages[messageIndex] as ObjectType[])] as ObjectType[]
          data.splice(index, 1)
          this.messages.splice(messageIndex, 1, data)
        } else {
          this.messages.splice(messageIndex, 1)
        }
      }

      if (offlineMessageIndex > -1) {
        // Delete message from image grid.
        const offlineMessages = { ...this.offlineMessages.messages }

        if (offlineMessages[this.currentConversation._id][offlineMessageIndex].length > 1) {
          const index = offlineMessages[this.currentConversation._id][
            offlineMessageIndex
          ].findIndex((item: any) => item.content.local_id === message.content.local_id) as number

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

        // const currentPage = offlineMessages.length > 20 ? offlineMessages.length - 20 : 0

        this.setOfflineMessages(offlineMessages[this.currentConversation._id])
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

  sendUnsentMessages () {
    const unsentMessages = this.offlineMessages.messages[this.currentConversation._id]

    if (unsentMessages) {
      for (const message of unsentMessages) {
        if (Array.isArray(message)) {
          if (message[0].pseudo) {
            EventBus.$emit('manual.send', message[0])
          }
        } else {
          if (message.pseudo) {
            EventBus.$emit('manual.send', message)
          }
        }
      }
    }
  }

  async getConversationMessages (): Promise<void> {
    const res = await this.$robin.getConversationMessages(
      this.currentConversation._id,
      this.$user_token,
      20,
      this.currentPage
    )

    if (res && !res.error) {
      const messages = res.data.messages ? res.data.messages : []

      this.messageError = false
      this.pageCount = res.data.pagination.pagination.totalPage
        ? res.data.pagination.pagination.totalPage
        : 1

      const offlineMessages =
        this.offlineMessages.messages[this.currentConversation._id] && messages.length > 0
          ? [...this.offlineMessages.messages[this.currentConversation._id]]
          : ([] as ObjectType[])

      this.testMessages(messages)

      await this.sortOfflineMessages(offlineMessages)

      this.setOfflineMessages([...this.offlineMessages.messages[this.currentConversation._id]])

      this.handleReadReceipts(res.data.messages)
    } else {
      this.messageError = true
      this.showToast('Failed to load conversation messages.', 'error')
    }
  }

  async paginateConversationMessages (page: number) {
    const res = await this.$robin.getConversationMessages(
      this.currentConversation._id,
      this.$user_token,
      20,
      page
    )

    if (res && !res.error) {
      this.testMessages(res.data.messages ? res.data.messages : [])

      this.messageError = false

      await this.sortOfflineMessages(this.offlineMessages.messages[this.currentConversation._id])

      this.handleReadReceipts(res.data.messages)
    } else {
      this.messageError = true
      this.showToast('Failed to load new messages.', 'error')
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

  testMessages (messages: ObjectType[]): void {
    const newMessages = []
    let temp = []

    for (let index = 0; index < messages.length; index += 1) {
      const fileMimeType = this.checkAttachmentType(
        messages[index].content.attachment || '',
        messages[index]
      ) as string
      const isImage = this.imageRegex.test(
        fileMimeType &&
          (!messages[index].content.msg || messages[index].content.msg === 'undefined')
          ? fileMimeType
          : ''
      ) as boolean

      // const nextFileMimeType = this.checkAttachmentType(
      //   messages[index + 1] ? messages[index + 1].content.attachment || '' : '',
      //   messages[index + 1]
      // ) as any
      // const isImageNext = this.imageRegex.test(
      //   messages[index + 1]
      //     ? nextFileMimeType &&
      //       (!messages[index + 1].content.msg || messages[index + 1].content.msg === 'undefined')
      //       ? nextFileMimeType
      //       : ''
      //     : ''
      // ) as any

      if (isImage) {
        temp.push(messages[index])
      }

      if (temp.length > 0) {
        newMessages.push(temp)
        temp = []
      } else {
        newMessages.push(messages[index])
      }

      // if (temp.length > 0) {
      //   if (!Array.isArray(newMessages[newMessages.length - 1])) {
      //     newMessages[newMessages.length] = temp
      //   }
      // }

      // if (!isImageNext || !isImage) {
      // eslint-disable-next-line
      //   if (Array.isArray(newMessages[newMessages.length - 1]) && isImage) {
      // } else {
      // temp = []
      // newMessages.push(messages[index])
      // }
      // }
    }

    if (messages.length > 0) {
      this.messages = [...newMessages, ...this.messages]
    } else {
      this.messages = []
    }
  }

  async clearAllMessages (): Promise<void> {
    const res = await this.$robin.deleteAllMessages(this.currentConversation._id, this.$user_token)
    if (!res.error) {
      this.showToast('Messages Deleted', 'success')
      this.promptOpen = false
      await this.getConversationMessages()
    } else {
      this.showToast('Failed to clear messages.', 'error')
    }

    store.setState('clearMessages', false)
  }

  toggleCheckAction (val: boolean, message: ObjectType[] | ObjectType): void {
    const data = Array.isArray(message) ? message[0] : message
    if (!val) {
      this.selectMessage(data)
    } else {
      this.removeSelectedMessage(data)
    }
  }

  selectMessage (message: ObjectType[] | ObjectType): void {
    this.selectedMessages.push(message)
  }

  removeSelectedMessage (message: ObjectType[] | ObjectType): void {
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
    // store.setState('selectMessagesOpen', false)
    this.closePrompt()
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
    const messagesToDelete = [] as ObjectType[]

    this.selectedMessages.forEach(async (message) => {
      if (Array.isArray(message)) {
        messagesToDelete.push(...message)
      } else {
        messagesToDelete.push(message)
      }
    })

    await this.deleteMessage(messagesToDelete)

    if (!this.messageDeleteFailed) {
      this.showToast(
        this.selectedMessages.length > 0 ? 'Messages Deleted.' : 'Message Deleted.',
        'success'
      )
      this.closePrompt()
    } else {
      this.showToast('Failed to deleted selected messages.', 'error')
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
      this.showToast('Failed to remove group participant.', 'error')
    }
  }

  openPrompt (status: string) {
    this.promptOpen = true

    this.promptStatus = status
  }

  closePrompt () {
    this.promptOpen = false
    this.selectedMessages = []
    store.setState('selectMessagesOpen', false)
    store.setState('clearMessages', false)
    store.setState('exitGroup', false)
    store.setState('removeParticipant', false)
    store.setState('resetCheckedState', true)

    this.$nextTick(() => {
      store.setState('resetCheckedState', false)
    })
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
      this.showToast('You left group', 'success')

      EventBus.$emit('regular-conversation.delete', this.currentConversation)
      EventBus.$emit('close-conversation')

      store.setState('exitGroup', false)
    } else {
      this.showToast('Failed to leave group.', 'error')
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
      const value = (await localForage.getItem('messages')) as ObjectType[]
      this.offlineMessages = value ? { ...value } : { messages: {} }
      // this.scrollToBottom()
    } catch (error) {
      console.error(error)
    }
  }

  async setOfflineMessages (offlineMessages: ObjectType[]): Promise<void> {
    try {
      const initialPage = offlineMessages.length > 20 ? offlineMessages.length - 20 : 0
      const messages = offlineMessages.slice(initialPage, offlineMessages.length)
      const data = { messages: { [this.currentConversation._id]: messages } } as ObjectType

      for (const item in { ...this.offlineMessages.messages }) {
        if (!data.messages[item]) {
          data.messages[item] = [...this.offlineMessages.messages[item]]
        }
      }

      await localForage.setItem('messages', data)
      // this.getOfflineMessages()
    } catch (error) {
      console.error(error)
    }
  }

  async sortOfflineMessages (messages: ObjectType[]) {
    const messageIds = new Set()
    const findMessage = (item: ObjectType | ObjectType[]) =>
      Array.isArray(item)
        ? item[0].conversation_id === this.currentConversation._id
        : item.conversation_id === this.currentConversation._id

    const removedDuplicates = [
      ...this.messages.filter(findMessage),
      ...messages.filter(findMessage)
    ]
      .filter((item: ObjectType) => {
        const _id = Array.isArray(item) ? item[0]._id : item._id
        const itemId = Array.isArray(item) ? item[0].content.local_id : item.content.local_id
        const forwarded = Array.isArray(item) ? item[0].is_forwarded : item.is_forwarded

        const obj = JSON.stringify({ _id, is_forwarded: forwarded ?? false, item_id: itemId })

        if (!messageIds.has(obj)) {
          messageIds.add(obj)
          return true
        }

        return false
      })
      .sort((a, b) => {
        const messageA = Array.isArray(a) ? a[0] : a
        const messageB = Array.isArray(b) ? b[0] : b
        return (
          Number(new Date(messageA.created_at || messageA.content.timestamp)) -
          Number(new Date(messageB.created_at || messageB.content.timestamp))
        )
      })

    const offlineMessages = { ...this.offlineMessages.messages }
    offlineMessages[this.currentConversation._id] = [...removedDuplicates]

    this.$set(this.offlineMessages, 'messages', offlineMessages)
  }

  async setMessageToDelete () {
    this.messageDeleteFailed = false

    const message = this.offlineMessages.messages[this.currentConversation._id][
      this.messageIndex
    ] as ObjectType[] | ObjectType
    const messagesToDelete = []

    if (Array.isArray(message)) {
      messagesToDelete.push(...message)
    } else {
      messagesToDelete.push(message)
    }

    await this.deleteMessage(messagesToDelete)

    if (!this.messageDeleteFailed) {
      this.showToast('Message Deleted', 'success')
      this.closePrompt()
    } else {
      this.showToast('Failed to delete message.', 'error')
    }
  }

  async deleteMessage (messages: ObjectType[]): Promise<void> {
    const messageIds = messages.map((message) => message._id) as string[]

    const res = await this.$robin.deleteMessages(messageIds, this.$user_token)

    if (res && !res.error) {
      for (const message of messages) {
        this.onMessageDelete(message)
      }
      this.messageDeleteFailed = false
    } else {
      this.messageDeleteFailed = true
    }
  }

  isReceiver (message: ObjectType[]) {
    return message.some((item: ObjectType) => item.sender_token === this.$user_token)
  }

  validateMessages (message: ObjectType | ObjectType[], index: number): string {
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

  isDataEqual (dataA: ObjectType[] | ObjectType, dataB: ObjectType[] | ObjectType) {
    return Object.is(JSON.stringify(dataA), JSON.stringify(dataB))
  }

  showDate (index: number) {
    if (index - 1 > -1) {
      const dateA = this.offlineMessages.messages[this.currentConversation._id][index] as
        | ObjectType[]
        | ObjectType
      const dateB = this.offlineMessages.messages[this.currentConversation._id][index - 1] as
        | ObjectType[]
        | ObjectType

      if (Array.isArray(dateA) && !Array.isArray(dateB)) {
        return (
          formatTimestamp(
            new Date(dateA[0].created_at || dateA[0].content.timestamp),
            'YYYY-MM-DD'
          ) !== formatTimestamp(new Date(dateB.created_at || dateB.content.timestamp), 'YYYY-MM-DD')
        )
      }

      if (!Array.isArray(dateA) && Array.isArray(dateB)) {
        return (
          formatTimestamp(new Date(dateA.created_at || dateA.content.timestamp), 'YYYY-MM-DD') !==
          formatTimestamp(new Date(dateB[0].created_at || dateB[0].content.timestamp), 'YYYY-MM-DD')
        )
      }

      if (Array.isArray(dateA) && Array.isArray(dateB)) {
        return (
          formatTimestamp(
            new Date(dateA[0].created_at || dateA[0].content.timestamp),
            'YYYY-MM-DD'
          ) !==
          formatTimestamp(new Date(dateB[0].created_at || dateB[0].content.timestamp), 'YYYY-MM-DD')
        )
      }

      return (
        formatTimestamp(
          new Date((dateA as ObjectType).created_at || (dateA as ObjectType).content.timestamp),
          'YYYY-MM-DD'
        ) !==
        formatTimestamp(
          new Date((dateB as ObjectType).created_at || (dateB as ObjectType).content.timestamp),
          'YYYY-MM-DD'
        )
      )
    }

    return false
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
        const reactions = [...(tempMessage.reactions ?? [])] as ObjectType[]
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
