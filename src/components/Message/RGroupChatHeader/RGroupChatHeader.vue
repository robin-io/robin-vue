<template>
  <header>
    <div class="robin-card robin-flex robin-flex-align-center">
      <div class="robin-card-info robin-mr-16">
        <RGroupAvatar />
      </div>
      <div
        class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-flex-1"
      >
        <div class="robin-mt-6">
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
        </div>
        <div class="robin-mt-6">
          <RText
            as="p"
            :text="conversation.is_group ? conversation.participants : 'Online'"
            fontWeight="normal"
            color="#7A7A7A"
            :fontSize="14"
            :lineHeight="18"
          />
        </div>
      </div>
    </div>
    <div class="robin-ml-auto">
      <ROptionButton />
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import RGroupAvatar from '@/components/ChatList/RGroupAvatar/RGroupAvatar.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import ROptionButton from '../ROptionButton/ROptionButton.vue'
import { EventBus } from '@/App.vue'

export default Vue.extend({
  name: 'RGroupChatHeader',
  components: {
    RGroupAvatar,
    RText,
    ROptionButton
  },
  data: () => {
    return {
      conversation: {} as any
    }
  },
  created () {
    EventBus.$on('conversation-opened', (conversation: any) => {
      this.conversation = conversation
    })
  }
})
</script>

<style scoped>
header {
  width: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 1.938rem 2.688rem 1.375rem 3.125rem;
  position: relative;
  z-index: 2;
}

.robin-card-container {
  width: 100%;
}
</style>
