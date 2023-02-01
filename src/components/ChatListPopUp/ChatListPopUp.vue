<template>
  <div class="robin-chat-list-popup robin-zoomIn">
    <div class="robin-wrapper robin-w-100" @click="conversation.unread_messages > 0 || conversation.unread_messages == 'marked' ? $emit('mark-as-read') : $emit('mark-as-unread')" v-if="!isArchived">
      <Content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'">{{ conversation.unread_messages > 0 || conversation.unread_messages == 'marked' ? 'Mark As Read' : 'Mark As Unread' }}</Content>
      <SvgIcon name="comment" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('archive-chat')" v-if="isArchiveChatEnabled && !isArchived">
      <Content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'">Archive Chat</Content>
      <SvgIcon name="mailbox" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'" />
    </div>
    <div
      class="robin-wrapper robin-w-100"
      v-if="isArchived"
      @click="$emit('unarchive-chat')"
    >
      <Content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'"
        >Unarchive Chat</Content
      >
      <SvgIcon name="mailbox" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('delete-conversation')" v-if="isDeleteMessagesEnabled && !isArchived">
      <Content :font-size="14" color="#D53120">Delete Chat</Content>
      <SvgIcon name="trash" :color="currentTheme === 'light' ? '#D53120' : '#000000'" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import Content from '../Content/Content.vue'

const ComponentProps = Vue.extend({
  props: {
    conversation: {
      type: Object,
      default: () => ({})
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  }
})

@Component({
  name: 'ChatListPopUp',
  components: {
    Content,
    SvgIcon
  }
})
export default class ChatListPopUp extends ComponentProps {
  get currentTheme () {
    return store.state.currentTheme
  }

  get isDeleteMessagesEnabled () {
    return store.state.deleteMessagesEnabled
  }

  get isArchiveChatEnabled () {
    return store.state.archiveChatEnabled
  }
}
</script>
