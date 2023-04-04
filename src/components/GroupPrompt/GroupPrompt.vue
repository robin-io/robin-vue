<template>
  <div class="robin-shim robin-fadeIn" @click.self="closeModal()">
    <div class="robin-card">
      <div
        class="robin-wrapper robin-clickable"
        @click="assignModerator()"
        v-if="!isParticipantModerator"
      >
        <message-content :font-size="18" color="#15AE73">{{
          !isParticipantModerator ? 'Assign moderator' : 'Dismiss as moderator'
        }}</message-content>
      </div>
      <div class="robin-wrapper robin-clickable" @click="removeGroupParticipant()">
        <message-content :font-size="18" color="#D53120">Remove participant</message-content>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import store from '@/store/index'
import Component, { mixins } from 'vue-class-component'
import Content from '@/components/Content/Content.vue'
import EventBus from '@/event-bus'
import ConversationMixin from '@/mixins/conversation-mixins'

@Component({
  name: 'GroupPrompt',
  components: {
    'message-content': Content
  }
})
export default class GroupPrompt extends mixins(ConversationMixin) {
  closeModal () {
    store.setState('groupPromptOpen', false)
  }

  async assignModerator () {
    const res = await this.$robin.assignGroupModerator(
      this.currentConversation._id,
      this.currentParticipantToken
    )

    if (res && !res.error) {
      EventBus.$emit('participant.assigned.moderator', res.data)
      this.closeModal()
    } else {
      this.showToast('Failed to assign moderator.', 'error')
    }
  }

  async removeGroupParticipant () {
    const res = await this.$robin.removeGroupParticipant(
      this.currentConversation._id,
      this.currentParticipantToken
    )

    if (res && !res.error) {
      // EventBus.$emit('participant.left.group', { conversation_id: this.currentConversation._id, user_token: this.currentParticipantToken })
      this.closeModal()
    } else {
      this.showToast('Failed to remove group participant.', 'error')
    }
  }
}
</script>

<style scoped>
.robin-shim {
  width: 100%;
  height: 100vh;
  background-color: rgba(81, 84, 92, 0.4);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}

.robin-card {
  background-color: var(--rb-bg-color);
  border-radius: 8px;
  width: 264px;
}

.robin-wrapper {
  border-top: 1px solid var(--rb-color5);
  padding: 0.813rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.robin-wrapper:first-child {
  border-radius: 8px 8px 0 0;
}

.robin-wrapper:last-child {
  border-radius: 0 0 8px 8px;
}

.robin-wrapper:hover {
  background-color: var(--rb-color6);
}

.robin-wrapper:first-child {
  border: none;
}
</style>
