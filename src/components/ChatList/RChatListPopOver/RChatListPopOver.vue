<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100" @click="conversation.unread_messages > 0 || conversation.unread_messages == 'marked' ? $emit('mark-as-read') :$emit('mark-as-unread')">
      <RText :font-size="14" color="#101010">{{ conversation.unread_messages > 0 || conversation.unread_messages == 'marked' ? 'Mark As Read' : 'Mark As Unread' }}</RText>
      <SvgIcon name="comment" color="#51545C" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('archive-chat')">
      <RText :font-size="14" color="#101010">Archive Chat</RText>
      <SvgIcon name="mailbox" color="#51545C" />
    </div>
    <!-- <div class="robin-wrapper robin-w-100" @click="$emit('mute-chat')">
      <RText :font-size="14" color="#101010">Mute Notifications</RText>
    </div> -->
    <!-- <div class="robin-wrapper robin-w-100" @click="$emit('delete-chat')">
      <RText :font-size="14" color="#D53120">Delete Chat</RText>
      <RTrash />
    </div> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import SvgIcon from '../../SvgIcon/SvgIcon.vue'
// import RTrash from '../RTrash/RTrash.vue'
import RText from '../RText/RText.vue'

const ComponentProps = Vue.extend({
  props: {
    conversation: {
      type: Object,
      default: () => {}
    }
  }
})

@Component({
  name: 'RChatListPopOver',
  components: {
    RText,
    SvgIcon
    // RTrash
  }
})
export default class RChatListPopOver extends ComponentProps {}
</script>

<style scoped>
.robin-popup {
  width: 174px;
  /* max-width: 174px; */
  /* padding: 0.5rem 0.75rem; */
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

/* .top.robin-zoomIn,
.top.robin-zoomOut {
  transform-origin: bottom right;
} */

.robin-zoomIn,
.robin-zoomOut {
  transform-origin: center center;
}
</style>
