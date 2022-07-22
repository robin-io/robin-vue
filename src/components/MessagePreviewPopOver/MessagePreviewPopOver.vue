<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100" @click="$emit('download')" data-testid="download-button">
      <Content :font-size="14" color="#101010">Save Image</Content>
      <IconButton name="imageDownload" :to-emit="false" :to-click-away="false" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('reply')" data-testid="reply-button" v-if="isReplyMessagesEnabled">
      <Content :font-size="14" color="#101010">Reply Message</Content>
      <IconButton name="reply" :to-emit="false" :to-click-away="false" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('forward')" data-testid="forward-button" v-if="isForwardMessagesEnabled">
      <Content :font-size="14" color="#101010">Forward</Content>
      <IconButton name="forward" :to-emit="false" :to-click-away="false" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('delete')" data-testid="delete-button" v-if="isDeleteMessagesEnabled">
      <Content :font-size="14" color="#101010">Delete Message</Content>
      <IconButton name="delete" :to-emit="false" :to-click-away="false" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import Content from '@/components/Content/Content.vue'
import IconButton from '@/components/IconButton/IconButton.vue'

@Component({
  name: 'MessagePreviewPopOver',
  components: {
    Content,
    IconButton
  }
})
export default class MessagePreviewPopOver extends Vue {
  get isDeleteMessagesEnabled () {
    return store.state.deleteMessagesEnabled
  }

  get isForwardMessagesEnabled () {
    return store.state.forwardMessagesEnabled
  }

  get isReplyMessagesEnabled () {
    return store.state.replyMessagesEnabled
  }
}
</script>

<style scoped>
.robin-popup {
  width: 220px;
  /* max-width: 174px; */
  /* padding: 0.5rem 0.563rem; */
  border: 1px solid #F5F7FC;
  border-radius: 6px;
  background-color: #fff;
  will-change: transform;
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
  transform-origin: top right;
}
</style>
