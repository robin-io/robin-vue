<template>
  <div class="robin-shim robin-fadeIn" @click.self="closeModal()">
    <div class="robin-card">
      <div class="robin-wrapper robin-clickable" @click="assignModerator()" v-if="!isParticipantModerator">
        <RText :font-size="18" color="#15AE73">{{ !isParticipantModerator ? 'Assign moderator' : 'Dismiss as moderator' }}</RText>
      </div>
      <div class="robin-wrapper robin-clickable" @click="removeGroupParticipant()">
        <RText :font-size="18" color="#D53120">Remove participant</RText>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/store/index'
import Component from 'vue-class-component'
import RText from '@/components/ChatList/RText/RText.vue'
import EventBus from '@/event-bus'

@Component({
  name: 'GroupPrompt',
  components: {
    RText
  }
})
export default class GroupPrompt extends Vue {
  get currentConversation () {
    return store.state.currentConversation
  }

  get currentParticipantToken () {
    return store.state.currentParticipantToken
  }

  get isParticipantModerator () {
    return store.state.isParticipantModerator
  }

  closeModal () {
    store.setState('groupPromptOpen', false)
  }

  async assignModerator () {
    const res = await this.$robin.assignGroupModerator(this.currentConversation._id, this.currentParticipantToken)

    if (res && !res.error) {
      EventBus.$emit('participant.assigned.moderator', res.data)
      this.closeModal()
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  async removeGroupParticipant () {
    const res = await this.$robin.removeGroupParticipant(this.currentConversation._id, this.currentParticipantToken)

    if (res && !res.error) {
      EventBus.$emit('participant.left.group', { conversation_id: this.currentConversation._id, user_token: this.currentParticipantToken })
      this.closeModal()
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
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
  background-color: #fff;
  border-radius: 8px;
  width: 264px;
}

.robin-wrapper {
  border-top: 1px solid #EFEFEF;
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
  background-color: rgba(244, 246, 248, 0.8);
}

.robin-wrapper:first-child {
  border: none;
}
</style>
