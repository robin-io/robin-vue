<template>
  <div class="robin-chat-list-container">
    <PrimaryChatList
      v-show="conversations.length > 0 || isPageLoading"
      @opennewchatmodal="openModal('slide-1', $event)"
      @openarchivedchatmodal="openModal('slide-3', $event)"
      @closemodal="closeModal('slide-1', $event)"
    >
      <template #chat-list-header>
        <slot name="chat-list-header"></slot>
      </template>
    </PrimaryChatList>

    <NewChatList
      :key="key + 1"
      ref="slide-1"
      v-show="sideBarType == 'newchat'"
      @openmodal="openModal('slide-2', $event)"
      @closemodal="closeModal('slide-1', $event)"
    />

    <NoChatList
      v-show="conversations.length < 1 && !isPageLoading"
      @opennewchatmodal="openModal('slide-1', $event)"
    >
      <template #chat-list-header>
        <slot name="chat-list-header"></slot>
      </template>
    </NoChatList>

    <NewGroupChat
      :key="key + 2"
      ref="slide-2"
      v-show="sideBarType == 'newgroup'"
      @openmodal="openModal('slide-3', $event)"
      @set-groupname="setGroupName($event)"
      @set-groupicon="setGroupIcon($event)"
      @closemodal="closeModal('slide-2', $event)"
      :group-name="groupName"
    />

    <NewGroupChatList
      :key="key + 3"
      ref="slide-3"
      v-show="sideBarType == 'newgroupchat'"
      :group-name="groupName"
      :group-icon="groupIcon"
      @openmodal="openModal('slide-0', $event)"
      @closemodal="closeModal('slide-3', $event)"
      @reset-groupname="resetGroupName()"
      @reset-groupicon="resetGroupIcon()"
    />

    <ArchivedChatList
      ref="slide-4"
      v-show="sideBarType == 'archivedchat'"
      @closemodal="closeModal('slide-4', $event)"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import EventBus from '@/event-bus'
import PrimaryChatList from '@/components/PrimaryChatList/PrimaryChatList.vue'
import NewChatList from '@/components/NewChatList/NewChatList.vue'
import NoChatList from '@/components/NoChatList/NoChatList.vue'
import NewGroupChat from '@/components/NewGroupChat/NewGroupChat.vue'
import NewGroupChatList from '@/components/NewGroupChatList/NewGroupChatList.vue'
import ArchivedChatList from '@/components/ArchivedChatList/ArchivedChatList.vue'

// eslint-disable-next-line
@Component<SideContainer>({
  name: 'SideContainer',
  components: {
    PrimaryChatList,
    NewChatList,
    NoChatList,
    NewGroupChat,
    NewGroupChatList,
    ArchivedChatList
  },
  watch: {
    $robin_users: {
      handler (val) {
        this.refresh()
      }
    }
  }
})
export default class SideContainer extends Vue {
  key = 0 as number
  searchText = '' as string

  sideBarType = 'primary'
  groupName = ''
  groupIcon = {}

  created () {
    this.showNewGroupModal()
  }

  get conversations () {
    return store.state.allConversations
  }

  get isPageLoading () {
    return store.state.isPageLoading
  }

  setGroupName (val: string) {
    this.groupName = val
  }

  resetGroupName () {
    this.groupName = ''
  }

  setGroupIcon (val: string) {
    this.groupIcon = val
  }

  resetGroupIcon () {
    this.groupIcon = {}
  }

  showNewGroupModal () {
    EventBus.$on('show.new.group', () => {
      this.openModal('slide-3', 'newgroupchat')
    })
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
      this.resetGroupName()
    } else {
      const popup = this.$refs[refKey] as any
      popup.$refs['popup-body'].classList.add('robin-slideOutLeft')

      window.setTimeout(() => {
        popup.$refs['popup-body'].classList.remove('robin-slideOutLeft')

        this.sideBarType = type
      }, 200)
    }
  }

  refresh (): void {
    this.key += 1
  }
}
</script>
