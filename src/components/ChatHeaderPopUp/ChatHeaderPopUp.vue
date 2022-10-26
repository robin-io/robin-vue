<template>
  <div v-if="!isGroup" class="robin-chat-header-popup robin-zoomIn" id="chat-header-popup">
    <div class="robin-wrapper robin-w-100" @click="$emit('view-profile')">
      <message-content :font-size="14" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'">
        Contact Info
      </message-content>

      <svg-icon name="user-circle" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'" />
    </div>
    <div
      class="robin-wrapper robin-w-100"
      @click="handleSelectMessages()"
      v-if="
        isForwardMessagesEnabled ||
        isDeleteMessagesEnabled ||
        (isForwardMessagesEnabled && isDeleteMessagesEnabled)
      "
    >
      <message-content :font-size="14" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
        >Select Messages</message-content
      >

      <svg-icon name="check-circle" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'" />
    </div>
    <div
      class="robin-wrapper robin-w-100"
      @click="handleClearMessages()"
      v-if="isDeleteMessagesEnabled"
    >
      <message-content :font-size="14" color="#D53120">Delete Chat</message-content>

      <svg-icon name="trash" :color="currentTheme === 'light' ? '#D53120' : '#000'" />
    </div>
  </div>

  <div v-else class="robin-chat-header-popup robin-zoomIn" id="chat-header-popup">
    <div
      class="robin-wrapper robin-w-100"
      @click="$emit('view-profile')"
      data-testid="view-group-profile"
    >
      <message-content :font-size="14" as="span" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
        >Group Info</message-content
      >

      <svg-icon name="user-circle" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="handleSelectMessages()">
      <message-content :font-size="14" as="span" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
        >Select Messages</message-content
      >

      <svg-icon name="check-circle" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="handleLeaveGroup()">
      <message-content :font-size="14" as="span" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
        >Leave Group</message-content
      >

      <svg-icon name="times-square" :color="currentTheme === 'light' ? '#D53120' : '#000'" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import Content from '@/components/Content/Content.vue'

const ComponentProps = Vue.extend({
  props: {
    isGroup: {
      type: Boolean,
      default: false
    }
  }
})

@Component({
  name: 'ChatHeaderPopUp',
  components: {
    'message-content': Content,
    SvgIcon
  }
})
export default class ChatHeaderPopUp extends ComponentProps {
  get currentTheme () {
    return store.state.currentTheme
  }

  get isDeleteMessagesEnabled () {
    return store.state.deleteMessagesEnabled
  }

  get isForwardMessagesEnabled () {
    return store.state.forwardMessagesEnabled
  }

  async handleLeaveGroup () {
    store.setState('exitGroup', true)
  }

  handleSelectMessages () {
    store.setState('selectMessagesOpen', true)
  }

  handleClearMessages () {
    store.setState('clearMessages', true)
  }
}
</script>
