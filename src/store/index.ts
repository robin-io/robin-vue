import Vue from 'vue'

interface Conversation {
  [key:string]: any
}

interface State {
  users: any[],
  currentConversation: Conversation,
  imagesToPreview: any[],
  imageSelected: number,
  isImageReplying: boolean,
  isPageLoading: boolean
  isAuthenticated: boolean
  selectMessagesOpen: boolean
  clearMessages: boolean
  imagePreviewOpen: boolean
  viewMessageProfileOpen: boolean
}

const state: State = {
  users: [],
  currentConversation: {},
  imagesToPreview: [],
  imageSelected: 0,
  isImageReplying: false,
  isPageLoading: true,
  isAuthenticated: false,
  selectMessagesOpen: false,
  clearMessages: false,
  imagePreviewOpen: false,
  viewMessageProfileOpen: false
}

const store = {
  state: Vue.observable(state),

  setState (key: string, val: any) {
    Vue.set(this.state, key, val)
  }
}

export default store
