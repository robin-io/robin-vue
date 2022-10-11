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

      <content
        fontWeight="400"
        :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'"
        :fontSize="16"
        class="robin-ml-12"
      >
        Archived Messages
      </content>
    </header>

    <div
      class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-mt-42"
      @scroll="onScroll()"
    >
      <recycle-scroller
        :items="conversations"
        :items-size="conversations.length"
        :page-mode="true"
        key-field="_id"
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

      <div
        v-show="conversations.length < 1"
        class="robin-flex robin-flex-justify-center robin-pt-15"
      >
        <content :font-size="18" color="#15AE73">No archived chat</content>
      </div>
    </div>
    <chat-list-pop-up
      v-if="conversations[conversationIndex]"
      :is-archived="true"
      :conversation="conversations[conversationIndex]"
      @unarchive-chat="unArchiveChat(conversations[conversationIndex]._id)"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import moment from 'moment'
import store from '@/store/index'
import Component from 'vue-class-component'
import EventBus from '@/event-bus'
import Content from '../Content/Content.vue'
import IconButton from '../IconButton/IconButton.vue'
import Avatar from '../Avatar/Avatar.vue'
import GroupAvatar from '../GroupAvatar/GroupAvatar.vue'
import ChatListPopUp from '../ChatListPopUp/ChatListPopUp.vue'
import RecycleScroller from '../RecycleScroller/RecycleScroller.vue'

const ComponentProps = Vue.extend({
  props: {
    archivedConversations: {
      type: Array as PropType<Array<ObjectType>>,
      default: (): Array<any> => []
    }
  }
})

// eslint-disable-next-line
@Component<ArchivedChatList>({
  name: 'ArchivedChatList',
  components: {
    Content,
    IconButton,
    Avatar,
    GroupAvatar,
    RecycleScroller,
    ChatListPopUp
  },
  watch: {
    archivedConversations: {
      handler (val: Array<any>): void {
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
export default class ArchivedChatList extends ComponentProps {
  conversationIndex = 0
  conversations: Array<ObjectType> = []
  popUpStates: Array<ObjectType> = []
  scroll = false as boolean
  avatarKey: number = 0

  get screenWidth () {
    return store.state.screenWidth
  }

  get currentConversation () {
    return store.state.currentConversation
  }

  get currentTheme () {
    return store.state.currentTheme
  }

  openConversation (conversation: object): void {
    store.setState('imagePreviewOpen', false)
    store.setState('currentConversation', [])
    store.setState('conversationOpen', false)
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

  async unArchiveChat (id: string): Promise<void> {
    const res = await this.$robin.unarchiveConversation(id, this.$user_token)

    if (!res.error) {
      const index = this.conversations.findIndex((conversation) => conversation._id === id)
      const conversation = this.conversations[index]
      conversation.archived_for = []

      EventBus.$emit('archived-conversation.delete', conversation)
      EventBus.$emit('regular-conversation.add', conversation)
      this.$toast.open({
        message: 'Conversation unarchived.',
        type: 'success',
        position: 'bottom-left'
      })
      this.$emit('refresh')
    }
  }
}
</script>
