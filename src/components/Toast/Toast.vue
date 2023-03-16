<template>
  <div v-if="type == 'success'" class="robin-toast robin-toast-success robin-come-up" @click="closeToast(message)">
    <div class="robin-toast-icon"></div>
    {{ message }}
  </div>

  <div v-else-if="type == 'error'" class="robin-toast robin-toast-error robin-come-up" @click="closeToast(message)">
    <div class="robin-toast-icon"></div>
    {{ message }}
  </div>

  <div v-else class="robin-toast robin-toast-info robin-come-up" @click="closeToast(message)">
    <div class="robin-toast-icon"></div>
    {{ message }}
  </div>
</template>

<script lang="ts">
import ConversationMixin from '@/mixins/conversation-mixins'
import Component, { mixins } from 'vue-class-component'

const ComponentProps = mixins(ConversationMixin).extend({
  props: {
    type: {
      type: String,
      default: 'Success'
    },
    message: {
      type: String,
      default: ''
    }
  }
})

@Component({
  name: 'Toast'
})
export default class Toast extends ComponentProps {
    closeToast!: (message: string) => void
}
</script>
