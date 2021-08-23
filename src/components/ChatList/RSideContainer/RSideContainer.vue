<template>
  <div class="robin-chat-list-container">
    <PrimaryChatList
      v-show="$conversations.length > 0 && sideBarType == 'primary'"
      :conversations="$conversations"
      @changesidebartype="changeSideBarType"
      @coversationopened="$emit('coversationopened')"
    />
    <NewChatList
      v-show="sideBarType == 'newchat'"
      @changesidebartype="changeSideBarType"
    />
    <NoChatList
      v-show="$conversations.length < 1 && sideBarType == 'primary'"
      @changesidebartype="changeSideBarType"
    />
    <NewGroupChatList
      v-show="sideBarType == 'newgroupchat'"
      @changesidebartype="changeSideBarType"
    />
    <ArchivedChatList
      v-show="sideBarType == 'archivedchat'"
      @changesidebartype="changeSideBarType"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { State, Mutation } from 'vuex-class'
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

  created() {
    this.getUserToken()
  }

  sideBarType = 'primary'
  conversations = []

  changeSideBarType(val: string): void {
    this.sideBarType = val
  }

  async getUserToken() {
    console.log(this.$robin)
    const res = await this.$robin.getUserToken({
      user_token: this.user_token
    })
    if (!res.error) {
      this.conversations =
        res.data.conversations == null ? [] : res.data.conversations
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
  z-index: 3;
  flex-basis: 30%;
  max-width: 450px;
  height: 100%;
  box-shadow: 0px 2px 20px rgba(0, 104, 255, 0.06);
}
</style>
