<template>
  <div class="robin-primary-chat-list-container">
    <header class="robin-header">
      <img
        v-if="$logo === '' && currentTheme === 'light'"
        :src="assets.logo"
        :data-src="assets.logo"
        class="lazyload"
        alt="logo"
      />
      <img
        v-else-if="$logo === '' && currentTheme === 'dark'"
        :src="assets.logo_dark"
        :data-src="assets.logo_dark"
        class="lazyload"
        alt="logo"
      />
      <img v-else class="custom lazyload" :data-src="$logo" alt="logo" />
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
        @filter="filter()"
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
      v-if="isArchiveChatEnabled && archivedConversations.length > 0"
    >
      <div class="robin-flex robin-flex-align-center" v-show="archivedConversations.length > 0">
        <svg-icon name="mailbox" color="#15AE73" />

        <message-content class="robin-ml-6" font-weight="400" color="#15AE73">
          Archived Chats
        </message-content>
      </div>

      <message-content font-weight="400" color="#15AE73" data-testid="archived-conversation-count">
        {{ archivedConversations.length }}
      </message-content>
    </custom-button>

    <div
      class="robin-wrapper robin-card-container robin-flex robin-flex-column"
      :class="{ 'robin-come-down': screenWidth > 1200 }"
    >
      <div v-show="isPageLoading" class="robin-spinner"></div>
      <virtual-scroller
        :items="filteredConversations"
        :item-count="filteredConversations.length"
        :height="filteredConversations.length >= 10 ? childHeight.length * 83 - 1 : 0"
        :child-height="childHeight"
        v-slot="slotProps"
        ref="conversations-wrapper"
        @scroll="handleInfiniteScroll"
      >
        <div :key="slotProps.index" :id="slotProps.index">
          <chat-list-card
            :item="slotProps.item"
            :type="1"
            :key="'conversation-' + slotProps.index"
            :index="slotProps.index"
            conversation-type="primary"
            @open-conversation="openConversation(slotProps.item)"
            @open-modal="openModal"
            @close-modal="closeModal"
          />
        </div>
      </virtual-scroller>
      <div v-show="isPageLoading2" class="robin-spinner"></div>
    </div>

    <chat-list-pop-up
      v-if="filteredConversations[conversationIndex]"
      :conversation="filteredConversations[conversationIndex]"
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
import Component, { mixins } from 'vue-class-component'
import ConversationMixin from '@/mixins/conversation-mixins'
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
import VirtualScroller from '../VirtualScroller/VirtualScroller.vue'
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
    VirtualScroller,
    ChatListPopUp,
    ChatListCard
  },
  watch: {
    status: {
      handler () {
        if (this.status === 'filterByUnread') {
          this.filteredConversations = [...this.filterUnreadConversations()]
        } else if (this.status === 'regular') {
          this.filteredConversations = [...this.regularConversations]
        }
      }
    },
    searchData: {
      handler () {
        this.filteredConversations = [...this.searchData]
      }
    },
    filteredConversations: {
      handler () {
        const childHeight = []

        // eslint-disable-next-line
        for (const _item of this.filteredConversations) {
          childHeight.push(83)
        }

        this.childHeight = childHeight
      }
    },
    isWebSocketConnected: {
      handler (val) {
        if (val) {
          this.getConversations()
        }
      }
    }
  }
})
export default class PrimaryChatList extends mixins(ConversationMixin) {
  searchData = [] as Array<ObjectType>;
  filteredConversations = [] as Array<ObjectType>;
  childHeight = [] as Array<number>;
  conversationIndex = 0;
  scroll = false as boolean;
  isLoading = false as boolean;
  key = 0 as number;
  filterActive = false;
  status = '';
  throttleTimer = false;
  currentPage = 1;
  pageCount = 0;
  isPageLoading2 = false;

  created () {
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

  get assets () {
    return assets
  }

  filter () {
    this.filterActive = !this.filterActive

    if (this.filterActive) {
      this.status = 'filterByUnread'
    } else {
      this.status = 'regular'
    }
  }

  filterUnreadConversations () {
    return [
      ...this.regularConversations.filter(
        (conversation) =>
          conversation.unread_messages > 0 || conversation.unread_messages === 'marked'
      )
    ]
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
    store.setState('currentConversation', conversation)

    this.$nextTick(() => {
      EventBus.$emit('open-conversation')
      EventBus.$emit('conversation-opened', conversation)
    })
  }

  openModal (index: number) {
    this.conversationIndex = index
    const chatEl = document.getElementById(`conversation-${this.conversationIndex}`) as HTMLElement
    const chatListPopupEl = (this.$refs['chat-list-popup'] as Vue).$el as HTMLElement
    const lastThreeInArray = index >= this.filteredConversations.length - 3

    if (chatListPopupEl.style.display === 'block') chatListPopupEl.style.display = 'none'

    if (lastThreeInArray && this.filteredConversations.length > 5) {
      chatListPopupEl.style.top = `${chatEl.getBoundingClientRect().top - 50}px`
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
    const conversation = this.filteredConversations[this.conversationIndex] as ObjectType
    const res = await this.$robin.archiveConversation(conversation._id)

    if (!res.error) {
      EventBus.$emit('regular-conversation.delete', conversation)
      EventBus.$emit('archived-conversation.add', conversation)
      this.showToast('Conversation archived', 'success')
      this.$emit('refresh')
    }
  }

  async searchConversation (searchText: string) {
    this.status = 'search'
    this.searchData = [] as Array<ObjectType>
    this.isLoading = true

    const searchTextLower = searchText.toLowerCase()
    this.searchData = await this.regularConversations.filter((obj) => {
      return Object.values(obj).some((val) => String(val).toLowerCase().includes(searchTextLower))
    })

    this.isLoading = false
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
    const wrapper = (this.$refs['conversations-wrapper'] as Vue).$el as HTMLElement

    this.throttleConversations(() => {
      if (this.currentPage < this.pageCount) {
        const scrollSpaceLeft = Math.floor(wrapper.scrollHeight - wrapper.clientHeight)
        const endOfScroll = Math.floor(wrapper.scrollTop) >= scrollSpaceLeft

        if (endOfScroll) {
          this.currentPage += 1
          this.isPageLoading2 = true
          this.paginateConversations(this.currentPage)
        }
      }

      this.scroll = false
    }, 1500)
  }

  async getConversations () {
    try {
      const res = await this.$robin.getUserToken(
        // { user_token: this.$user_token },
        10,
        this.currentPage
      )
      if (!res.error) {
        const {
          paginated_conversations: {
            conversations,
            pagination: {
              pagination: { totalPage }
            }
          }
        } = res.data
        this.pageCount = totalPage
        store.setState('unsortedRegularConversations', conversations ?? [])
        store.setState('isPageLoading', false)
        this.status = 'regular'
      }
    } catch (error) {
      console.error(error)
    }
  }

  async paginateConversations (page = 1) {
    try {
      const {
        data: {
          paginated_conversations: { conversations }
        }
      } = await this.$robin.getUserToken(
        // { user_token: this.$user_token },
        10, page
      )
      this.status = 'regular'
      const regularConv = this.getRegularConversations(conversations)
      this.filteredConversations.push(...regularConv)
      store.setState('unsortedRegularConversations', [
        ...this.unsortedRegularConversations,
        ...conversations
      ])
      this.isPageLoading2 = false
    } catch (error) {
      console.error(error)
    }
  }

  handleAddRegularConversation () {
    EventBus.$on('regular-conversation.add', (conversation: ObjectType) => {
      const unsortedRegularConversationsExists = this.unsortedRegularConversations.find(
        (item) => item._id === conversation._id
      )

      if (!unsortedRegularConversationsExists) {
        this.filteredConversations = [conversation, ...this.unsortedRegularConversations].sort(
          (a, b) => {
            const dateA = new Date(a.last_message?.timestamp ?? a.updated_at).getTime()
            const dateB = new Date(b.last_message?.timestamp ?? b.updated_at).getTime()

            return dateB - dateA
          }
        )
        store.setState('unsortedRegularConversations', [
          conversation,
          ...this.unsortedRegularConversations
        ])
      }
    })
  }

  handleRemoveRegularConversation () {
    EventBus.$on('regular-conversation.delete', (conversation: ObjectType) => {
      const unsortedRegularConversations = this.unsortedRegularConversations.filter(
        (item) => item._id !== conversation._id
      )
      this.filteredConversations = [
        ...this.filteredConversations.filter((item) => item._id !== conversation._id)
      ]
      store.setState('unsortedRegularConversations', unsortedRegularConversations)
    })
  }

  async handleDeleteConversation () {
    const conversation = this.filteredConversations[this.conversationIndex]
    const res = await this.$robin.deleteConversation(conversation._id)

    if (res && !res.error) {
      EventBus.$emit('regular-conversation.delete', conversation)
      EventBus.$emit('close-conversation', conversation)
      this.showToast('Conversation deleted.', 'success')
    } else {
      this.showToast('Failed to delete conversation.', 'error')
    }
  }

  handleMessageForward (): void {
    EventBus.$on('message.forward', (messages: ObjectType) => {
      messages.forEach((msg: ObjectType) => {
        this.unsortedRegularConversations.forEach((conversation: ObjectType, index: number) => {
          if (conversation._id === msg.conversation_id) {
            const data = { ...this.unsortedRegularConversations[index] }
            const msgData = { ...msg }
            msgData.content.timestamp = new Date()
            data.last_message = msgData.content

            EventBus.$emit('regular-conversation.delete', data)
            EventBus.$emit('regular-conversation.add', data)
          }
        })
      })
    })
  }

  onNewConversationCreated () {
    EventBus.$on('new.conversation', (conversation: ObjectType) => {
      if (
        conversation.sender_token === this.$user_token ||
        conversation.receiver_token === this.$user_token
      ) {
        EventBus.$emit('regular-conversation.add', conversation)
      }
    })
  }

  markReadManaully () {
    const conversation = this.unsortedRegularConversations[this.conversationIndex] as ObjectType
    EventBus.$emit('mark-as-read', conversation)
  }

  markUnreadManually () {
    const conversation = { ...this.filteredConversations[this.conversationIndex] } as ObjectType

    if (conversation) {
      const index = this.unsortedRegularConversations.findIndex(
        (item) => item._id === conversation._id
      )
      const convIndex = this.filteredConversations.findIndex(
        (item) => item._id === conversation._id
      )
      const unsortedRegularConversations = this.copyConversations(
        this.unsortedRegularConversations ?? []
      )

      conversation.unread_messages = 'marked'
      unsortedRegularConversations.splice(index, 1, conversation)
      this.filteredConversations.splice(convIndex, 1, conversation)
      store.setState('unsortedRegularConversations', [...unsortedRegularConversations])
    }
  }

  handleMarkAsRead () {
    EventBus.$on('mark-as-read', (conversation: ObjectType) => {
      if (conversation._id) {
        const index = this.unsortedRegularConversations.findIndex(
          (item) => item._id === conversation._id
        )
        const convIndex = this.filteredConversations.findIndex(
          (item) => item._id === conversation._id
        )

        if (index !== -1) {
          const conversations = this.copyConversations(this.unsortedRegularConversations ?? [])
          conversation.unread_messages = 0
          conversations[index].unread_messages = 0
          this.filteredConversations.splice(convIndex, 1, conversation)

          store.setState('unsortedRegularConversations', conversations)
        }
      }
    })
  }

  handleMarkAsUnread () {
    EventBus.$on('mark-as-unread', (conversation: ObjectType) => {
      if (conversation._id) {
        const index = this.unsortedRegularConversations.findIndex(
          (item) => item._id === conversation._id
        )
        const convIndex = this.filteredConversations.findIndex(
          (item) => item._id === conversation._id
        )

        if (index !== -1) {
          const conversations = this.copyConversations(this.unsortedRegularConversations ?? [])
          conversations[index].unread_messages += 1
          conversation.unread_messages += 1
          this.filteredConversations.splice(convIndex, 1, conversation)
          store.setState('unsortedRegularConversations', conversations)
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
}
</script>
