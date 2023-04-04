<template>
  <div
    v-if="unread > 0 && unread <= 9"
    class="robin-unread-message-count"
    data-testid="unread-count"
  >
    {{ unread }}
  </div>
  <div v-else-if="unread > 9" class="robin-unread-message-count" data-testid="unread-count">9+</div>
  <div v-else class="robin-unread-message-count" data-testid="unread-count"></div>
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
