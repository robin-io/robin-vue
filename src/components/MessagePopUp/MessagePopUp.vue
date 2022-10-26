<template>
  <div class="robin-message-popup robin-zoomIn" id="message-popup">
    <div
      class="robin-wrapper robin-w-100"
      @click="$emit('reply-message')"
      data-testid="reply-button"
      v-if="isReplyMessagesEnabled"
    >
      <message-content :font-size="14" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
        >Reply Message</message-content
      >
      <svg-icon
        name="reply"
        :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
        :to-emit="false"
        :to-click-away="false"
      />
    </div>
    <div
      class="robin-wrapper robin-w-100"
      @click="forwardMessage"
      data-testid="forward-button"
      v-if="isForwardMessagesEnabled"
    >
      <message-content :font-size="14" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
        >Forward</message-content
      >
      <svg-icon
        name="forward"
        :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
        :to-emit="false"
        :to-click-away="false"
      />
    </div>
    <div
      class="robin-wrapper robin-w-100"
      @click="selectMessage"
      data-testid="select-button"
      v-if="
        isForwardMessagesEnabled ||
        isDeleteMessagesEnabled ||
        (isForwardMessagesEnabled && isDeleteMessagesEnabled)
      "
    >
      <message-content :font-size="14" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
        >Select Message</message-content
      >
      <svg-icon
        name="select"
        :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
        :to-emit="false"
        :to-click-away="false"
      />
    </div>
    <div
      class="robin-wrapper robin-w-100"
      @click="resendMessage"
      data-testid="delete-button"
      v-if="message.failed"
    >
      <message-content :font-size="14" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
        >Resend</message-content
      >
      <svg-icon
        name="forward"
        :to-emit="false"
        :to-click-away="false"
        :color="currentTheme === 'light' ? '#D53120' : '#000'"
      />
    </div>
    <div
      class="robin-wrapper robin-w-100"
      @click="deleteMessage"
      data-testid="delete-button"
      v-if="isDeleteMessagesEnabled"
    >
      <message-content :font-size="14" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
        >Delete Message</message-content
      >
      <svg-icon
        name="trash"
        :to-emit="false"
        :to-click-away="false"
        :color="currentTheme === 'light' ? '#D53120' : '#000'"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/store/index'
import Component from 'vue-class-component'
import EventBus from '@/event-bus'
import Content from '@/components/Content/Content.vue'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'

const ComponentProps = Vue.extend({
  props: {
    message: {
      type: Object,
      default: () => {}
    }
  }
})

@Component({
  name: 'MessagePopUp',
  components: {
    'message-content': Content,
    SvgIcon
  }
})
export default class MessagePopUp extends ComponentProps {
  get currentTheme () {
    return store.state.currentTheme
  }

  get isDeleteMessagesEnabled () {
    return store.state.deleteMessagesEnabled
  }

  get isForwardMessagesEnabled () {
    return store.state.forwardMessagesEnabled
  }

  get isReplyMessagesEnabled () {
    return store.state.replyMessagesEnabled
  }

  deleteMessage () {
    this.$emit('delete-message')
    this.$emit('close-modal')
  }

  selectMessage () {
    store.setState('selectMessagesOpen', true)
    this.$emit('select-message')
  }

  forwardMessage () {
    store.setState('selectMessagesOpen', true)
    this.$emit('select-message')
    this.$emit('forward-message')
  }

  resendMessage () {
    EventBus.$emit('manual.send', this.message)
  }
}
</script>
