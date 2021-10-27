<template>
  <div class="robin-chat-list-container">
    <PrimaryChatList v-show="$conversations.length > 0 || isPageLoading" :key="key" @search="searchedData($event)" :regular-conversations="regularConversations" @opennewchatmodal="openModal('slide-1', $event)" @openarchivedchatmodal="openModal('slide-3', $event)" @closemodal="closeModal('slide-1', $event)" @refresh="refresh" />
    <NewChatList ref="slide-1" v-show="sideBarType == 'newchat'" @openmodal="openModal('slide-2', $event)" @closemodal="closeModal('slide-1', $event)" />
    <NoChatList v-show="$conversations.length < 1 && !isPageLoading" @openmodal="openModal('slide-1', $event)" />
    <NewGroupChatList ref="slide-2" v-show="sideBarType == 'newgroupchat'" @openmodal="openModal('slide-0', $event)" @closemodal="closeModal('slide-2', $event)" />
    <ArchivedChatList ref="slide-3" v-show="sideBarType == 'archivedchat'" @closemodal="closeModal('slide-3', $event)" :archived-conversations="$archivedConversations" :key="key + 1" @refresh="refresh" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
// import { State, Mutation } from 'vuex-class'
// import { RootState } from '@/store/types'
import store from '../../../store/index'
import EventBus from '@/event-bus'
import PrimaryChatList from '../PrimaryChatList.vue'
import NewChatList from '../NewChatList.vue'
import NoChatList from '../NoChatList.vue'
import NewGroupChatList from '../NewGroupChatList.vue'
import ArchivedChatList from '../ArchivedChatList.vue'

const ComponentProps = Vue.extend({
  props: {
    user_token: {
      type: String as PropType<string>,
      default: () => ''
    }
  }
})

@Component({
  name: 'RSideContainer',
  components: {
    PrimaryChatList,
    NewChatList,
    NoChatList,
    NewGroupChatList,
    ArchivedChatList
  }
})
export default class RSideContainer extends ComponentProps {
  // @State('isPageLoading') isPageLoading?: RootState
  // @Mutation('setPageLoading') setPageLoading: any

  key = 0 as number

  regularConversations = [] as Array<any>
  sideBarType = 'primary'
  conversations = [] as Array<any>

  created () {
    this.getUserToken()

    this.onGroupConversationCreated()
    this.onNewConversationCreated()
    this.handleAddRegularConversation()
    this.handleRemoveRegularConversation()
    this.handleAddArchivedConversation()
    this.handleRemoveArchivedConversation()
  }

  get isPageLoading () {
    return store.state.isPageLoading
  }

  openModal (refKey: string, type: string): void {
    if (type === 'primary') {
      this.sideBarType = type
    } else {
      const popup = this.$refs[refKey] as any

      window.setTimeout(() => {
        popup.$refs['popup-body'].classList.add('robin-slideInLeft')

        this.sideBarType = type
      }, 200)
    }
  }

  closeModal (refKey: string = 'slide-1', type: string): void {
    if (type === 'primary' && refKey === 'slide-0') {
      this.sideBarType = type
    } else {
      // console.log(this.$refs, refKey, type)
      const popup = this.$refs[refKey] as any
      popup.$refs['popup-body'].classList.add('robin-slideOutLeft')

      window.setTimeout(() => {
        popup.$refs['popup-body'].classList.remove('robin-slideOutLeft')

        this.sideBarType = type
      }, 200)
    }
  }

  onGroupConversationCreated () {
    EventBus.$on('new-group.conversation', (conversation: any) => {
      conversation.participants.every((participant: any) => {
        if (participant.user_token === this.$user_token) {
          this.$regularConversations.unshift(conversation)
          this.regularConversations.unshift(conversation)

          return false
        }

        return true
      })
    })
  }

  onNewConversationCreated () {
    EventBus.$on('new.conversation', (conversation: any) => {
      if (conversation.sender_token === this.$user_token || conversation.receiver_token === this.$user_token) {
        // EventBus.$emit('regular-conversation.delete', conversation)
        EventBus.$emit('regular-conversation.add', conversation)
      }
    })
  }

  handleAddRegularConversation () {
    EventBus.$on('regular-conversation.add', (conversation: any) => {
      this.$regularConversations.unshift(conversation)
      this.regularConversations.unshift(conversation)
    })
  }

  handleRemoveRegularConversation () {
    EventBus.$on('regular-conversation.delete', (conversation: any) => {
      const index = this.$regularConversations.findIndex((item) => item._id === conversation._id)
      this.$regularConversations.splice(index, 1)
      this.regularConversations.splice(index, 1)
    })
  }

  handleRemoveArchivedConversation () {
    EventBus.$on('archived-conversation.delete', (conversation: any) => {
      const index = this.$archivedConversations.findIndex((item) => item._id === conversation._id)
      this.$archivedConversations.splice(index, 1)
    })
  }

  handleAddArchivedConversation () {
    EventBus.$on('archived-conversation.add', (conversation: any) => {
      this.$archivedConversations.unshift(conversation)
    })
  }

  async getUserToken () {
    // console.log(this.$robin)
    const res = await this.$robin.getUserToken({
      user_token: this.user_token
    })
    if (!res.error) {
      this.conversations = res.data.conversations == null ? [] : res.data.conversations
      Vue.prototype.$conversations = res.data.conversations == null ? [] : res.data.conversations
      Vue.prototype.$regularConversations = this.getRegularConversations()
      Vue.prototype.$archivedConversations = this.getArchivedConversations()
      this.regularConversations = this.getRegularConversations()
      store.setState('isPageLoading', false)
      // console.log('getconversations -> ', this.$conversations)
      this.$forceUpdate()
    }
    // console.log(res)
  }

  getArchivedConversations (): Array<any> {
    return this.$conversations.filter((user: any) => {
      if (!user.archived_for) return false
      return user.archived_for.includes(this.$user_token)
    })
  }

  getRegularConversations (): Array<any> {
    return this.$conversations.filter((user: any) => {
      if (!user.archived_for || user.archived_for.length === 0) return true
      return !user.archived_for.includes(this.$user_token)
    })
  }

  refresh (): void {
    this.key += 1
  }

  searchedData (event: any): void {
    if (event.text.trim() !== '') {
      this.regularConversations = event.data
    } else {
      this.regularConversations = this.getRegularConversations()
    }
  }
}
</script>

<style scoped>
.robin-chat-list-container {
  position: relative;
  flex-basis: 30%;
  max-width: 450px;
  height: 100%;
  box-shadow: 0px 2px 20px rgba(0, 104, 255, 0.06);
}

@media (max-width: 1200px) {
  .robin-chat-list-container {
    flex-basis: 100%;
    max-width: initial;
  }
}
</style>
