<template>
<!-- eslint-disable vue/no-parsing-error -->
  <div class="robin-side-container">
    <header class="robin-header">
      <RText font-weight="400" color="rgba(83, 95, 137, 1)" :font-size="17"> Settings </RText>
      <REditButton @edit="$emit('opennewchatmodal', 'newchat')" />
    </header>
    <div class="robin-wrapper robin-w-100">
      <RSearchBar @user-typing="searchConversation($event)" :loading="isLoading" />
    </div>
    <div class="robin-wrapper robin-pt-10 robin-pb-11">
      <RButton @archived="$emit('openarchivedchatmodal', 'archivedchat')" />
    </div>
    <div class="robin-wrapper robin-card-container robin-pb-16 robin-flex robin-flex-column" @scroll="onScroll()">
      <div class="robin-card robin-flex robin-flex-align-center" :class="{ 'robin-card-active': isConversationActive(conversation) }" v-for="(conversation, index) in conversations" :key="`conversation-${index}`" @click.self="openConversation(conversation)">
        <div class="robin-card-info robin-mr-12" @click="openConversation(conversation)">
          <RAvatar v-if="!conversation.is_group" />
          <RGroupAvatar v-else />
        </div>
        <div class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-pt-4 robin-pb-4˝ robin-flex-1" @click.self="openConversation(conversation)">
          <div class="robin-flex robin-flex-space-between" @click="openConversation(conversation)">
            <RText font-weight="normal" color="#000000" :font-size="16" :line-height="20" v-if="!conversation.is_group">
              {{ conversation.sender_token != $user_token ? conversation.sender_name : conversation.receiver_name }}
            </RText>
            <RText font-weight="normal" color="#000000" :font-size="16" :line-height="20" v-else>
              {{ conversation.name }}
            </RText>

            <RText as="p" fontWeight="normal" color="#566BA0" :fontSize="14" :lineHeight="18">
              {{ formatRecentMessageTime(conversation.last_message ? conversation.last_message.timestamp : conversation.updated_at) }}
            </RText>
          </div>
          <div class="robin-flex robin-flex-space-between" @click.self="openConversation(conversation)">
            <div class="robin-mini-info-container robin-flex-1" @click="openConversation(conversation)">
              <RText as="p" font-weight="normal" color="#7A7A7A" :font-size="14" :line-height="18" v-if="conversation.last_message && !conversation.last_message.is_attachment">
                {{ conversation.last_message && conversation.last_message.msg.length < 20 ? conversation.last_message.msg : conversation.last_message ? conversation.last_message.msg.substring(0, 20) + ' ...' : '' }}
              </RText>
              <RText v-show="conversation.last_message && conversation.last_message.is_attachment" as="p" font-weight="normal" color="#7A7A7A" :font-size="14" :line-height="18">
                <b><i>Attachment</i></b>
              </RText>
            </div>

            <div class="robin-mini-info-container robin-flex robin-flex-align-center">
              <!-- <RMention @click.native="openConversation(conversation)" /> -->
              <!-- use when mention icon is present robin-ml-8 -->
              <!-- <div class="mini-info robin-ml-10" @click="openConversation(conversation)">
                <RUnreadMessageCount :count="10" />
              </div> -->
              <div class="robin-hidden robin-ml-10" @click="handleOpenPopUp(conversation._id, `popup-${index}`)">
                <ROpenModalCaretButton @clickoutside="handleClosePopUp(conversation._id, `popup-${index}`)" />
              </div>
            </div>
          </div>
        </div>
        <div class="robin-popup-container" :class="{ top: (scroll && conversations.length - 2 == index) || conversations.length - 1 == index }" v-show="popUpStates[index] ? popUpStates[index].opened : false">
          <RChatListPopOver :ref="`popup-${index}`" :class="{ top: (scroll && conversations.length - 2 == index) || conversations.length - 1 == index }" @archive-chat="onArchiveChat(conversation)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import moment from 'moment'
import Component from 'vue-class-component'
import { Mutation } from 'vuex-class'
import EventBus from '@/event-bus'
import RText from './RText/RText.vue'
import REditButton from './REditButton/REditButton.vue'
import RSearchBar from './RSearchBar/RSearchBar.vue'
import RButton from './RButton/RButton.vue'
import RAvatar from './RAvatar/RAvatar.vue'
import ROpenModalCaretButton from './ROpenModalCaretButton/ROpenModalCaretButton.vue'
import RMention from './RMention/RMention.vue'
import RChatListPopOver from './RChatListPopOver/RChatListPopOver.vue'
import RGroupAvatar from './RGroupAvatar/RGroupAvatar.vue'
import RUnreadMessageCount from './RUnreadMessageCount/RUnreadMessageCount.vue'

const ComponentProps = Vue.extend({
  props: {
    data: {
      type: Array,
      default: (): Array<any> => []
    }
  }
})

// eslint-disable-next-line
@Component<PrimaryChatList>({
  name: 'RPrimaryChatList',
  components: {
    RText,
    REditButton,
    RSearchBar,
    RButton,
    RAvatar,
    RMention,
    ROpenModalCaretButton,
    RGroupAvatar,
    RUnreadMessageCount,
    RChatListPopOver
  },
  watch: {
    data: {
      handler (val: Array<any>): void {
        this.conversations = [...val]
        this.popUpStates = []
        ;[...val].forEach((val) => {
          this.popUpStates.push({
            opened: false,
            _id: val._id
          })
        })
      },
      immediate: true
    }
  }
})
export default class PrimaryChatList extends ComponentProps {
  @Mutation('setImagePreviewOpen') setImagePreviewOpen: any

  popUpStates: Array<any> = []
  activeConversation = {}
  scroll = false as boolean
  isLoading = false as boolean
  conversations = [] as Array<any>

  created () {
    this.onGroupConversationCreated()
    this.handleMessageForward()
  }

  onGroupConversationCreated (): void {
    EventBus.$on('group-conversation-created', (conversation: object) => {
      console.log(conversation)
      this.openConversation(conversation)
    })
  }

  openConversation (conversation: object): void {
    if (!this.isConversationActive(conversation)) {
      this.activeConversation = conversation
      this.setImagePreviewOpen(false)
      EventBus.$emit('conversation-opened', conversation)
      EventBus.$emit('open-conversation')
      // this.$emit('coversationopened')
    }
  }

  formatRecentMessageTime (time: string): string {
    // const datetime = new Date(time)
    const datetime = moment(time)
    return datetime.calendar(null, {
      sameDay: 'hh:mm a',
      lastDay: '[Yesterday]',
      lastWeek: 'DD/MM/YYYY',
      sameElse: 'DD/MM/YYYY'
    })
  }

  onScroll (): void {
    this.scroll = true
  }

  handleOpenPopUp (_id: string, refKey: string): void {
    const popup = this.$refs[refKey] as any
    popup[0].$refs['popup-body'].classList.remove('robin-zoomOut')

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

  isConversationActive (object: Object) {
    return Object.is(this.activeConversation, object)
  }

  async onArchiveChat (conversation: any): Promise<void> {
    const res = await this.$robin.archiveConversation(conversation._id, this.$user_token)

    if (!res.error) {
      this.$toasted.global.custom_success('Chat Archived')
      EventBus.$emit('regular-conversation.delete', conversation)
      EventBus.$emit('archived-conversation.add', conversation)
      this.$emit('refresh')
    }
  }

  handleMessageForward (): void {
    EventBus.$on('message.forward', (messages: any) => {
      console.log(messages)
      messages.forEach((msg: any) => {
        this.conversations.forEach((conversation: any, index: any) => {
          if (conversation._id === msg.conversation_id) {
            msg.content.timestamp = new Date()
            this.conversations[index].last_message = msg.content
            EventBus.$emit('regular-conversation.delete', this.conversations[index])
            EventBus.$emit('regular-conversation.add', this.conversations[index])
            this.$emit('refresh')
            // this.$regularConversations.splice(index, 1)
            // this.$regularConversations.unshift(conv)
          }
        })
        // this.$archivedConversations.forEach((conversation: any, index: any) => {
        //   if (conversation._id === msg.conversation_id) {
        //     msg.content.timestamp = new Date()
        //     this.$archivedConversations[index].last_message = msg.content
        //   }
        // })
      })
    })
  }

  searchConversation (searchText: string) {
    let searchData = [] as Array<any>
    this.isLoading = true
    // eslint-disable-next-line array-callback-return
    const data = this.conversations.filter((obj) => {
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
}
</script>

<style scoped>
.robin-side-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  position: relative;
  z-index: 0;
}

header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 3.563rem 1.5rem 1.5rem;
}

.robin-wrapper {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.robin-card-container {
  width: 100%;
  overflow-y: auto;
}

.robin-card {
  border-bottom: 1px solid #f4f6f8;
  padding: 1rem 0.2rem 1.1rem 0.2rem;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
}

.robin-card-active {
  background-color: #f0f3f5;
  cursor: default;
}

.robin-card-active:hover {
  cursor: default;
  border-radius: 4px;
}

.robin-card-container .robin-card:nth-last-child(1) {
  border-bottom: none;
}

.robin-card:hover {
  background-color: #f0f3f5;
  border-radius: 4px;
}

.robin-card:hover .robin-hidden {
  display: block;
  animation: slideInRight 300ms;
}

.robin-popup-container {
  position: absolute;
  top: 58px;
  right: -5px;
  z-index: 100;
}

.robin-popup-container.top {
  top: -7%;
  right: 5px;
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
</style>
