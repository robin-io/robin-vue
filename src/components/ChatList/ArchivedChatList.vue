<template>
  <!-- eslint-disable vue/no-parsing-error -->
  <div class="robin-side-container" ref="popup-body">
    <header class="robin-header">
      <RText fontWeight="400" color="rgba(83, 95, 137, 1)" :fontSize="17"> Archived Chats </RText>
      <RCloseButton @close="$emit('closemodal', 'primary')" />
    </header>
    <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-mt-42" @scroll="onScroll()">
      <div class="robin-card robin-flex robin-flex-align-center" :class="{ 'robin-card-active': isConversationActive(conversation) }" v-for="(conversation, index) in conversations" :key="`conversation-${index}`" @click.self="openConversation(conversation)" v-show="conversations.length > 0">
        <div class="robin-card-info robin-mr-12" @click="openConversation(conversation)">
          <RAvatar v-if="!conversation.is_group" />
          <RGroupAvatar v-else />
        </div>
        <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-pt-4 robin-pb-4˝ robin-flex-1">
          <div class="robin-flex robin-flex-space-between" @click="openConversation(conversation)">
            <RText fontWeight="normal" color="#000000" :fontSize="16" :lineHeight="20" v-if="!conversation.is_group"> {{ conversation.sender_token != $user_token ? conversation.sender_name : conversation.receiver_name }} </RText>
            <RText font-weight="normal" color="#000000" :font-size="16" :line-height="20" v-else>
              {{ conversation.name }}
            </RText>
            <RText as="p" fontWeight="normal" color="#566BA0" :fontSize="10" :lineHeight="18"> {{ formatRecentMessageTime(conversation.last_message ? conversation.last_message.timestamp : conversation.updated_at) }} </RText>
          </div>
          <div class="robin-flex robin-flex-space-between" @click.self="openConversation(conversation)">
            <RText as="p" fontWeight="normal" color="#7A7A7A" :fontSize="14" :lineHeight="18" @click.native="openConversation(conversation)"> {{ conversation.last_message && conversation.last_message.msg.length < 20 ? conversation.last_message.msg : conversation.last_message ? conversation.last_message.msg.substring(0, 20) + ' ...' : '' }} </RText>
            <div class="robin-mini-info-container robin-flex robin-flex-align-center">
              <RText as="p" fontWeight="normal" color="#15AE73" :fontSize="12" @click.native="openConversation(conversation)"> Archived </RText>
              <div class="robin-hidden robin-ml-10" @click="handleOpenPopUp(conversation._id, `popup-${index}`)">
                <ROpenModalCaretButton @clickoutside="handleClosePopUp(conversation._id, `popup-${index}`)" />
              </div>
            </div>
          </div>
        </div>
        <div class="robin-popup-container" :class="{ top: scrollValidate(index) }" v-show="popUpStates[index].opened">
          <RArchiveChatListPopOver :ref="`popup-${index}`" :class="{ top: scrollValidate(index) }" @unarchive-chat="unArchiveChat(conversation._id)" />
        </div>
      </div>
      <div v-show="conversations.length < 1" class="robin-flex robin-flex-justify-center">
        <RText :font-size="18" color="#15AE73">No archived chat</RText>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import moment from 'moment'
import { Mutation } from 'vuex-class'
import Component from 'vue-class-component'
import EventBus from '@/event-bus'
import RText from './RText/RText.vue'
import RCloseButton from './RCloseButton/RCloseButton.vue'
import RAvatar from './RAvatar/RAvatar.vue'
import RGroupAvatar from './RGroupAvatar/RGroupAvatar.vue'
import ROpenModalCaretButton from './ROpenModalCaretButton/ROpenModalCaretButton.vue'
import RArchiveChatListPopOver from './RArchiveChatListPopOver/RArchiveChatListPopOver.vue'

const ComponentProps = Vue.extend({
  props: {
    conversations: {
      type: Array,
      default: (): Array<any> => []
    }
  }
})

// eslint-disable-next-line
@Component<ArchivedChatList>({
  name: 'ArchivedChatList',
  components: {
    RText,
    RCloseButton,
    RAvatar,
    RGroupAvatar,
    ROpenModalCaretButton,
    RArchiveChatListPopOver
  },
  watch: {
    conversations: {
      handler(val: Array<any>): void {
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
export default class ArchivedChatList extends ComponentProps {
  @Mutation('setImagePreviewOpen') setImagePreviewOpen: any

  popUpStates: Array<any> = []
  activeConversation = {}
  scroll = false as boolean

  scrollValidate(index: number) {
    return (this.conversations.length > 3 && this.scroll && this.conversations.length - 2 === index) || (this.conversations.length > 3 && this.scroll && this.conversations.length - 1 === index)
  }

  openConversation(conversation: object): void {
    if (!this.isConversationActive(conversation)) {
      this.activeConversation = conversation
      this.setImagePreviewOpen(false)
      EventBus.$emit('conversation-opened', conversation)
      EventBus.$emit('open-conversation')
      // this.$emit('coversationopened')
    }
  }

  isConversationActive(object: Object) {
    return Object.is(this.activeConversation, object)
  }

  handleOpenPopUp(_id: string, refKey: string): void {
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

  handleClosePopUp(_id: string, refKey: string): void {
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

  formatRecentMessageTime(time: string): string {
    const datetime = moment(time)
    return datetime.calendar(null, {
      sameDay: 'hh:ss a',
      lastDay: '[Yesterday]',
      lastWeek: 'DD/MM/YYYY',
      sameElse: 'DD/MM/YYYY'
    })
  }

  onScroll(): void {
    this.scroll = true
  }

  async unArchiveChat(id: string): Promise<void> {
    const res = await this.$robin.unarchiveConversation(id, this.$user_token)
    console.log('unarchived', res)

    if (!res.error) {
      this.$toasted.global.custom_success('Chat Unarchived')
      const index = this.conversations.findIndex((conversation) => conversation._id === id)
      const conversation = this.conversations[index]

      EventBus.$emit('archived-conversation.delete', conversation)
      EventBus.$emit('regular-conversation.add', conversation)
      this.$emit('refresh')
    }
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
  z-index: 1;
  background-color: #fff;
}

header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 3.563rem 1.5rem 1.5rem;
}

.robin-wrapper {
  padding: 0 1.5rem;
}

.robin-card-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.robin-card-container .robin-card {
  border-bottom: 1px solid #f4f6f8;
  padding: 1rem 0 1.1rem;
  transition: all 0.15s;
  position: relative;
}

.robin-card-container:last-child .robin-card {
  border-bottom: none;
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
  position: absolute;
  top: 75%;
  right: 0px;
  z-index: 100;
}

.robin-popup-container.top {
  top: -60%;
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
