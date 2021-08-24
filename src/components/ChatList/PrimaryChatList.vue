<template>
  <div class="robin-side-container">
    <header class="robin-header">
      <RText
        text="Settings"
        fontWeight="400"
        color="rgba(83, 95, 137, 1)"
        :fontSize="17"
      />
      <REditButton @edit="$emit('changesidebartype', 'newchat')" />
    </header>
    <div class="robin-wrapper robin-w-100">
      <RSearchBar />
    </div>
    <div class="robin-wrapper robin-pt-10 robin-pb-11">
      <RTextButton @archived="$emit('changesidebartype', 'archivedchat')" />
    </div>
    <div
      class="robin-wrapper robin-card-container robin-flex robin-flex-column"
    >
      <div
        class="robin-card robin-relative robin-flex robin-flex-align-center"
        v-for="(conversation, index) in conversations"
        :key="conversation._id"
        @click.self="openConversation(conversation)"
      >
        <div
          class="robin-card-info robin-mr-12"
          @click="openConversation(conversation)"
        >
          <RAvatar />
        </div>
        <div
          class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-pt-4 robin-pb-4˝ robin-flex-1"
        >
          <div
            class="robin-flex robin-flex-space-between"
            @click="openConversation(conversation)"
          >
            <RText
              :text="
                conversation.sender_token != $user_token
                  ? conversation.sender_name
                  : conversation.receiver_name
              "
              fontWeight="normal"
              color="#000000"
              :fontSize="16"
              :lineHeight="20"
            />

            <RText
              as="p"
              :text="formatRecentMessageTime(conversation.updated_at)"
              fontWeight="normal"
              color="#566BA0"
              :fontSize="14"
              :lineHeight="18"
            />
          </div>
          <div class="robin-flex robin-flex-space-between">
            <div
              class="robin-mini-info-container robin-flex-1"
              @click="openConversation(conversation)"
            >
              <RText
                as="p"
                :text="
                  conversation.last_message == undefined
                    ? ''
                    : conversation.last_message.substring(0, 20) + ' ...'
                "
                fontWeight="normal"
                color="#7A7A7A"
                :fontSize="14"
                :lineHeight="18"
              />
            </div>

            <div
              class="robin-mini-info-container robin-flex robin-flex-align-center"
            >
              <RMention @click.native="openConversation(conversation)" />
              <!-- use when mention icon is present robin-ml-8 -->
              <div
                class="mini-info robin-ml-10"
                @click="openConversation(conversation)"
              >
                <RUnreadMessageCount :count="10" />
              </div>
              <div
                class="robin-hidden robin-ml-10"
                @click="handleOpenPopUp(conversation._id, `popup-${index}`)"
              >
                <ROpenModalCaretButton
                  @clickoutside="
                    handleClosePopUp(conversation._id, `popup-${index}`)
                  "
                />
              </div>
            </div>
          </div>
        </div>
        <div class="robin-popup-container" v-show="popUpStates[index].opened">
          <RChatListPopOver :ref="`popup-${index}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import moment from 'moment'
import Component from 'vue-class-component'
import EventBus from '@/event-bus'
import RText from './RText/RText.vue'
import REditButton from './REditButton/REditButton.vue'
import RSearchBar from './RSearchBar/RSearchBar.vue'
import RTextButton from './RTextButton/RTextButton.vue'
import RAvatar from './RAvatar/RAvatar.vue'
import ROpenModalCaretButton from './ROpenModalCaretButton/ROpenModalCaretButton.vue'
import RMention from './RMention/RMention.vue'
import RChatListPopOver from './RChatListPopOver/RChatListPopOver.vue'
// import RGroupAvatar from './RGroupAvatar/RGroupAvatar.vue'
import RUnreadMessageCount from './RUnreadMessageCount/RUnreadMessageCount.vue'

const ComponentProps = Vue.extend({
  props: {
    conversations: {
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
    RTextButton,
    RAvatar,
    RMention,
    ROpenModalCaretButton,
    // RGroupAvatar,
    RUnreadMessageCount,
    RChatListPopOver
  },
  watch: {
    conversations: {
      handler (val: Array<any>): void {
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
  popUpStates: Array<any> = []

  openConversation (conversation: object): void {
    console.log(conversation)
    EventBus.$emit('conversation-opened', conversation)
    this.$emit('coversationopened')
  }

  formatRecentMessageTime (time: string): string {
    // const datetime = new Date(time)
    const datetime = moment(time)
    return datetime.calendar(null, {
      sameDay: 'hh:ss a',
      lastDay: '[Yesterday]',
      lastWeek: 'DD/MM/YYYY',
      sameElse: 'DD/MM/YYYY'
    })
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
      if (this.popUpStates[index].opened) {
        const popup = this.$refs[refKey] as any
        popup[0].$refs['popup-body'].classList.remove('robin-zoomOut')

        this.popUpStates[index].opened = false
      }
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
}

.robin-card-container .robin-card {
  border-bottom: 1px solid #f4f6f8;
  padding: 1rem 0.2rem 1.1rem 0.2rem;
  transition: all 0.2s;
}

.robin-card-container:last-child .robin-card {
  border-bottom: none;
}

.robin-card:hover {
  background-color: #f0f3f5;
  border-radius: 4px;
  cursor: pointer;
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
</style>
