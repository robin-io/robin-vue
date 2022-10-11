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

      <content
        font-weight="400"
        color="#15AE73"
        v-show="archivedConversations.length > 0"
        data-testid="archived-conversation-count"
      >
        {{ archivedConversations.length }}
      </content>
    </custom-button>

    <div v-show="isPageLoading" class="robin-spinner"></div>

    <div
      v-show="!isPageLoading"
      class="robin-wrapper robin-card-container robin-flex robin-flex-column"
      @scroll="onScroll()"
      :class="{ 'robin-come-down': screenWidth > 1200 }"
    >
      <recycle-scroller
        :items="conversations"
        key-field="_id"
        :page-mode="true"
        :item-size="83"
        v-slot="{ item, index }"
      >
        <chat-list-card
          :index="index"
          :item="item"
          :type="1"
          @open-conversation="openConversation(item)"
          @open-modal="openModal"
          @close-modal="closeModal"
        />
      </recycle-scroller>
    </div>

    <chat-list-pop-up
      v-if="conversations[conversationIndex]"
      :conversation="conversations[conversationIndex]"
      :is-archived="false"
      @archive-chat="handleArchiveChat"
      @delete-conversation="handleDeleteConversation"
      @mark-as-read="handleMarkAsRead"
      @mark-as-unread="handleMarkAsUnread"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
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
import RecycleScroller from '../RecycleScroller/RecycleScroller.vue'
import assets from '@/utils/assets.json'

const ComponentProps = Vue.extend({
  props: {
    regularConversations: {
      type: Array as PropType<Array<ObjectType>>,
      default: (): Array<ObjectType> => []
    },
    archivedConversations: {
      type: Array,
      default: (): Array<ObjectType> => []
    }
  }
})

// eslint-disable-next-line
@Component<PrimaryChatList>({
  name: 'PrimaryChatList',
  components: {
    Content,
    IconButton,
    SvgIcon,
    SearchBar,
    'custom-button': Button,
    Mention,
    ChatListPopUp,
    ChatListCard,
    RecycleScroller
  },
  watch: {
    regularConversations: {
      handler (val: Array<ObjectType>): void {
        this.conversations = [...val].sort((a, b) => {
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
        this.popUpStates = []
        this.conversations.forEach((val) => {
          this.popUpStates.push({
            opened: false,
            _id: val._id
          })
        })
      },
      immediate: true
    },
    $robin_users: {
      handler (val) {
        this.avatarKey += 1
      }
    }
  }
})
export default class PrimaryChatList extends ComponentProps {
  popUpStates: Array<ObjectType> = []
  conversationIndex = 0
  avatarKey = 0
  scroll = false as boolean
  isLoading = false as boolean
  conversations = [] as Array<ObjectType>
  key = 0 as number
  filterActive = false

  created () {
    this.onGroupIconUpdate()
  }

  get isPageLoading () {
    return store.state.isPageLoading
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

  get assets (): any {
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
      this.conversations = [...this.conversations.filter(
        (conversation) =>
          conversation.unread_messages > 0 || conversation.unread_messages === 'marked'
      )]
    } else {
      this.conversations = [...this.regularConversations.sort((a, b) => {
        const dateA = moment(a.last_message ? a.last_message.timestamp : a.updated_at).valueOf()
        const dateB = moment(b.last_message ? b.last_message.timestamp : b.updated_at).valueOf()

        if (dateA > dateB) {
          return -1
        }

        if (dateB < dateA) {
          return 1
        }

        return 0
      })] as Array<ObjectType>
    }
  }

  onGroupIconUpdate (): void {
    EventBus.$on('group.icon.update', (conversation: ObjectType) => {
      const index = this.conversations.findIndex((item) => item._id === conversation._id)
      this.conversations.splice(index, 1, conversation)
      // this.$forceUpdate()
    })
  }

  openConversation (conversation: ObjectType): void {
    store.setState('imagePreviewOpen', false)
    store.setState('currentConversation', [])
    store.setState('conversationOpen', false)
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

  onScroll (): void {
    this.scroll = true
  }

  openModal (index: number) {
    this.conversationIndex = index
    const chatEl = document.getElementById(`conversation-${this.conversationIndex}`) as HTMLElement
    const chatListPopupEl = document.getElementById('chat-list-popup') as HTMLElement
    const lastThreeInArray = index >= this.conversations.length - 3

    if (chatListPopupEl.style.display === 'block') chatListPopupEl.style.display = 'none'

    if (lastThreeInArray) {
      chatListPopupEl.style.top = `${chatEl.getBoundingClientRect().top - 40}px`
    } else {
      chatListPopupEl.style.top = `${chatEl.getBoundingClientRect().top + 50}px`
    }

    chatListPopupEl.style.left = `${chatEl.getBoundingClientRect().right - 80}px`

    chatListPopupEl.style.display = 'block'
  }

  closeModal (index: number) {
    const popup = document.getElementById('chat-list-popup') as HTMLElement

    if (this.conversationIndex === index) {
      popup.classList.remove('robin-zoomIn')
      popup.classList.add('robin-zoomOut')

      window.setTimeout(() => {
        popup.style.display = 'none'
        popup.classList.add('robin-zoomIn')
        popup.classList.remove('robin-zoomOut')
      }, 300)
    }
  }

  async handleArchiveChat (): Promise<void> {
    const conversation = this.conversations[this.conversationIndex] as ObjectType
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
    // eslint-disable-next-line array-callback-return
    const data = this.$regularConversations.filter((obj) => {
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
    this.$emit('search', {
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
      this.refresh()
    }, 300)
  }

  openArchivedChat (): void {
    this.$emit('openarchivedchatmodal', 'archivedchat')
    setTimeout(() => {
      this.refresh()
    }, 300)
  }

  refresh (): void {
    this.key += 1
  }

  handleMarkAsRead () {
    const conversation = this.conversations[this.conversationIndex] as ObjectType
    EventBus.$emit('mark-as-read', conversation)
  }

  handleMarkAsUnread () {
    const conversation = this.conversations[this.conversationIndex] as ObjectType
    EventBus.$emit('mark-as-unread.modified', conversation)
  }

  async handleDeleteConversation () {
    const conversation = this.conversations[this.conversationIndex]
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
}
</script>
