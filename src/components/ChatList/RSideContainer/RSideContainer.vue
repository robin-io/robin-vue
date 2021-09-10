<template>
  <div class="robin-chat-list-container">
    <PrimaryChatList v-show="$conversations.length > 0" :conversations="regularConversations" @opennewchatmodal="openModal('slide-1', $event)" @openarchivedchatmodal="openModal('slide-3', $event)" @closemodal="closeModal('slide-1', $event)" />
    <NewChatList ref="slide-1" v-show="sideBarType == 'newchat'" @openmodal="openModal('slide-2', $event)" @closemodal="closeModal('slide-1', $event)"  />
    <NoChatList v-show="$conversations.length < 1" @openmodal="openModal('slide-1', $event)" />
    <NewGroupChatList ref="slide-2" v-show="sideBarType == 'newgroupchat'" @openmodal="openModal('slide-0', $event)" @closemodal="closeModal('slide-2', $event)"/>
    <ArchivedChatList ref="slide-3" v-show="sideBarType == 'archivedchat'" @closemodal="closeModal('slide-3', $event)" :conversations="archivedConversations" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { State, Mutation } from 'vuex-class'
import EventBus from '@/event-bus'
import { RootState } from '@/utils/types'
import PrimaryChatList from '../PrimaryChatList.vue'
import NewChatList from '../NewChatList.vue'
import NoChatList from '../NoChatList.vue'
import NewGroupChatList from '../NewGroupChatList.vue'
import ArchivedChatList from '../ArchivedChatList.vue'

const ComponentProps = Vue.extend({
  props: {
    user_token: {
      type: String,
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
  @State('isPageLoading') isPageLoading?: RootState
  @Mutation('setPageLoading') setPageLoading: any

  archivedConversations = [] as Array<any>
  regularConversations = [] as Array<any>

  created () {
    this.getUserToken()

    this.onGroupConversationCreated()
  }

  sideBarType = 'primary'
  conversations = [] as Array<any>

  openModal (refKey: string, type: string): void {
    if (type === 'primary') {
      this.sideBarType = type
    } else {
      // console.log(this.$refs, refKey, type)
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
      console.log(this.$refs, refKey, type)
      const popup = this.$refs[refKey] as any
      popup.$refs['popup-body'].classList.add('robin-slideOutLeft')

      window.setTimeout(() => {
        popup.$refs['popup-body'].classList.remove('robin-slideOutLeft')

        this.sideBarType = type
      }, 200)
    }
  }

  onGroupConversationCreated () {
    EventBus.$on('group-conversation-created', (conversation: object) => {
      Vue.prototype.$conversations.unshift(conversation)
    })
  }

  async getUserToken () {
    console.log(this.$robin)
    const res = await this.$robin.getUserToken({
      user_token: this.user_token
    })
    if (!res.error) {
      this.conversations = res.data.conversations == null ? [] : res.data.conversations
      Vue.prototype.$conversations = res.data.conversations == null ? [] : res.data.conversations
      this.getRegularConversations()
      this.getArchivedConversations()
      this.setPageLoading(false)
      console.log('getconversations -> ', this.$conversations)
      this.$forceUpdate()
    }
    console.log(res)
  }

  getArchivedConversations (): void {
    this.archivedConversations = this.$conversations.filter((user: any) => {
      if (!user.archived_for) return false
      return user.archived_for.every((item: string) => {
        return item === this.$user_token
      })
    })
  }

  getRegularConversations (): void {
    this.regularConversations = this.$conversations.filter((user: any) => {
      if (!user.archived_for) return true
      return false
    })
  }
}
</script>

<style scoped>
.robin-chat-list-container {
  position: relative;
  z-index: 4;
  flex-basis: 30%;
  max-width: 450px;
  height: 100%;
  box-shadow: 0px 2px 20px rgba(0, 104, 255, 0.06);
}
</style>
