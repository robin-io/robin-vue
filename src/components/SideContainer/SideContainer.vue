<template>
  <div class="robin-chat-list-container">
    <PrimaryChatList
      v-show="$conversations.length > 0 || isPageLoading"
      :key="key"
      @search="searchedData($event)"
      :regular-conversations="regularConversations"
      :archived-conversations="archivedConversations"
      @opennewchatmodal="openModal('slide-1', $event)"
      @openarchivedchatmodal="openModal('slide-3', $event)"
      @closemodal="closeModal('slide-1', $event)"
      @refresh="refresh"
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
      v-show="$conversations.length < 1 && !isPageLoading"
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
      :archived-conversations="archivedConversations"
      :key="key + 4"
      @refresh="refresh"
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

  regularConversations = [] as Array<any>
  archivedConversations = [] as Array<any>
  sideBarType = 'primary'
  conversations = [] as Array<any>
  groupName = ''
  groupIcon = {}

  created () {
    this.getUserToken()

    this.onGroupConversationCreated()
    this.onNewConversationCreated()
    this.handleAddRegularConversation()
    this.handleRemoveRegularConversation()
    this.handleAddArchivedConversation()
    this.handleRemoveArchivedConversation()
    this.handleMarkAsRead()
    this.handleMarkAsUnread()
    this.showNewGroupModal()
    this.handleMessageForward()
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
      if (
        conversation.sender_token === this.$user_token ||
        conversation.receiver_token === this.$user_token
      ) {
        EventBus.$emit('regular-conversation.add', conversation)
      }
    })
  }

  handleAddRegularConversation () {
    EventBus.$on('regular-conversation.add', (conversation: any) => {
      const index = this.$regularConversations.findIndex((item) => item._id === conversation._id)

      if (index === -1) {
        this.$regularConversations.unshift(conversation)
        this.regularConversations.unshift(conversation)
      }
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

      this.archivedConversations.splice(index, 1)
      this.$archivedConversations.splice(index, 1)
    })
  }

  // handleRemoveGroupParticipant () {
  //   EventBus.$on('participant.left.group', (user: any) => {
  //     const index = this.$regularConversations.findIndex((item) => item._id === user.conversation_id)
  //     const participantIndex = this.$regularConversations[index].participants.findIndex((participant: any) => participant.user_token === user.user_token)

  //     this.$regularConversations[index].participants.splice(participantIndex, 1)
  //     this.regularConversations[index].participants.splice(participantIndex, 1)
  //   })
  // }

  handleAddArchivedConversation () {
    EventBus.$on('archived-conversation.add', (conversation: any) => {
      this.archivedConversations.unshift(conversation)
      this.$archivedConversations.unshift(conversation)
    })
  }

  async getUserToken () {
    const res = await this.$robin.getUserToken({
      user_token: this.$user_token
    })

    if (!res.error) {
      this.conversations = res.data.conversations == null ? [] : res.data.conversations
      Vue.prototype.$conversations = res.data.conversations == null ? [] : res.data.conversations

      const regularConversations = this.getRegularConversations() as Array<Record<string, any>>
      const archivedConversations = this.getArchivedConversations() as Array<Record<string, any>>

      Vue.prototype.$regularConversations = [...regularConversations]
      Vue.prototype.$archivedConversations = [...archivedConversations]
      this.regularConversations = [...regularConversations]
      this.archivedConversations = [...archivedConversations]
      store.setState('isPageLoading', false)
      this.$forceUpdate()
    }
  }

  getArchivedConversations (): Array<any> {
    return this.$conversations.filter((user: any) => {
      if (!user.archived_for) return false
      return user.archived_for.includes(this.$user_token)
    })
  }

  getRegularConversations () {
    const regularConversations = this.$conversations.filter((user: any) => {
      if (!user.archived_for || user.archived_for.length === 0) return true
      return !user.archived_for.includes(this.$user_token)
    })

    return this.addUnreadMessagesToConversation(regularConversations)
  }

  addUnreadMessagesToConversation (conversations: any): Array<any> {
    const data = conversations.map((conversation: any) => {
      for (const key in conversation.unread_messages) {
        if (key === this.$user_token) {
          conversation.unread_messages = conversation.unread_messages[key].unread_count
        } else {
          conversation.unread_messages = 0
        }
      }

      return conversation
    })

    return data
  }

  async getConversationMessages (id: string): Promise<Array<any>> {
    const res = await this.$robin.getConversationMessages(id, this.$user_token)

    if (res && !res.error) {
      return res.data
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }

    return []
  }

  handleMarkAsRead () {
    EventBus.$on('mark-as-read', (conversation: any) => {
      if (conversation) {
        if (!conversation.archived_for || conversation.archived_for.length === 0) {
          const index = this.$regularConversations.findIndex(
            (item) => item._id === conversation._id
          )

          if (this.regularConversations[index]) {
            this.regularConversations[index].unread_messages = 0
            this.$regularConversations[index].unread_messages = 0
          }
        }
      }
    })
  }

  handleMarkAsUnread () {
    EventBus.$on('mark-as-unread', (conversation: any) => {
      if (conversation) {
        if (!conversation.archived_for || conversation.archived_for.length === 0) {
          const index = this.$regularConversations.findIndex(
            (item) => item._id === conversation._id
          )

          if (this.regularConversations[index]) {
            this.$regularConversations[index].unread_messages += 1
          }
        }
      }
    })

    EventBus.$on('mark-as-unread.modified', (conversation: any) => {
      if (conversation) {
        if (!conversation.archived_for || conversation.archived_for.length === 0) {
          const index = this.$regularConversations.findIndex(
            (item) => item._id === conversation._id
          )

          if (this.regularConversations[index]) {
            this.regularConversations[index].unread_messages = 'marked'
            this.$regularConversations[index].unread_messages = 'marked'
          }
        }
      }
    })
  }

  handleMessageForward (): void {
    EventBus.$on('message.forward', (messages: any) => {
      // (messages)
      messages.forEach((msg: any) => {
        this.conversations.forEach((conversation: any, index: any) => {
          if (conversation._id === msg.conversation_id) {
            msg.content.timestamp = new Date()
            this.conversations[index].last_message = msg.content
            EventBus.$emit('regular-conversation.delete', this.conversations[index])
            EventBus.$emit('regular-conversation.add', this.conversations[index])
          }
        })
      })
    })
  }

  refresh (): void {
    this.key += 1
  }

  searchedData (event: any): void {
    this.searchText = event.text.trim()

    if (event.text.trim() !== '') {
      this.regularConversations = event.data
    } else {
      this.regularConversations = this.getRegularConversations()
      this.refresh()
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
  border-right: 1px solid var(--rb-color6);
  overflow-y: hidden;
  background-color: inherit;
}

@media (min-width: 1200px) {
  .robin-chat-list-container {
    overflow-y: auto;
  }
}

@media (max-width: 1200px) {
  .robin-chat-list-container {
    flex-basis: 100%;
    max-width: initial;
  }
}
</style>
