<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" color="#101010">Archive Chat</RText>
    </div>
    <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" color="#101010">Mute Notifications</RText>
    </div>
    <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" color="#101010">Delete Chat</RText>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import RText from '../RText/RText.vue'

@Component({
  name: 'RChatListPopOver',
  components: {
    RText
  }
})
export default class RChatListPopOver extends Vue {}
</script>

<style scoped>
.robin-popup {
  width: 174px;
  /* max-width: 174px; */
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(35, 107, 248, 0.2);
  border-radius: 24px;
  background-color: #fff;
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
