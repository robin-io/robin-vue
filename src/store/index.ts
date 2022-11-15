import Vue from 'vue'

interface State {
  allConversations:Array<ObjectType>,
  regularConversations: Array<ObjectType>,
  archivedConversations: Array<ObjectType>,
  currentConversation: Record<string, any>,
  imagesToPreview: any[],
  imageSelected: number,
  isImageReplying: boolean,
  isPageLoading: boolean,
  isAuthenticated: boolean,
  selectMessagesOpen: boolean,
  conversationOpen: boolean,
  clearMessages: boolean,
  imagePreviewOpen: boolean,
  profileOpen: boolean,
  groupPromptOpen: boolean,
  currentParticipantToken: string,
  encryptionDetailsOpen: boolean
  exitGroup: boolean,
  participantToken: string,
  removeParticipant: boolean,
  isParticipantModerator: boolean,
  currentAudioPlaying: number,
  forwardMessagesEnabled: boolean,
  deleteMessagesEnabled: boolean,
  archiveChatEnabled: boolean,
  createChatEnabled: boolean,
  replyMessagesEnabled: boolean,
  voiceRecorderEnabled: boolean,
  messageReactionViewEnabled: boolean,
  messageReactionDeleteEnabled: boolean,
  useDefaultProfileDetails: boolean,
  currentTheme: string,
  screenWidth: number,
}

const state: State = {
  allConversations: [],
  regularConversations: [],
  archivedConversations: [],
  currentConversation: {},
  imagesToPreview: [],
  imageSelected: 0,
  isImageReplying: false,
  isPageLoading: true,
  isAuthenticated: false,
  selectMessagesOpen: false,
  conversationOpen: false,
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
  useDefaultProfileDetails: false,
  currentTheme: 'light',
  screenWidth: 0
}

const store = {
  state: Vue.observable(state),

  setState (key: string, val: any) {
    Vue.set(this.state, key, val)
  }
}

export default store
