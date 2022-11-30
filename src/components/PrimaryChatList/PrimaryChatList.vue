<template>
  <div class="robin-primary-chat-list-container">
    <header class="robin-header">
      <img
        v-if="$logo === ''"
        :src="assets[currentTheme === 'light' ? 'logo' : 'logo_dark']"
        alt="logo"
      />
      <img v-else class="custom" :src="$logo" alt="logo" />

      <div class="robin-wrapper">
        <icon-button
          name="edit"
          @edit="openEdit()"
          emit="edit"
          :to-emit="true"
          :to-click-away="false"
          :color="'#fff'"
          v-if="isCreateChatEnabled"
        />
        <slot name="chat-list-header"></slot>
      </div>
    </header>

    <div class="robin-wrapper robin-flex robin-w-100 robin-pl-16 robin-pr-16 robin-pb-16">
      <search-bar @user-typing="searchConversation($event)" :loading="isLoading" :key="key" />
      <icon-button
        class="robin-ml-4"
        name="filter"
        @filter="filterConversationsByUnread()"
        color="#8696a0"
        :active="filterActive"
        emit="filter"
        :to-emit="true"
        :to-click-away="false"
      />
    </div>

    <custom-button
      class="robin-wrapper robin-pl-16 robin-pr-16 robin-flex robin-flex-space-between robin-w-100 robin-pt-16 robin-pb-12"
      @archived="openArchivedChat()"
      v-if="isArchiveChatEnabled"
    >
      <div class="robin-flex robin-flex-align-center" v-show="archivedConversations.length > 0">
        <svg-icon name="mailbox" color="#15AE73" />

        <content class="robin-ml-6" font-weight="400" color="#15AE73"> Archived Chats </content>
      </div>

      <message-content
        font-weight="400"
        color="#15AE73"
        v-show="archivedConversations.length > 0"
        data-testid="archived-conversation-count"
      >
        {{archivedConversations.length }}
      </message-content>
    </custom-button>

    <div
      class="robin-wrapper robin-card-container robin-flex robin-flex-column"
      ref="conversations-wrapper"
      @scroll="handleInfiniteScroll"
      :class="{ 'robin-come-down': screenWidth > 1200 }"
    >
      <chat-list-card
        v-for="(item, index) in regularConversations"
        :key="'conversation-' + index"
        :index="index"
        :item="item"
        :type="1"
        conversation-type="primary"
        @open-conversation="openConversation(item)"
        @open-modal="openModal"
        @close-modal="closeModal"
      />

      <div v-show="isPageLoading" class="robin-spinner"></div>
    </div>

    <chat-list-pop-up
      v-if="regularConversations[conversationIndex]"
      :conversation="regularConversations[conversationIndex]"
      :is-archived="false"
      ref="chat-list-popup"
      @archive-chat="archiveChat"
      @delete-conversation="handleDeleteConversation"
      @mark-as-read="markReadManaully"
      @mark-as-unread="markUnreadManually"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import moment from 'moment'
import Component from 'vue-class-component'
import store from '@/store/index'
import EventBus from '@/event-bus'
import Content from '../Content/Content.vue'
import IconButton from '../IconButton/IconButton.vue'
import SearchBar from '../SearchBar/SearchBar.vue'
import SvgIcon from '../SvgIcon/SvgIcon.vue'
import Button from '../Button/Button.vue'
import Mention from '../Mention/Mention.vue'
import ChatListPopUp from '../ChatListPopUp/ChatListPopUp.vue'
import ChatListCard from '../ChatListCard/ChatListCard.vue'
import assets from '@/utils/assets.json'

// eslint-disable-next-line
@Component<PrimaryChatList>({
  name: 'PrimaryChatList',
  components: {
    'message-content': Content,
    IconButton,
    SvgIcon,
    SearchBar,
    'custom-button': Button,
    Mention,
    ChatListPopUp,
    ChatListCard
  }
})
export default class PrimaryChatList extends Vue {
  regularConversations = [] as Array<ObjectType>
  allConversations = [] as Array<ObjectType>
  conversationIndex = 0
  scroll = false as boolean
  isLoading = false as boolean
  key = 0 as number
  filterActive = false
  throttleTimer = false
  currentPage = 1
  pageCount = 0
  updateCnt = 0

  created () {
    this.getConversations()
    this.onGroupIconUpdate()
    this.handleMarkAsRead()
    this.handleMarkAsUnread()
    this.handleAddRegularConversation()
    this.handleRemoveRegularConversation()
    this.onGroupConversationCreated()
    this.handleMessageForward()
    this.onNewConversationCreated()
    this.onGroupConversationCreated()
  }

  get isPageLoading () {
    return store.state.isPageLoading
  }

  get archivedConversations () {
    return store.state.archivedConversations
  }

  get currentConversation () {
    return store.state.currentConversation
  }

  get isCreateChatEnabled () {
    return store.state.createChatEnabled
  }

  get isArchiveChatEnabled () {
    return store.state.archiveChatEnabled
  }

  get assets () {
    return assets
  }

  get currentTheme () {
    return store.state.currentTheme
  }

  get screenWidth () {
    return store.state.screenWidth
  }

  filterConversationsByUnread () {
    this.filterActive = !this.filterActive

    if (this.filterActive) {
      this.regularConversations = [
        ...this.regularConversations.filter(
          (conversation) =>
            conversation.unread_messages > 0 || conversation.unread_messages === 'marked'
        )
      ]
    } else {
      this.regularConversations = store.state.regularConversations as Array<ObjectType>
    }
  }

  onGroupIconUpdate (): void {
    EventBus.$on('group.icon.update', (conversation: ObjectType) => {
      const index = this.regularConversations.findIndex((item) => item._id === conversation._id)
      const data = { ...this.regularConversations[index] }
      data.group_icon = conversation.group_icon
      this.regularConversations.splice(index, 1, data)
      store.setState('regularConversations', [...this.regularConversations])
    })
  }

  openConversation (conversation: ObjectType): void {
    store.setState('imagePreviewOpen', false)
    store.setState('currentConversation', {})
    // store.setState('conversationOpen', false)
    store.setState('currentConversation', conversation)

    this.$nextTick(() => {
      EventBus.$emit('open-conversation')
      EventBus.$emit('conversation-opened', conversation)
    })
  }

  formatRecentMessageTime (time: string): string {
    const datetime = moment(time)

    return datetime.calendar(null, {
      sameDay: function () {
        return '[' + datetime.fromNow() + ']'
      },
      lastDay: function () {
        return '[' + datetime.fromNow() + ']'
      },
      lastWeek: function () {
        return '[' + datetime.fromNow() + ']'
      },
      sameElse: 'DD/MM/YYYY'
    })
  }

  openModal (index: number) {
    this.conversationIndex = index
    const chatEl = document.getElementById(`conversation-${this.conversationIndex}`) as HTMLElement
    const chatListPopupEl = (this.$refs['chat-list-popup'] as Vue).$el as HTMLElement
    const lastThreeInArray = index >= this.regularConversations.length - 3

    if (chatListPopupEl.style.display === 'block') chatListPopupEl.style.display = 'none'

    if (lastThreeInArray && this.scroll) {
      chatListPopupEl.style.top = `${chatEl.getBoundingClientRect().top - 40}px`
    } else {
      chatListPopupEl.style.top = `${chatEl.getBoundingClientRect().top + 50}px`
    }

    if (this.screenWidth >= 1200) {
      chatListPopupEl.style.left = `${chatEl.getBoundingClientRect().right - 80}px`
    } else {
      chatListPopupEl.style.left = 'initial'
    }

    chatListPopupEl.style.display = 'block'
  }

  closeModal (index: number) {
    const chatListPopupEl = (this.$refs['chat-list-popup'] as Vue).$el as HTMLElement

    if (this.conversationIndex === index) {
      chatListPopupEl.classList.remove('robin-zoomIn')
      chatListPopupEl.classList.add('robin-zoomOut')

      window.setTimeout(() => {
        chatListPopupEl.style.display = 'none'
        chatListPopupEl.classList.add('robin-zoomIn')
        chatListPopupEl.classList.remove('robin-zoomOut')
      }, 300)
    }
  }

  async archiveChat (): Promise<void> {
    const conversation = this.regularConversations[this.conversationIndex] as ObjectType
    const res = await this.$robin.archiveConversation(conversation._id, this.$user_token)

    if (!res.error) {
      EventBus.$emit('regular-conversation.delete', conversation)
      EventBus.$emit('archived-conversation.add', conversation)
      this.$toast.open({
        message: 'Conversation archived.',
        type: 'success',
        position: 'bottom-left'
      })
      this.$emit('refresh')
    }
  }

  searchConversation (searchText: string) {
    let searchData = [] as Array<ObjectType>
    this.isLoading = true
    // eslint-disable-next-line
    const data = this.regularConversations.filter((obj) => {
      let stopSearch = false
      Object.values(obj).forEach((val) => {
        const filter = String(val).toLowerCase().includes(searchText.toLowerCase())
        if (filter) {
          stopSearch = true
        }
      })
      if (stopSearch) {
        return obj
      }
    })

    searchData = [...data]
    this.searchedData({
      text: searchText,
      data: searchData
    })
    setTimeout(() => {
      this.isLoading = false
    }, 300)
  }

  openEdit (): void {
    this.$emit('opennewchatmodal', 'newchat')
    setTimeout(() => {
      // this.refresh()
    }, 300)
  }

  openArchivedChat (): void {
    this.$emit('openarchivedchatmodal', 'archivedchat')
    setTimeout(() => {
      // this.refresh()
    }, 300)
  }

  refresh (): void {
    this.key += 1
  }

  throttleConversations (callback: () => void, time: number) {
    if (this.throttleTimer) return

    this.throttleTimer = true

    setTimeout(() => {
      callback()
      this.throttleTimer = false
    }, time)
  }

  handleInfiniteScroll () {
    this.scroll = true
    const wrapper = this.$refs['conversations-wrapper'] as HTMLElement

    this.throttleConversations(() => {
      if (this.currentPage < this.pageCount) {
        store.setState('isPageLoading', true)
        const scrollSpaceLeft = Math.floor(wrapper.scrollHeight - wrapper.clientHeight)
        const endOfScroll = Math.floor(wrapper.scrollTop) >= scrollSpaceLeft

        if (endOfScroll) {
          this.currentPage += 1
          this.paginateConversations(this.currentPage)
        }
      }
    }, 1500)
  }

  async getConversations () {
    const res = await this.$robin.getUserToken(
      {
        user_token: this.$user_token
      },
      10,
      this.currentPage
    )

    if (!res.error) {
      const conversations = res.data.paginated_conversations.conversations == null
        ? []
        : res.data.paginated_conversations.conversations

      this.pageCount = res.data.paginated_conversations.pagination.pagination.totalPage

      this.allConversations = [...conversations]
      store.setState('allConversations', this.allConversations)

      const regularConversations = this.getRegularConversations(this.allConversations) as Array<
        Record<string, any>
      >

      this.regularConversations = [...regularConversations]

      store.setState('regularConversations', [...regularConversations])
      store.setState('isPageLoading', false)
    }
  }

  async paginateConversations (page = 1) {
    const res = await this.$robin.getUserToken(
      {
        user_token: this.$user_token
      },
      10,
      page
    )

    if (!res.error) {
      const conversations = res.data.paginated_conversations.conversations == null
        ? []
        : res.data.paginated_conversations.conversations

      this.allConversations = [...this.allConversations, ...conversations]
      store.setState('allConversations', this.allConversations)

      const regularConversations = this.getRegularConversations(this.allConversations) as Array<
        Record<string, any>
      >

      this.regularConversations = [...regularConversations]

      store.setState('regularConversations', [...regularConversations])
      store.setState('isPageLoading', false)
    }
  }

  handleAddRegularConversation () {
    EventBus.$on('regular-conversation.add', (conversation: any) => {
      const index = this.regularConversations.findIndex((item) => item._id === conversation._id)
      const conversationIndex = this.allConversations.findIndex((item) => item._id === conversation._id)

      if (index === -1) {
        this.regularConversations.unshift(conversation)
        store.setState('regularConversations', [...this.regularConversations])
      }

      if (conversationIndex === -1) {
        this.allConversations.unshift(conversation)
        store.setState('allConversations', [...this.allConversations])
      }
    })
  }

  handleRemoveRegularConversation () {
    EventBus.$on('regular-conversation.delete', (conversation: any) => {
      const index = this.regularConversations.findIndex((item) => item._id === conversation._id)
      const conversationIndex = this.allConversations.findIndex((item) => item._id === conversation._id)

      this.regularConversations.splice(index, 1)
      this.allConversations.splice(conversationIndex, 1)
      store.setState('regularConversations', [...this.regularConversations])
      store.setState('allConversations', [...this.allConversations])
    })
  }

  getRegularConversations (conversations: Array<ObjectType>) {
    const sortedConversations = [...conversations].sort((a, b) => {
      const dateA = moment(a.last_message ? a.last_message.timestamp : a.updated_at).valueOf()
      const dateB = moment(b.last_message ? b.last_message.timestamp : b.updated_at).valueOf()

      if (dateA > dateB) {
        return -1
      }

      if (dateB < dateA) {
        return 1
      }

      return 0
    })

    const regularConversations = [
      ...sortedConversations.filter((user: any) => {
        if (!user.archived_for || user.archived_for.length === 0) return true
        return !user.archived_for.includes(this.$user_token)
      })
    ]

    return this.addUnreadMessagesToConversation(regularConversations)
  }

  async handleDeleteConversation () {
    const conversation = this.regularConversations[this.conversationIndex]
    const res = await this.$robin.deleteConversation(this.$user_token, conversation._id)

    if (res && !res.error) {
      EventBus.$emit('regular-conversation.delete', conversation)
      EventBus.$emit('close-conversation', conversation)
      this.$toast.open({
        message: 'Conversation deleted.',
        type: 'success',
        position: 'bottom-left'
      })
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  handleMessageForward (): void {
    EventBus.$on('message.forward', (messages: ObjectType) => {
      messages.forEach((msg: ObjectType) => {
        this.allConversations.forEach((conversation: any, index: number) => {
          if (conversation._id === msg.conversation_id) {
            const data = { ...this.allConversations[index] }
            const msgData = { ...msg }
            msgData.content.timestamp = new Date()
            data.last_message = msgData.content
            this.allConversations.splice(index, 1, data)
            EventBus.$emit('regular-conversation.delete', this.allConversations[index])
            EventBus.$emit('regular-conversation.add', this.allConversations[index])
          }
        })
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

  addUnreadMessagesToConversation (conversations: Array<ObjectType>): Array<ObjectType> {
    const data = conversations.map((conversation: ObjectType) => {
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

  markReadManaully () {
    const conversation = this.regularConversations[this.conversationIndex] as ObjectType
    EventBus.$emit('mark-as-read', conversation)
  }

  markUnreadManually () {
    const conversation = this.regularConversations[this.conversationIndex] as ObjectType

    if (conversation) {
      if (!conversation.archived_for || conversation.archived_for.length === 0) {
        const index = this.regularConversations.findIndex((item) => item._id === conversation._id)

        if (this.regularConversations[index]) {
          const data = { ...this.regularConversations[index] }
          data.unread_messages = 'marked'
          this.regularConversations.splice(index, 1, data)
          store.setState('regularConversations', this.regularConversations)
        }
      }
    }
  }

  handleMarkAsRead () {
    EventBus.$on('mark-as-read', (conversation: any) => {
      if (conversation) {
        if (!conversation.archived_for || conversation.archived_for.length === 0) {
          const index = this.regularConversations.findIndex(
            (item) => item._id === conversation._id
          )

          if (this.regularConversations[index]) {
            const data = { ...this.regularConversations[index] }
            data.unread_messages = 0
            this.regularConversations.splice(index, 1, data)
            store.setState('regularConversations', this.regularConversations)
          }
        }
      }
    })
  }

  handleMarkAsUnread () {
    EventBus.$on('mark-as-unread', (conversation: ObjectType) => {
      if (conversation) {
        if (!conversation.archived_for || conversation.archived_for.length === 0) {
          const index = this.regularConversations.findIndex(
            (item) => item._id === conversation._id
          )

          if (this.regularConversations[index]) {
            const data = { ...this.regularConversations[index] }
            data.unread_messages += 1
            this.regularConversations.splice(index, 1, data)
            store.setState('regularConversations', this.regularConversations)
          }
        }
      }
    })
  }

  onGroupConversationCreated () {
    EventBus.$on('new-group.conversation', (conversation: ObjectType) => {
      conversation.participants.every((participant: any) => {
        if (participant.user_token === this.$user_token) {
          EventBus.$emit('regular-conversation.add', conversation)

          return false
        }

        return true
      })
    })
  }

  searchedData (event: ObjectType): void {
    if (event.text.trim() !== '') {
      this.regularConversations = event.data
    } else {
      this.regularConversations = this.getRegularConversations(this.allConversations)
      this.refresh()
    }
  }
}
</script>
