import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import { mutations } from './mutations'
import { RootState } from './types'

Vue.use(Vuex)

const store: StoreOptions<RootState> = {
  state: {
    isPageLoading: true,
    selectMessagesOpen: false,
    clearMessages: false
  },
  mutations
}

export default new Vuex.Store<RootState>(store)
