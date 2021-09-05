<template>
  <div class="robin-chat-list-container">
    <PrimaryChatList v-show="$conversations.length > 0 && sideBarType == 'primary'" :conversations="$conversations" @changesidebartype="changeSideBarType" />
    <NewChatList v-if="sideBarType == 'newchat'" @changesidebartype="changeSideBarType" />
    <NoChatList v-if="$conversations.length < 1 && sideBarType == 'primary'" @changesidebartype="changeSideBarType" />
    <NewGroupChatList v-if="sideBarType == 'newgroupchat'" @changesidebartype="changeSideBarType" />
    <ArchivedChatList v-if="sideBarType == 'archivedchat'" @changesidebartype="changeSideBarType" />
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

  created () {
    this.getUserToken()

    this.onGroupConversationCreated()
  }

  sideBarType = 'primary'
  conversations = [] as Array<any>

  changeSideBarType (val: string): void {
    this.sideBarType = val
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
      Vue.prototype.$conversations = this.conversations
      this.setPageLoading(false)
      console.log(this.$conversations)
      this.$forceUpdate()
    }
    console.log(res)
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
