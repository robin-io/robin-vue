<template>
  <div class="robin-archived-chat-list-container" ref="popup-body">
    <header class="robin-header">
      <icon-button
        name="remove"
        color="#000"
        @close="$emit('closemodal', 'primary')"
        emit="close"
        :to-emit="true"
        :to-click-away="false"
        data-testid="closemodal"
      />

      <message-content
        fontWeight="400"
        :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'"
        :fontSize="16"
        class="robin-ml-12"
      >
        Archived Messages
      </message-content>
    </header>

    <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-mt-42">
      <virtual-scroller
        :items="conversations"
        :item-count="conversations.length"
        :height="conversations.length >= 10 ? childHeight.length * 87 - 1 : 0"
        :child-height="childHeight"
        v-slot="slotProps"
        ref="conversations-wrapper"
        v-show="conversations.length > 0"
        @scroll="handleInfiniteScroll"
      >
        <div :key="slotProps.index" :id="slotProps.index">
          <chat-list-card
            :item="slotProps.item"
            :type="1"
            :key="'conversation-' + slotProps.index"
            :index="slotProps.index"
            conversation-type="archived"
            @open-conversation="openConversation(slotProps.item)"
            @open-modal="openModal"
            @close-modal="closeModal"
          />
        </div>
      </virtual-scroller>
      <div
        v-show="conversations.length < 1"
        class="robin-flex robin-flex-justify-center robin-pt-15"
      >
        <message-content :font-size="18" color="#15AE73">No archived chat</message-content>
      </div>
    </div>
    <chat-list-pop-up
      v-if="conversations[conversationIndex]"
      ref="chat-list-popup"
      :is-archived="true"
      :conversation="conversations[conversationIndex]"
      @unarchive-chat="unArchiveChat(conversations[conversationIndex]._id)"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/store/index'
import Component, { mixins } from 'vue-class-component'
import EventBus from '@/event-bus'
import IconButton from '../IconButton/IconButton.vue'
import Avatar from '../Avatar/Avatar.vue'
import GroupAvatar from '../GroupAvatar/GroupAvatar.vue'
import ChatListCard from '../ChatListCard/ChatListCard.vue'
import ChatListPopUp from '../ChatListPopUp/ChatListPopUp.vue'
import VirtualScroller from '../VirtualScroller/VirtualScroller.vue'
import ConversationMixin from '@/mixins/conversation-mixins'

const Content = () => import('../Content/Content.vue')

// eslint-disable-next-line
@Component<ArchivedChatList>({
  name: 'ArchivedChatList',
  components: {
    'message-content': Content,
    IconButton,
    ChatListCard,
    Avatar,
    GroupAvatar,
    ChatListPopUp,
    VirtualScroller
  },
  watch: {
    conversations: {
      handler () {
        const childHeight = []

        // eslint-disable-next-line
        for (const _item of this.conversations) {
          childHeight.push(87)
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
export default class ArchivedChatList extends mixins(ConversationMixin) {
  conversationIndex = 0;
  conversations = [] as Array<ObjectType>;
  paginatedConversations = [] as Array<ObjectType>;
  currentPage = 1;
  pageCount = 0;
  childHeight = [] as number[];
  scroll = false as boolean;
  throttleTimer = false as boolean;
  showToast!: (message: string, type: string) => void;

  created () {
    this.handleAddArchivedConversation()
    this.handleRemoveArchivedConversation()
  }

  openConversation (conversation: object): void {
    store.setState('imagePreviewOpen', false)
    store.setState('currentConversation', [])
    store.setState('currentConversation', conversation)

    this.$nextTick(() => {
      EventBus.$emit('open-conversation')
      EventBus.$emit('conversation-opened', conversation)
    })
  }

  getProfileImage (conversation: any) {
    const index = this.$robin_users.findIndex(
      (user: any) => user.userToken === conversation.sender_token
    )

    return this.$robin_users[index] ? this.$robin_users[index].profileImage : ''
  }

  openModal (index: number) {
    this.conversationIndex = index
    const chatEl = document.getElementById(`conversation-${this.conversationIndex}`) as HTMLElement
    const chatListPopupEl = (this.$refs['chat-list-popup'] as Vue).$el as HTMLElement
    const lastThreeInArray = index >= this.conversations.length - 3

    if (chatListPopupEl.style.display === 'block') chatListPopupEl.style.display = 'none'

    if (lastThreeInArray && this.scroll) {
      chatListPopupEl.style.top = `${chatEl.getBoundingClientRect().top - 40}px`
    } else {
      chatListPopupEl.style.top = `${chatEl.getBoundingClientRect().top}px`
    }

    const leftSpacing = this.screenWidth > 1024 ? 120 : 172 - 16

    if (this.screenWidth >= 1200) {
      chatListPopupEl.style.left = `${chatEl.getBoundingClientRect().right - leftSpacing}px`
    } else {
      chatListPopupEl.style.left = 'initial'
    }

    chatListPopupEl.style.display = 'block'
  }

  closeModal (index: number) {
    const chatListPopupEl = this.$refs['chat-list-popup']
      ? ((this.$refs['chat-list-popup'] as Vue).$el as HTMLElement)
      : (undefined as HTMLElement | undefined)

    if (this.conversationIndex === index && chatListPopupEl) {
      chatListPopupEl.classList.remove('robin-zoomIn')
      chatListPopupEl.classList.add('robin-zoomOut')

      window.setTimeout(() => {
        chatListPopupEl.style.display = 'none'
        chatListPopupEl.classList.add('robin-zoomIn')
        chatListPopupEl.classList.remove('robin-zoomOut')
      }, 300)
    }
  }

  async unArchiveChat (id: string): Promise<void> {
    const res = await this.$robin.unarchiveConversation(id, this.$user_token)

    if (!res.error) {
      const index = this.conversations.findIndex((conversation) => conversation._id === id)
      const conversation = this.conversations[index]
      conversation.archived_for = []

      EventBus.$emit('archived-conversation.delete', conversation)
      EventBus.$emit('regular-conversation.add', conversation)
      this.showToast('Conversation unarchived.', 'success')
      this.$emit('refresh')
    }
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
      const scrollSpaceLeft = Math.floor(wrapper.scrollHeight - wrapper.clientHeight)
      const endOfScroll = Math.floor(wrapper.scrollTop) >= scrollSpaceLeft

      if (endOfScroll) {
        this.paginateConversations(this.currentPage + 1)
      }
    }, 1500)
  }

  async getConversations () {
    const res = await this.$robin.getArchivedConversation(
      {
        user_token: this.$user_token
      },
      10,
      this.currentPage
    )
    if (!res.error) {
      const conversations = res.data.conversations == null ? [] : res.data.conversations
      const archivedConversations = this.getArchivedConversations(conversations)
      this.pageCount = res.data.pagination.pagination.totalPage
      store.setState('archivedConversations', [...archivedConversations])
      this.conversations = [...archivedConversations]
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
      const conversations =
        res.data.paginated_conversations.conversations == null
          ? []
          : res.data.paginated_conversations.conversations
      const archivedConversations = this.getArchivedConversations([
        ...this.conversations,
        ...conversations
      ])
      store.setState('archivedConversations', [...archivedConversations])
      this.conversations = [...archivedConversations]
    }
  }

  handleAddArchivedConversation () {
    EventBus.$on('archived-conversation.add', (conversation: any) => {
      const conversations = [conversation, ...this.conversations]
      this.conversations = this.sortConversations(conversations)
      store.setState('archivedConversations', [...this.conversations])
    })
  }

  handleRemoveArchivedConversation () {
    EventBus.$on('archived-conversation.delete', (conversation: any) => {
      const index = this.conversations.findIndex((item) => item._id === conversation._id)

      this.conversations.splice(index, 1)
      store.setState('archivedConversations', [...this.conversations])
    })
  }

  getArchivedConversations (conversations: Array<ObjectType>): Array<any> {
    return this.sortConversations(conversations).filter((user: any) => {
      if (!user.archived_for) return false
      return user.archived_for.includes(this.$user_token)
    })
  }

  sortConversations (conversations: Array<ObjectType>): Array<ObjectType> {
    return [...conversations].sort((a, b) => {
      const dateA = new Date(a.last_message ? a.last_message.timestamp : a.updated_at).getTime()
      const dateB = new Date(b.last_message ? b.last_message.timestamp : b.updated_at).getTime()

      if (dateA > dateB) {
        return -1
      }

      if (dateB < dateA) {
        return 1
      }

      return 0
    })
  }
}
</script>
