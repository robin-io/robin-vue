<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" color="#101010">Reply</RText>
      <IconButton name="reply" :to-emit="false" :to-click-away="false" />
    </div>
    <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" color="#101010">Forward</RText>
      <IconButton name="forward" :to-emit="false" :to-click-away="false" />
      <!-- <RForwardButton /> -->
    </div>
    <!-- <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" color="#101010">Star</RText>
      <RStarButton />
    </div> -->
    <div class="robin-wrapper robin-w-100" @click="deleteMessage()">
      <RText :font-size="14" color="#101010">Delete</RText>
      <IconButton name="delete" :to-emit="false" :to-click-away="false" />
      <!-- <RDeleteButton /> -->
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import EventBus from '@/event-bus'
import RText from '@/components/ChatList/RText/RText.vue'
// import RReplyButton from '../RReplyButton/RReplyButton.vue'
// import RForwardButton from '../RForwardButton/RForwardButton.vue'
import IconButton from '../../IconButton.vue'
// import RStarButton from '../RStarButton/RStarButton.vue'
// import RDeleteButton from '../RDeleteButton/RDeleteButton.vue'

const ComponentProps = Vue.extend({
  props: {
    id: {
      type: String as PropType<string>,
      default: ''
    },
    message: {
      type: [Object, Array],
      default: () => {}
    }
  }
})

@Component({
  name: 'RMessagePopOver',
  components: {
    RText,
    IconButton
    // RReplyButton,
    // RForwardButton,
    // RStarButton,
    // RDeleteButton
  }
})
export default class RMessagePopOver extends ComponentProps {
  async deleteMessage (): Promise<void> {
    this.$emit('close-modal')

    const res = await this.$robin.deleteMessages([this.id], this.$user_token)

    if (res && !res.error) {
      EventBus.$emit('message-deleted', this.message)
      this.$toasted.global.custom_success('Message Deleted.')
    } else {
      this.$toasted.global.custom_error('Check your connection.')
    }
  }
}
</script>

<style scoped>
.robin-popup {
  width: 200px;
  max-width: 220px;
  padding: 0.5rem 0.75rem;
  border-radius: 16px;
  background-color: #ffffff;
}

.robin-wrapper {
  border-top: 1px solid #f4f6f8;
  padding: 0.813rem 0.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  justify-content: space-between;
}

.robin-wrapper:first-child {
  border: none;
}

.robin-wrapper:hover {
  background-color: rgba(244, 246, 248, 0.8);
}
</style>
