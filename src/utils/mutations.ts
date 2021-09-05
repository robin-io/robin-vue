import { MutationTree } from 'vuex'
import { RootState } from './types'

export const mutations: MutationTree<RootState> = {
  setPageLoading (state, payload: boolean) {
    state.isPageLoading = payload
  }
}
