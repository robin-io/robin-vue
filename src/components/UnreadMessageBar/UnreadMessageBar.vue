<template>
  <div v-if="number > 1" class="robin-unread-message-bar">{{ number }} Unread Messages</div>
  <div v-else class="robin-unread-message-bar">{{ number }} Unread Message</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'

const ComponentProps = Vue.extend({
  props: {
    number: {
      type: Number as PropType<number>,
      default: 0
    }
  }
})

@Component({
  name: 'RUnreadMessageBar'
})
export default class RUnreadMessageBar extends ComponentProps {}
</script>
