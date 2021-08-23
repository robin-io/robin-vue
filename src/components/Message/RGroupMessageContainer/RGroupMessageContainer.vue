<template>
  <div class="robin-message-container">
    <RGroupChatHeader :conversation="conversation" />
    <div
      class="robin-wrapper robin-flex robin-flex-column robin-flex-space-between"
    >
      <Promised :promise="promise">
        <template v-slot:pending>
          <div class="robin-inner-wrapper robin-flex robin-flex-align-center">
            <div class="robin-spinner"></div>
          </div>
        </template>
        <template v-slot:default>
          <div class="robin-inner-wrapper" ref="messages">
            <div
              class="robin-message-bubble robin-flex robin-flex-wrap"
              :class="
                message.content.receiver_token === $user_token
                  ? 'robin-message-sender'
                  : 'robin-message-receiver robin-ml-auto'
              "
              v-for="message in messages"
              :key="message._id"
            >
              <RText
                v-if="conversation.isGroup"
                text="Precious Ogar"
                :fontSize="12"
                color="#15AE73"
                as="span"
                :lineHeight="20"
              />
              <RText
                :text="message.content.msg"
                :fontSize="16"
                :textWrap="'normal'"
                as="span"
              />
              <span
                class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto"
              >
                <RText
                  :text="formatTimeStamp(message.content.timestamp)"
                  :fontSize="14"
                  color="#7a7a7a"
                  as="p"
                />
              </span>
            </div>
          </div>
        </template>
      </Promised>
      <!-- <RUnreadMessageBar :number="1" /> -->
    </div>
    <RMessageInputBar :conversation="conversation" />
    <!-- <RForwardMessage /> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Promised } from 'vue-promised'
import EventBus from '@/event-bus'
import Component from 'vue-class-component'
import RGroupChatHeader from '../RGroupChatHeader/RGroupChatHeader.vue'
import RMessageInputBar from '../RMessageInputBar/RMessageInputBar.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import moment from 'moment'
// import RUnreadMessageBar from '../RUnreadMessagesBar/RUnreadMessagesBar.vue'
// import RForwardMessage from '../RForwardMessage/RForwardMessage.vue'

@Component({
  name: 'RGroupMessageContainer',
  components: {
    RGroupChatHeader,
    RText,
    RMessageInputBar,
    Promised
    // RUnreadMessageBar
    // RForwardMessage
  }
})
export default class RGroupMessageContainer extends Vue {
  text = ''
  conversation = {} as any
  messages = [] as any
  promise = null as any

  created() {
    EventBus.$on('conversation-opened', (conversation: any) => {
      this.messages = []
      this.conversation = conversation
      this.promise = this.getConversationMessages(conversation._id)
    })
    EventBus.$on('new-message', (message: any) => {
      if (message.conversation_id === this.conversation._id) {
        this.messages.push(message)
      }
      this.$conversations.forEach((conversation, index) => {
        if (conversation._id === this.conversation._id) {
          this.$conversations[index].updated_at = message.content.timestamp
          this.$conversations[index].last_message = message.content.msg
          const newConv = this.$conversations[index]
          this.$conversations.splice(index, 1)
          this.$conversations.unshift(newConv)
        }
      })
    })
  }

  formatTimeStamp(value: any) {
    return moment(String(value)).format('h:mma').toUpperCase()
  }

  async getConversationMessages(id: string) {
    const resp = await this.$robin.getConversationMessages(id)

    if (!resp.error) {
      this.messages = resp.data == null ? [] : resp.data
    }

    console.log(this.messages)
    this.scrollToBottom()
  }

  scrollToBottom() {
    window.setTimeout(() => {
      const messages = this.$refs.messages as HTMLElement
      messages.scrollTop = 10000000
    }, 100)
  }
}
</script>

<style scoped>
.robin-message-container {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  /* box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.07); */
}

.robin-wrapper {
  flex: 1;
  height: 100%;
  overflow-y: hidden;
  background-color: #fafafa;
}

.robin-inner-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 2.688rem 2.688rem 1.25rem 3.125rem;
  overflow-y: auto;
  scroll-behavior: smooth;
}

/* Bubble styles */

.robin-message-sender + .robin-message-receiver {
  margin-top: 1rem;
}

.robin-message-sender + .robin-message-sender,
.robin-message-receiver + .robin-message-receiver {
  margin-top: 0.25rem;
}

.robin-message-sender + .robin-message-receiver {
  border-radius: 16px 16px 0px 16px;
}

.robin-message-receiver + .robin-message-sender {
  border-radius: 16px 16px 16px 0px;
}

.robin-inner-wrapper .robin-message-sender:last-child {
  border-radius: 16px 16px 16px 0px;
}

.robin-inner-wrapper .robin-message-receiver:last-child {
  border-radius: 16px 16px 0px 16px;
}

.robin-message-sender {
  background-color: #f4f6f8;
  border: 1px solid rgba(35, 107, 248, 0.2);
}

.robin-message-receiver {
  background-color: #d3d7ea;
}

.robin-message-bubble {
  position: relative;
  box-sizing: border-box;
  border-radius: 16px;
  width: 100%;
  max-width: 325px;
  padding: 0.5rem 1rem;
  margin-top: 10px;
}

.robin-message-text {
  font-size: 1rem;
}

.robin-message-time {
  font-size: 0.75rem;
  color: #7a7a7a;
}
</style>
