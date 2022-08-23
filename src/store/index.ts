import {reactive} from 'vue-demi'

const state = {
  robin: null,
  conn: null,
  api_key: '',
  user_token: '',
  channel: '',
  conversations: [],
  robin_users: [],
  sender_name: '',
  logo: '',
  currentConversation: {},
  imagesToPreview: [],
  imageSelected: 0,
  isImageReplying: false,
  isPageLoading: true,
  isAuthenticated: false,
  selectMessagesOpen: false,
  conversationOpened: false,
  clearMessages: false,
  imagePreviewOpen: false,
  profileOpen: false,
  groupPromptOpen: false,
  currentParticipantToken: '',
  encryptionDetailsOpen: false,
  exitGroup: false,
  participantToken: '',
  removeParticipant: false,
  isParticipantModerator: false,
  currentAudioPlaying: 0,
  forwardMessagesEnabled: false,
  deleteMessagesEnabled: false,
  archiveChatEnabled: false,
  createChatEnabled: false,
  replyMessagesEnabled: false,
  voiceRecorderEnabled: false,
  messageReactionViewEnabled: false,
  messageReactionDeleteEnabled: false,
  useDefaultProfileDetails: false
} as Record<string, any>

const store = {
  state: reactive(state),

  setState (key: string, val: any) {
    this.state[key] = val
  }
}

export default store
