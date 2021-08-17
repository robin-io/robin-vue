<template>
  <div v-if="number > 1" class="robin-unread-message-bar">
    {{ number }} Unread Messages
  </div>
  <div v-else class="robin-unread-message-bar">{{ number }} Unread Message</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  name: 'RUnreadMessageBar',
  props: {
    number: {
      type: Number as PropType<number>,
      default: 0
    }
  }
})
</script>

<style scoped>
.robin-unread-message-bar {
  width: 100%;
  height: 28px;
  background: #f3f3f3;
  font-size: 1rem;
  line-height: 1.25rem;
  display: grid;
  place-items: center;
  margin: 1.813rem 0;
}
</style>
