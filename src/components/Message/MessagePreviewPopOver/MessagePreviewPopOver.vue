<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100" @click="$emit('download')">
      <RText :font-size="14" color="#101010">Save Image</RText>
      <IconButton name="imageDownload" :to-emit="false" :to-click-away="false" />
      <!-- <RImageDownloadButton /> -->
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('forward')">
      <RText :font-size="14" color="#101010">Forward</RText>
      <IconButton name="forward" :to-emit="false" :to-click-away="false" />
      <!-- <RForwardButton /> -->
    </div>
    <!-- <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" color="#101010">Reply</RText>
      <RReplyButton />
    </div>
    <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" color="#101010">Forward</RText>
      <RForwardButton />
    </div>
    <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" color="#101010">Star</RText>
      <RStarButton />
    </div> -->
    <div class="robin-wrapper robin-w-100" @click="$emit('delete')">
      <RText :font-size="14" color="#101010">Delete</RText>
      <IconButton name="delete" :to-emit="false" :to-click-away="false" />
      <!-- <RDeleteButton /> -->
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import RText from '@/components/ChatList/RText/RText.vue'
// import RDeleteButton from '../RDeleteButton/RDeleteButton.vue'
// import RForwardButton from '../RForwardButton/RForwardButton.vue'
import IconButton from '../../IconButton/IconButton.vue'
// import RImageDownloadButton from '../RImageDownloadButton/RImageDownloadButton.vue'

const ComponentProps = Vue.extend({
  props: {
    conversation: {
      type: Object,
      default: () => {}
    }
  }
})

@Component({
  name: 'MessagePreviewPopOver',
  components: {
    RText,
    // RDeleteButton,
    // RForwardButton,
    IconButton
    // RImageDownloadButton
  }
})
export default class MessagePreviewPopOver extends ComponentProps {}
</script>

<style scoped>
.robin-popup {
  width: 220px;
  /* max-width: 174px; */
  padding: 0.5rem 0.563rem;
  border: 1px solid rgba(35, 107, 248, 0.2);
  border-radius: 24px;
  background-color: #fff;
  will-change: transform;
}

.robin-wrapper {
  border-top: 1px solid #f4f6f8;
  padding: 0.813rem 0.5rem;
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
