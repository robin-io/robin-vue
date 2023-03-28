<template>
  <div class="robin-failed-message-indicator">
    <message-content :font-size="14" color="#EA8D51" textWrap="pre-line" wordBreak="break-word" as="span">
      Failed to send.
    </message-content>

    <custom-button emit="clicked" @clicked="showModal"> <svg-icon name="failedToSend" /> </custom-button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import EventBus from '@/event-bus'
import Content from '@/components/Content/Content.vue'
import Button from '@/components/Button/Button.vue'
import SvgIcon from '../SvgIcon/SvgIcon.vue'

@Component({
  name: 'FailedMessageIndicator',
  components: {
    'message-content': Content,
    'custom-button': Button,
    SvgIcon
  }
})
export default class FailedMessageIndicator extends Vue {
  showModal () {
    EventBus.$emit('moderated-word-found')
  }
}
</script>
