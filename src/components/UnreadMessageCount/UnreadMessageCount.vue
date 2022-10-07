<template>
  <div v-if="unread > 0 && unread <= 9" class="robin-unread-messages" data-testid="unread-count">
    {{ unread }}
  </div>
  <div v-else-if="unread > 9" class="robin-unread-messages" data-testid="unread-count">9+</div>
  <div v-else class="robin-unread-messages" data-testid="unread-count"></div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

const ComponentProps = Vue.extend({
  props: {
    unread: {
      type: [Number, String],
      default: 0
    }
  }
})

@Component({
  name: 'UnreadMessageCount'
})
export default class UnreadMessageCount extends ComponentProps {}
</script>

<style scoped>
.robin-unread-messages {
  font-size: 0.875rem;
  border-radius: 20px;
  font-weight: 100;
  white-space: nowrap;
  width: 22px;
  height: 22px;
  padding: 0.2rem 0.25rem;
  min-width: 1.4rem;
  max-width: max-content;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--rb-bg-color2);
  color: var(--rb-color2);
  overflow: hidden;
}
</style>
