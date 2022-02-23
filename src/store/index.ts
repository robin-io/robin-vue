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
  clearMessages: boolean,
  imagePreviewOpen: boolean,
  messageProfileOpen: boolean,
  groupPromptOpen: boolean,
  currentParticipantToken: string,
  encryptionDetailsOpen: boolean
}

const state: State = {
  currentConversation: {},
  imagesToPreview: [],
  imageSelected: 0,
  isImageReplying: false,
  isPageLoading: true,
  isAuthenticated: false,
  selectMessagesOpen: false,
  clearMessages: false,
  imagePreviewOpen: false,
  messageProfileOpen: false,
  groupPromptOpen: false,
  currentParticipantToken: '',
  encryptionDetailsOpen: false
}

const store = {
  state: Vue.observable(state),

  setState (key: string, val: any) {
    Vue.set(this.state, key, val)
  }
}

export default store
