<template>
  <div class="robin-message-container">
    <RGroupChatHeader />
    <div
      class="robin-wrapper robin-flex robin-flex-column robin-flex-space-between"
    >
      <div class="robin-inner-wrapper">
        <div
          class="robin-message-bubble robin-message-sender robin-flex robin-flex-wrap"
        >
          <RText
            text="Precious Ogar"
            :fontSize="12"
            color="#15AE73"
            as="span"
            :lineHeight="20"
          />
          <RText
            text="Some very long text here to test
how far this bubble can go.  😂 😂 😂"
            :fontSize="16"
            :textWrap="'normal'"
            as="span"
          />
          <span
            class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto"
          >
            <RText text="3:00PM" :fontSize="14" color="#7a7a7a" as="p" />
          </span>
        </div>
        <RUnreadMessageBar :number="1" />
        <div
          class="robin-message-bubble robin-message-receiver robin-flex robin-flex-wrap robin-ml-auto"
        >
          <RText
            text="Some very long text here to test.  😂"
            :fontSize="16"
            as="span"
          />
          <span
            class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto"
          >
            <RText text="3:00PM" :fontSize="14" color="#7a7a7a" as="p" />
          </span>
        </div>
      </div>
      <div class="robin-message-box">
        <RMessageInputBar />
        <div class="robin-pl-25">
          <RAttachFileButton />
        </div>
        <div class="robin-pl-21">
          <RVoiceRecorderButton />
        </div>
      </div>
    </div>
    <!-- <RForwardMessage /> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RGroupChatHeader from '../RGroupChatHeader/RGroupChatHeader.vue'
import RMessageInputBar from '../RMessageInputBar/RMessageInputBar.vue'
import RVoiceRecorderButton from '../RVoiceRecorderButton/RVoiceRecorderButton.vue'
import RAttachFileButton from '../RAttachFileButton/RAttachFileButton.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import RUnreadMessageBar from '../RUnreadMessagesBar/RUnreadMessagesBar.vue'
// import RForwardMessage from '../RForwardMessage/RForwardMessage.vue'

export default Vue.extend({
  name: 'RMessageContainer',
  components: {
    RGroupChatHeader,
    RText,
    RMessageInputBar,
    RAttachFileButton,
    RVoiceRecorderButton,
    RUnreadMessageBar
    // RForwardMessage
  }
})
</script>

<style scoped>
.robin-message-container {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  /* box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.07); */
}

.robin-wrapper {
  flex: 1;
  height: 100%;
}

.robin-inner-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: #fafafa;
  padding: 2.688rem 2.688rem 1.25rem 3.125rem;
}

.robin-message-box {
  width: 100%;
  height: 44px;
  background-color: #fff;
  display: flex;
  align-items: center;
  box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.07);
  padding: 2.875rem 2.688rem 2.875rem 3.125rem;
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
}

.robin-message-text {
  font-size: 1rem;
}

.robin-message-time {
  font-size: 0.75rem;
  color: #7a7a7a;
}
</style>
