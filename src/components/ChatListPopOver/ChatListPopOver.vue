<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100" @click="conversation.unread_messages > 0 || conversation.unread_messages == 'marked' ? $emit('mark-as-read') :$emit('mark-as-unread')">
      <Content :font-size="14" color="#101010">{{ conversation.unread_messages > 0 || conversation.unread_messages == 'marked' ? 'Mark As Read' : 'Mark As Unread' }}</Content>
      <SvgIcon name="comment" color="#51545C" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('archive-chat')" v-if="isArchiveChatEnabled">
      <Content :font-size="14" color="#101010">Archive Chat</Content>
      <SvgIcon name="mailbox" color="#51545C" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('delete-conversation')" v-if="isDeleteMessagesEnabled">
      <Content :font-size="14" color="#D53120">Delete Chat</Content>
      <SvgIcon name="trash" />
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
  border: 1px solid #F5F7FC;
  border-radius: 6px;
  background-color: #fff;
}

.robin-wrapper {
  border-top: 1px solid #EFEFEF;
  padding: 0.813rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.robin-wrapper:hover {
  background-color: rgba(244, 246, 248, 0.8);
}

.robin-wrapper:first-child {
  border: none;
}

.robin-zoomIn,
.robin-zoomOut {
  transform-origin: center center;
}
</style>
