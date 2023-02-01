import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import moment from 'moment'
import CryptoJS from 'crypto-js'
import { Colors } from '@/utils/constants'

@Component
export default class ConversationMixin extends Vue {
    toastMessages = new Map([['Connected', false], ['Reconnecting', false], ['Disconnected', false]])
    offlineMessages: ObjectType | undefined;

    get allConversations () {
      return store.state.allConversations
    }

    get regularConversations () {
      const sortedConversations = this.allConversations.sort((a, b) => {
        const dateA = moment(a.last_message?.timestamp ?? a.updated_at).valueOf()
        const dateB = moment(b.last_message?.timestamp ?? b.updated_at).valueOf()

        return dateB - dateA
      })

      const regularConversations = sortedConversations.filter((conversation: ObjectType) => {
        if (!conversation.archived_for || conversation.archived_for.length === 0) return true
        return !conversation.archived_for.includes(this.$user_token)
      })

      return this.addUnreadMessagesToConversation(regularConversations)
    }

    get isPageLoading () {
      return store.state.isPageLoading
    }

    get archivedConversations () {
      return store.state.archivedConversations
    }

    get isCreateChatEnabled () {
      return store.state.createChatEnabled
    }

    get isArchiveChatEnabled () {
      return store.state.archiveChatEnabled
    }

    get currentTheme () {
      return store.state.currentTheme
    }

    get conversationCreatedAt () {
      const messages = this.offlineMessages?.messages[this.currentConversation._id]

      if (messages.length < 1) return ''

      const info = this.currentConversation.is_group
        ? 'This group was created by'
        : 'This conversation was created'
      let dateText = ''

      if (this.currentConversation.is_group) {
        const moderator = this.currentConversation.moderator
        const date = !Array.isArray(messages[0][0])
          ? this.formatDate?.(messages[0].created_at)
          : this.formatDate?.((messages[0][0] as ObjectType).created_at)
        dateText +=
            this.$user_token === moderator.user_token ? ' You' : ' ' + moderator.meta_data.display_name
        dateText += date === 'Today' ? ' today.' : ` on ${date}.`
      } else {
        if (!Array.isArray(messages[0])) {
          const date = this.formatDate?.(messages[0].created_at)
          dateText += date === 'Today' ? ' today.' : ` on ${date}.`
        } else {
          const date = this.formatDate?.(messages[0][0].created_at)
          dateText += date === 'Today' ? ' today.' : ` on ${date}.`
        }
      }

      if (info && dateText) {
        return info + ' ' + dateText
      }

      return ''
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
      const offlineMessages = this.offlineMessages?.messages[this.currentConversation._id]
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

    get sideBarType () {
      return store.state.sideBarType
    }

    get conversationOpen () {
      return store.state.conversationOpen
    }

    get encryptionDetailsOpen () {
      return store.state.encryptionDetailsOpen
    }

    get profileOpen () {
      return store.state.profileOpen
    }

    get groupPromptOpen () {
      return store.state.groupPromptOpen
    }

    get showDefaultProfileDetails () {
      return store.state.useDefaultProfileDetails
    }

    get isReplyMessagesEnabled () {
      return store.state.replyMessagesEnabled
    }

    get isDeleteMessagesEnabled () {
      return store.state.deleteMessagesEnabled
    }

    get isParticipantModerator () {
      return store.state.isParticipantModerator
    }

    get currentParticipantToken () {
      return store.state.currentParticipantToken
    }

    get isVoiceRecorderEnabled () {
      return store.state.voiceRecorderEnabled
    }

    get isWebSocketConnected () {
      return store.state.connected
    }

    get currentSecretKey () {
      return store.state.secretKey
    }

    get encryptionKey () {
      return CryptoJS.enc.Utf8.parse(this.currentSecretKey.substring(0, 32))
    }

    get iv () {
      return CryptoJS.enc.Utf8.parse(this.currentSecretKey.substring(0, 16))
    }

    formatDate (value: any): string {
      const today = moment().format('MMM DD YYYY')
      const formattedValue = moment(value).format('MMM DD YYYY')

      if (today === formattedValue) return 'Today'

      return moment(value).format('MMM DD YYYY')
    }

    addUnreadMessagesToConversation (conversations: Array<ObjectType>) {
      return conversations.map((conversation: ObjectType) => {
        if (typeof conversation.unread_messages === 'number' || typeof conversation.unread_messages === 'string') {
          return conversation
        }
        conversation.unread_messages = conversation.unread_messages[this.$user_token]?.unread_count || 0
        return conversation
      })
    }

    copyConversations (conversations: Array<ObjectType>): Array<ObjectType> {
      return conversations.map(conversation => ({ ...conversation }))
    }

    getContactName (sender_token: string): string {
      const index = this.$robin_users.findIndex((user) => user.userToken === sender_token) as number
      const user = this.$robin_users[index] as ObjectType
      return user ? user.userName : ''
    }

    showToast (message: string, type: string): void {
      if (this.toastMessages.get(message)) {
        this.toastMessages.set(message, false)
      } else {
        this.toastMessages.set(message, true)
        this.$toast.open({ message, type, position: 'bottom-left' })
      }
    }

    encrypt (message: ObjectType): string {
      const enc = CryptoJS.AES.encrypt(JSON.stringify(message), this.encryptionKey, {
        iv: this.iv as any,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.NoPadding
      })

      return enc.toString()
    }

    decrypt (message: string): string {
      const enc = CryptoJS.AES.decrypt(message, this.encryptionKey, {
        iv: this.iv as any,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.NoPadding
      })

      return enc.toString(CryptoJS.enc.Utf8)
    }
}
