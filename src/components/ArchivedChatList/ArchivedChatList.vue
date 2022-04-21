<template>
  <!-- eslint-disable vue/no-parsing-error -->
  <div class="robin-side-container" ref="popup-body">
    <header class="robin-header">
      <IconButton data-testid="closemodal" name="remove" color="#000" @close="$emit('closemodal', 'primary')" emit="close" :to-emit="true" :to-click-away="false" />

      <Content fontWeight="400" :fontSize="16" class="robin-ml-12"> Archived Messages </Content>
    </header>

    <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-mt-42" @scroll="onScroll()">
      <div data-testid="card" class="robin-card robin-flex robin-flex-align-center" :class="{ 'robin-card-active': isConversationActive(conversation)  && screenWidth > 1200 }" v-for="(conversation, index) in conversations" :key="`conversation-${index}`" @click.self="openConversation(conversation)" v-show="conversations.length > 0">
        <div class="robin-card-info robin-mr-12" @click="openConversation(conversation)">
          <Avatar data-testid="regular-avatar" :robin-users="$robin_users" v-if="!conversation.is_group" :key="avatarKey" :img-url="getProfileImage(conversation)" :sender-token="conversation.sender_token === $user_token ? conversation.receiver_token : conversation.sender_token" />

          <GroupAvatar data-testid="group-avatar" v-else :img-url="conversation.group_icon" />
        </div>

        <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-pt-4 robin-pb-4˝ robin-flex-1">
          <div class="robin-flex robin-flex-space-between" @click="openConversation(conversation)">
            <Content fontWeight="normal" color="#000000" :fontSize="16" :lineHeight="20" v-if="!conversation.is_group"> {{ conversation.sender_token != $user_token ? conversation.sender_name : conversation.receiver_name }} </Content>

            <Content font-weight="normal" color="#000000" :font-size="16" :line-height="20" v-else>
              {{ conversation.name }}
            </Content>

            <Content as="p" fontWeight="normal" color="#51545C" :fontSize="14" :lineHeight="18"> {{ formatRecentMessageTime(conversation.last_message ? conversation.last_message.timestamp : conversation.updated_at) }} </Content>
          </div>
          <div class="robin-flex robin-flex-space-between" @click.self="openConversation(conversation)">
            <Content as="p" fontWeight="normal" color="#8D9091" :fontSize="14" :lineHeight="18" @click.native="openConversation(conversation)"> {{ conversation.last_message && conversation.last_message.msg.length < 20 ? conversation.last_message.msg : conversation.last_message ? conversation.last_message.msg.substring(0, 20) + ' ...' : '' }} </Content>

            <div class="robin-mini-info-container robin-flex robin-flex-align-center">
              <div class="robin-hidden robin-ml-10" data-testid="archive-handler" @click="handleOpenPopUp($event, conversation._id, `popup-container-${index}`, `popup-${index}`, index.toString())">
                <IconButton name="openModalDot" @clickoutside="handleClosePopUp(conversation._id, `popup-${index}`)" :to-emit="false" :to-click-away="true" />
              </div>
            </div>
          </div>
        </div>

        <div class="robin-popup-container" data-testid="archive-popover" :ref="`popup-container-${index}`" v-show="popUpStates[index].opened">
          <ArchiveChatListPopOver :ref="`popup-${index}`" @unarchive-chat="unArchiveChat(conversation._id)" />
        </div>
      </div>

      <div v-show="conversations.length < 1" class="robin-flex robin-flex-justify-center robin-pt-15">
        <Content :font-size="18" color="#15AE73">No archived chat</Content>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import moment from 'moment'
import store from '@/store/index'
import Component from 'vue-class-component'
import EventBus from '@/event-bus'
import Content from '../Content/Content.vue'
import IconButton from '../IconButton/IconButton.vue'
import Avatar from '../Avatar/Avatar.vue'
import GroupAvatar from '../GroupAvatar/GroupAvatar.vue'
import ArchiveChatListPopOver from '../ArchiveChatListPopOver/ArchiveChatListPopOver.vue'

const ComponentProps = Vue.extend({
  props: {
    archivedConversations: {
      type: Array,
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
    // RCloseButton,
    Avatar,
    GroupAvatar,
    // ROpenModalCaretButton,
    ArchiveChatListPopOver
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
        this.popUpStates = []

        ;[...val].forEach((val) => {
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
export default class ArchivedChatList extends ComponentProps {
  conversations: Array<any> = []
  popUpStates: Array<any> = []
  activeConversation = {}
  scroll = false as boolean
  avatarKey: number = 0
  screenWidth = 0 as number

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
  }

  openConversation (conversation: object): void {
    if (!this.isConversationActive(conversation) && this.screenWidth > 1200) {
      this.activeConversation = conversation
      store.setState('imagePreviewOpen', false)
      EventBus.$emit('conversation-opened', conversation)
      EventBus.$emit('open-conversation')
    }

    if (this.screenWidth <= 1200) {
      this.activeConversation = conversation
      store.setState('imagePreviewOpen', false)
      EventBus.$emit('conversation-opened', conversation)
      EventBus.$emit('open-conversation')
    }
  }

  getProfileImage (conversation: any) {
    const index = this.$robin_users.findIndex((user: any) => user.userToken === conversation.sender_token)

    return this.$robin_users[index] ? this.$robin_users[index].profileImage : ''
  }

  isConversationActive (object: Object) {
    return Object.is(this.activeConversation, object)
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
      if (this.popUpStates[index].opened) {
        const popup = this.$refs[refKey] as any
        popup[0].$refs['popup-body'].classList.remove('robin-zoomOut')

        this.popUpStates[index].opened = false
      }
    }, 300)
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
  box-shadow: 0px 2px 20px rgba(0, 104, 255, 0.06);
  position: absolute;
  top: 0;
  z-index: 3;
  background-color: #fff;
}

header {
  width: 100%;
  display: flex;
  align-items: center;
  padding: clamp(10%, 4vh, 3.563rem) clamp(2%, 4vw, 1.5rem) 1.5rem;
}

/* .robin-wrapper {
  padding: 0 clamp(2%, 4vw, 1.5rem);
} */

.robin-card-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 1rem;
}

.robin-card-container .robin-card {
  border-bottom: 3.5px solid #f5f7fc;
  padding: 1rem 1rem 1.1rem;
  transition: all 0.15s;
  /* position: relative; */
}

.robin-card-container .robin-card:nth-last-child(2) {
  border-bottom: none;
}

.robin-card-active {
  background-color: #efefef;
  cursor: default;
}

.robin-card-active:hover {
  cursor: default;
  border-radius: 4px;
}

.robin-card:hover {
  background-color: #f0f3f5;
  border-radius: 4px;
  cursor: pointer;
  /* padding: 1rem 0.75rem 1.1rem; */
}

.robin-card:hover .robin-hidden {
  display: block;
  animation: slideInRight 300ms;
}

.robin-popup-container {
  position: fixed;
  z-index: 100;
}

.robin-mini-info-container {
  height: 20px;
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

  .robin-hidden {
    display: block;
  }

  .robin-hidden >>> .robin-button {
    width: 20px;
    text-align: right;
  }

  .robin-card:not(.robin-card-active):hover {
    background-color: initial;
  }

  .robin-card:hover .robin-hidden {
    animation: none;
  }

  .robin-popup-container {
    right: 0px;
  }
}
</style>
