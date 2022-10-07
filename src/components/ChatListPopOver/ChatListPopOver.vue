<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100" @click="conversation.unread_messages > 0 || conversation.unread_messages == 'marked' ? $emit('mark-as-read') : $emit('mark-as-unread')">
      <Content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'">{{ conversation.unread_messages > 0 || conversation.unread_messages == 'marked' ? 'Mark As Read' : 'Mark As Unread' }}</Content>
      <SvgIcon name="comment" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('archive-chat')" v-if="isArchiveChatEnabled">
      <Content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'">Archive Chat</Content>
      <SvgIcon name="mailbox" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('delete-conversation')" v-if="isDeleteMessagesEnabled">
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
      default: () => {}
    }
  }
})

@Component({
  name: 'ChatListPopOver',
  components: {
    Content,
    SvgIcon
  }
})
export default class ChatListPopOver extends ComponentProps {
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

<style scoped>
.robin-popup {
  width: 174px;
  border-radius: 6px;
  border: 1px solid var(--rb-color2);
  background-color: var(--rb-bg-color);
}

.robin-wrapper {
  border-top: 1px solid var(--rb-color5);
  padding: 0.813rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.robin-wrapper:first-child {
  border: none;
  border-radius: 6px 6px 0 0;
}

.robin-wrapper:last-child {
  border-radius: 0 0 6px 6px;
}

.robin-wrapper:hover {
  background-color: var(--rb-color6);
}

.robin-zoomIn,
.robin-zoomOut {
  transform-origin: center center;
}
</style>
