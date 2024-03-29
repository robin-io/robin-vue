<template>
  <!-- eslint-disable vue/no-parsing-error -->
  <div class="robin-side-container">
    <header class="robin-header">
      <img v-if="$logo === ''" :src="assets['logo']" alt="logo" />
      <img v-else class="custom" :src="$logo" alt="logo" />

      <div class="robin-wrapper">
        <IconButton name="edit" @edit="openEdit()" emit="edit" :to-emit="true" :to-click-away="false" :color="'#fff'" v-if="isCreateChatEnabled" />
        <slot name="chat-list-header"></slot>
      </div>
    </header>

    <div class="robin-wrapper robin-w-100 robin-pl-16 robin-pr-16 robin-pb-16">
      <SearchBar @user-typing="searchConversation($event)" :loading="isLoading" :key="key" />
    </div>

    <Button class="robin-wrapper robin-pl-16 robin-pr-16 robin-flex robin-flex-space-between robin-w-100 robin-pt-16 robin-pb-12" @archived="openArchivedChat()" v-if="isArchiveChatEnabled">
      <div class="robin-flex robin-flex-align-center" v-show="archivedConversations.length > 0">
        <SvgIcon name="mailbox" color="#15AE73" />

        <Content class="robin-ml-6" font-weight="400" color="#15AE73"> Archived Chats </Content>
      </div>

      <Content font-weight="400" color="#15AE73" v-show="archivedConversations.length > 0" data-testid="archived-conversation-count"> {{ archivedConversations.length }} </Content>
    </Button>

    <div v-show="isPageLoading" class="robin-spinner"></div>

    <div v-show="!isPageLoading" class="robin-wrapper robin-card-container robin-pb-16 robin-flex robin-flex-column" @scroll="onScroll()" :class="{ 'robin-come-down': screenWidth > 1200 }">
      <div class="robin-card robin-flex robin-flex-align-center" v-for="(conversation, index) in conversations" :key="`conversation-${index}`" :class="{ 'robin-card-active': currentConversation._id == conversation._id && screenWidth > 1200 }" @click.self="openConversation(conversation)" :data-testid="`conversation-${index}`">
        <div class="robin-card-info robin-mr-12" @click="openConversation(conversation)">
          <Avatar :robin-users="$robin_users" v-if="!conversation.is_group" :key="avatarKey" :img-url="getProfileImage(conversation) || conversation.display_photo" :sender-token="conversation.sender_token === $user_token ? conversation.receiver_token : conversation.sender_token" data-testid="regular-avatar" />

          <GroupAvatar v-else :img-url="conversation.group_icon" data-testid="group-avatar" />
        </div>

        <div class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-pt-4 robin-pb-41 robin-flex-1" @click.self="openConversation(conversation)">
          <div class="robin-flex robin-flex-space-between" @click="openConversation(conversation)">
            <Content font-weight="normal" color="#000000" :font-size="16" :line-height="20" v-if="!conversation.is_group">
              {{ conversation.sender_token != $user_token ? conversation.sender_name : conversation.receiver_name }}
            </Content>

            <Content font-weight="normal" color="#000000" :font-size="16" :line-height="20" v-else>
              {{ conversation.name }}
            </Content>

            <Content as="p" fontWeight="normal" color="#51545C" :fontSize="14" :lineHeight="18">
              {{ formatRecentMessageTime(conversation.last_message ? conversation.last_message.timestamp : conversation.updated_at) }}
            </Content>
          </div>

          <div class="robin-flex robin-flex-space-between" @click.self="openConversation(conversation)">
            <div class="robin-mini-info-container robin-flex-1" @click="openConversation(conversation)">
              <Content as="p" font-weight="normal" color="#8D9091" :font-size="14" :line-height="18" v-if="conversation.last_message && !conversation.last_message.is_attachment">
                {{ conversation.last_message && conversation.last_message.msg.length < 20 ? conversation.last_message.msg : conversation.last_message ? conversation.last_message.msg.substring(0, 20) + ' ...' : '' }}
              </Content>

              <Content v-show="conversation.last_message && conversation.last_message.is_attachment" as="p" font-weight="normal" color="#8D9091" :font-size="14" :line-height="18">
                <b><i>Attachment</i></b>
              </Content>
            </div>

            <div class="robin-mini-info-container robin-flex robin-flex-align-center">
              <div class="mini-info robin-ml-10" v-if="conversation.unread_messages > 0 || conversation.unread_messages == 'marked'" @click="openConversation(conversation)">
                <UnreadMessageCount :unread="conversation.unread_messages" background-color="#EA8D51" />
              </div>
              <div class="robin-hidden robin-ml-10" @click="handleOpenPopUp($event, conversation._id, `popup-container-${index}`, `popup-${index}`, index.toString())">
                <IconButton name="openModalDot" @clickoutside="handleClosePopUp(conversation._id, `popup-${index}`)" :to-click-away="true" :to-emit="false" />
              </div>
            </div>
          </div>
        </div>

        <div class="robin-popup-container" :ref="`popup-container-${index}`" v-show="popUpStates[index] ? popUpStates[index].opened : false">
          <ChatListPopOver :ref="`popup-${index}`" :conversation="conversation" @archive-chat="handleArchiveChat(conversation)" @delete-conversation="handleDeleteConversation(conversation)" @mark-as-read="handleMarkAsRead(conversation)" @mark-as-unread="handleMarkAsUnread(conversation)" />
        </div>
      </div>
    </div>
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
import Avatar from '../Avatar/Avatar.vue'
import Mention from '../Mention/Mention.vue'
import ChatListPopOver from '../ChatListPopOver/ChatListPopOver.vue'
import GroupAvatar from '../GroupAvatar/GroupAvatar.vue'
import UnreadMessageCount from '../UnreadMessageCount/UnreadMessageCount.vue'
import assets from '@/utils/assets.json'

const ComponentProps = Vue.extend({
  props: {
    regularConversations: {
      type: Array,
      default: (): Array<any> => []
    },
    archivedConversations: {
      type: Array,
      default: (): Array<any> => []
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
    Button,
    Avatar,
    Mention,
    GroupAvatar,
    UnreadMessageCount,
    ChatListPopOver
  },
  watch: {
    regularConversations: {
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
  popUpStates: Array<any> = []
  // activeConversation = {}
  avatarKey: number = 0
  scroll = false as boolean
  isLoading = false as boolean
  conversations = [] as Array<any>
  key = 0 as number
  screenWidth = 0 as number

  created () {
    this.onGroupIconUpdate()
  }

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
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

  onGroupIconUpdate (): void {
    EventBus.$on('group.icon.update', (conversation: any) => {
      const index = this.conversations.findIndex((item) => item._id === conversation._id)
      this.conversations[index] = conversation
      this.$forceUpdate()
    })
  }

  openConversation (conversation: any): void {
    store.setState('imagePreviewOpen', false)
    EventBus.$emit('conversation-opened', conversation)
    EventBus.$emit('open-conversation')
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

  getProfileImage (conversation: any) {
    const index = this.$robin_users.findIndex((user: any) => user.userToken === conversation.sender_token)

    return this.$robin_users[index] ? this.$robin_users[index].profileImage : null
  }

  onScroll (): void {
    this.scroll = true
  }

  handleOpenPopUp (event: any, _id: string, refContainerKey: string, refKey: string, id: string): void {
    const popupContainer = this.$refs[refContainerKey] as any
    const popup = this.$refs[refKey] as any
    popup[0].$refs['popup-body'].classList.remove('robin-zoomOut')

    if ((!this.scroll && this.conversations.length - 2 !== parseInt(id)) || this.conversations.length - 1 !== parseInt(id)) {
      popupContainer[0].style.top = event.clientY - 12 + 'px'

      if (this.screenWidth > 1024) {
        popupContainer[0].style.left = event.clientX - 90 + 'px'
      } else {
        popupContainer[0].style.left = event.clientX - 145 + 'px'
      }
    } else {
      popupContainer[0].style.top = event.clientY - 60 + 'px'
      if (this.screenWidth > 1024) {
        popupContainer[0].style.left = event.clientX - 90 + 'px'
      } else {
        popupContainer[0].style.left = event.clientX - 145 + 'px'
      }
    }

    const index = this.popUpStates.findIndex((val) => val._id === _id)
    this.popUpStates[index].opened = true

    this.popUpStates.forEach((val, i) => {
      if (val._id !== _id) {
        this.popUpStates[i].opened = false
      }
    })
  }

  handleClosePopUp (_id: string, refKey: string): void {
    const popup = this.$refs[refKey] as any
    popup[0].$refs['popup-body'].classList.add('robin-zoomOut')

    window.setTimeout(() => {
      const index = this.popUpStates.findIndex((val) => val._id === _id)
      if (this.popUpStates[index] ? this.popUpStates[index].opened : false) {
        const popup = this.$refs[refKey] as any
        popup[0].$refs['popup-body'].classList.remove('robin-zoomOut')

        this.popUpStates[index].opened = false
      }
    }, 300)
  }

  async handleArchiveChat (conversation: any): Promise<void> {
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
    let searchData = [] as Array<any>
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

  handleMarkAsRead (conversation: any) {
    EventBus.$emit('mark-as-read', conversation)
  }

  handleMarkAsUnread (conversation: any) {
    EventBus.$emit('mark-as-unread.modified', conversation)
  }

  async handleDeleteConversation (conversation: any) {
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

  onResize () {
    this.screenWidth = window.innerWidth
  }
}
</script>

<style scoped>
.robin-side-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  /* position: relative;
  z-index: 1; */
}

.robin-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(6%, 2vh, 3.563rem) clamp(2%, 4vw, 1.563rem) 1.763rem;
}

.robin-header img.custom:first-child {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

/* .robin-wrapper {
  padding-left: clamp(2%, 4vw, 1rem);
  padding-right: clamp(2%, 4vw, 1rem);
} */

.robin-button.robin-wrapper {
  width: 100%;
}

.robin-card-container {
  width: 100%;
  overflow-y: auto;
}

.robin-card {
  border-bottom: 3.5px solid #f5f7fc;
  padding: 0.938rem 1rem 0.938rem;
  transition: all 0.2s;
  cursor: pointer;
  /* position: relative; */
}

.robin-card-active {
  background-color: #efefef;
  cursor: default;
}

.robin-card-container .robin-card:nth-last-child(1) {
  border-bottom: none;
}

.robin-card:not(.robin-card-active):hover {
  background-color: #f5f7fc;
  border-radius: 4px;
}

.robin-card:hover .robin-hidden {
  display: block;
  animation: slideInRight 300ms;
}

.robin-popup-container {
  position: fixed;
  /* right: -30px; */
  z-index: 100;
}

.robin-mini-info-container {
  height: 20px;
}

.robin-spinner {
  width: 30px;
  height: 30px;
  margin: 0 auto;
}

.robin-flex .robin-svg {
  height: 16px;
}

@media (min-width: 768px) {
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-track {
    /* border: 1px solid #00000017; */
    border-radius: 24px;
  }

  ::-webkit-scrollbar-thumb {
    width: 2px;
    background-color: #d6d6d6;
    border-radius: 24px;
    -webkit-border-radius: 24px;
    -moz-border-radius: 24px;
    -ms-border-radius: 24px;
    -o-border-radius: 24px;
  }
}

@media (max-width: 1200px) {
  .robin-card-container {
    box-shadow: 0px 2px 20px rgba(0, 104, 255, 0.06);
  }

  .robin-card:not(.robin-card-active):hover {
    background-color: initial;
  }

  .robin-card:hover .robin-hidden {
    animation: none;
  }

  .robin-hidden {
    display: block;
  }

  .robin-hidden >>> .robin-button {
    width: 20px;
    text-align: right;
  }

  .robin-popup-container {
    right: 0px;
  }
}
</style>
