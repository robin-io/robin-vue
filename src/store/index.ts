import Vue from 'vue'

interface State {
  connected: boolean;
  unsortedRegularConversations: Array<ObjectType>;
  regularConversations: Array<ObjectType>;
  archivedConversations: Array<ObjectType>;
  currentConversation: Record<string, any>;
  imagesToPreview: any[];
  imageSelected: number;
  isImageReplying: boolean;
  isPageLoading: boolean;
  isAuthenticated: boolean;
  selectMessagesOpen: boolean;
  conversationOpen: boolean;
  clearMessages: boolean;
  imagePreviewOpen: boolean;
  profileOpen: boolean;
  groupPromptOpen: boolean;
  currentParticipantToken: string;
  encryptionDetailsOpen: boolean;
  exitGroup: boolean;
  participantToken: string;
  removeParticipant: boolean;
  isParticipantModerator: boolean;
  currentAudioPlaying: number;
  forwardMessagesEnabled: boolean;
  deleteMessagesEnabled: boolean;
  archiveChatEnabled: boolean;
  createChatEnabled: boolean;
  replyMessagesEnabled: boolean;
  voiceRecorderEnabled: boolean;
  messageReactionViewEnabled: boolean;
  messageReactionDeleteEnabled: boolean;
  useDefaultProfileDetails: boolean;
  currentTheme: string;
  screenWidth: number;
  sideBarType: string;
  secretKey: string;
  toastMessages: Map<any, any>;
  resetCheckedState: boolean;
  moderatedWordFound: boolean;
  blockedWords: string[]
}

const state: State = {
  connected: false,
  unsortedRegularConversations: [],
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
  screenWidth: 0,
  sideBarType: 'primary',
  secretKey: '',
  toastMessages: new Map(),
  resetCheckedState: false,
  moderatedWordFound: false,
  blockedWords: []
}

const store = {
  state: Vue.observable(state),

  setState (key: string, val: any) {
    Vue.set(this.state, key, val)
  }
}

// add reactivity robin_users.
const robinUsers = Vue.observable({ robin_users: {} })

Object.defineProperty(Vue.prototype, '$robin_users', {
  get () {
    return robinUsers.robin_users
  },

  set (value) {
    robinUsers.robin_users = value
  }
})

export default store
