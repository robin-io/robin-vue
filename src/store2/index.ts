import Vue from 'vue'

interface State {
  users: any[]
  isPageLoading: boolean
  isAuthenticated: boolean
  selectMessagesOpen: boolean
  clearMessages: boolean
  imagePreviewOpen: boolean
}

const state: State = {
  users: [],
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
