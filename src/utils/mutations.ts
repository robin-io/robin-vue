import { MutationTree } from 'vuex'
import { RootState } from './types'

export const mutations: MutationTree<RootState> = {
  setPageLoading (state, payload: boolean) {
    state.isPageLoading = payload
  },
  setSelectMessagesOpen (state, payload: boolean) {
    state.selectMessagesOpen = payload
  },
  setClearMessages (state, payload: boolean) {
    state.clearMessages = payload
  },
  setImagePreviewOpen (state, payload: boolean) {
    state.imagePreviewOpen = payload
  }
}
