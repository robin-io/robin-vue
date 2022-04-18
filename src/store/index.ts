import Vue from 'vue'

interface Conversation {
  [key:string]: any
}

interface State {
  currentConversation: Conversation,
  imagesToPreview: any[],
  imageSelected: number,
  isImageReplying: boolean,
  isPageLoading: boolean,
  isAuthenticated: boolean,
  selectMessagesOpen: boolean,
  conversationOpened: boolean,
  clearMessages: boolean,
  imagePreviewOpen: boolean,
  profileOpen: boolean,
  groupPromptOpen: boolean,
  currentParticipantToken: string,
  encryptionDetailsOpen: boolean
  exitGroup: boolean,
  participantToken: string,
  removeParticipant: boolean,
  isParticipantModerator: boolean
}

const state: State = {
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
  isParticipantModerator: false
}

const store = {
  state: Vue.observable(state),

  setState (key: string, val: any) {
    Vue.set(this.state, key, val)
  }
}

export default store
