import Vue from 'vue'

interface Conversation {
  [key:string]: any
}

interface State {
  users: any[],
  currentConversation: Conversation,
  imagesToPreview: any[],
  isPageLoading: boolean
  isAuthenticated: boolean
  selectMessagesOpen: boolean
  clearMessages: boolean
  imagePreviewOpen: boolean
}

const state: State = {
  users: [],
  currentConversation: {},
  imagesToPreview: [],
  isPageLoading: true,
  isAuthenticated: false,
  selectMessagesOpen: false,
  clearMessages: false,
  imagePreviewOpen: false
}

const store = {
  state: Vue.observable(state),

  setState (key: string, val: any) {
    Vue.set(this.state, key, val)
  }
}

export default store
