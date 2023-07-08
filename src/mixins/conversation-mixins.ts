import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import { formatTimestamp, isSameDay } from '@/utils/date'
import CryptoJS from 'crypto-js'
import { Colors } from '@/utils/constants'

@Component({
  name: 'ConversationMixins'
})
export default class ConversationMixin extends Vue {
  offlineMessages: ObjectType | undefined;

  get unsortedRegularConversations () {
    return store.state.unsortedRegularConversations
  }

  get generalConversations () {
    return [...this.regularConversations, ...this.archivedConversations]
  }

  get regularConversations () {
    const sortedConversations = this.unsortedRegularConversations.sort((a, b) => {
      const dateA = new Date(a.last_message?.timestamp ?? a.updated_at).getTime()
      const dateB = new Date(b.last_message?.timestamp ?? b.updated_at).getTime()

      return dateB - dateA
    })

    const regularConversations = this.getRegularConversations(sortedConversations)

    return this.addUnreadMessagesToConversation(regularConversations)
  }

  get isPageLoading () {
    return store.state.isPageLoading
  }

  get archivedConversations () {
    return store.state.archivedConversations.sort((a, b) => {
      const dateA = new Date(a.last_message?.timestamp ?? a.updated_at).getTime()
      const dateB = new Date(b.last_message?.timestamp ?? b.updated_at).getTime()

      return dateB - dateA
    })
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

  get screenWidth () {
    return store.state.screenWidth
  }

  get isMessageReactionViewEnabled () {
    return store.state.messageReactionViewEnabled
  }

  get groupnameColors () {
    const userColors = {} as ObjectType

    for (const user of this.$robin_users) {
      userColors[user.user_token] = Colors[Math.floor(Math.random() * Colors.length)]
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

  get shouldResetCheckedState () {
    return store.state.resetCheckedState
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

  get isToastOpen () {
    return this.toastMessages.size > 0
  }

  get toastMessages () {
    return store.state.toastMessages
  }

  getRegularConversations (conversations: Array<ObjectType>) {
    return conversations.filter((conversation: ObjectType) => {
      if (!conversation.archived_for || conversation.archived_for.length === 0) return true
      return !conversation.archived_for.includes(this.$user_token)
    })
  }

  formatDate (value: string): string {
    const today = new Date()
    const time = value
    const formattedValue = new Date(time)

    if (isSameDay(today, formattedValue)) return 'Today'

    return formatTimestamp(new Date(time))
  }

  getRecentMessageTime (time: string): string {
    return formatTimestamp(new Date(time))
  }

  /**
   * Function to get a user token from conversation object from receiver/sender token that does not belong to current auth user
   * @param conversation
   * @returns a user token string
   */
  getUserTokenFromConversation (conversation: ObjectType): string {
    if (conversation.receiver_token === this.$user_token) {
      return conversation.sender_token
    }
    return conversation.receiver_token
  }

  addUnreadMessagesToConversation (conversations: Array<ObjectType>) {
    return conversations.map((conversation: ObjectType) => {
      if (
        typeof conversation.unread_messages === 'number' ||
        typeof conversation.unread_messages === 'string'
      ) {
        return conversation
      }

      if (!conversation.unread_messages) {
        conversation.unread_messages = 0
        return conversation
      }

      conversation.unread_messages =
        conversation.unread_messages[this.$user_token]?.unread_count || 0
      return conversation
    })
  }

  copyConversations (conversations: Array<ObjectType>): Array<ObjectType> {
    return conversations.map((conversation) => {
      if (Array.isArray(conversation)) {
        return [...conversation]
      }
      return { ...conversation }
    })
  }

  getContactName (sender_token: string): string {
    const index = this.$robin_users.findIndex((user) => user.user_token === sender_token) as number
    const user = this.$robin_users[index] as ObjectType
    return user ? user.username : ''
  }

  showToast (message: string, type: string): void {
    const toastMap = new Map(Array.from(this.toastMessages))
    if (!toastMap.has(message)) {
      toastMap.set(message, type)
      store.setState('toastMessages', toastMap)
    }
  }

  closeToast (message: string): void {
    const toastMap = new Map(this.toastMessages.entries())
    if (toastMap.has(message)) {
      toastMap.delete(message)
      store.setState('toastMessages', toastMap)
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
