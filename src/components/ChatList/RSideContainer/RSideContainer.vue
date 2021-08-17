<template>
  <div class="robin-chat-list-container">
    <PrimaryChatList
      v-show="sideBarType == 'primary'"
      @changesidebartype="changeSideBarType"
    />
    <NewChatList
      v-show="sideBarType == 'newchat'"
      @changesidebartype="changeSideBarType"
    />
    <NoChatList
      v-show="sideBarType == 'nochat'"
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
import PrimaryChatList from '../PrimaryChatList.vue'
import NewChatList from '../NewChatList.vue'
import NoChatList from '../NoChatList.vue'
import NewGroupChatList from '../NewGroupChatList.vue'
import ArchivedChatList from '../ArchivedChatList.vue'

export default Vue.extend({
  name: 'RSideContainer',
  components: {
    PrimaryChatList,
    NewChatList,
    NoChatList,
    NewGroupChatList,
    ArchivedChatList
  },
  data: () => ({
    sideBarType: 'primary'
  }),
  methods: {
    changeSideBarType(val: string): void {
      this.sideBarType = val
    }
  }
})
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
