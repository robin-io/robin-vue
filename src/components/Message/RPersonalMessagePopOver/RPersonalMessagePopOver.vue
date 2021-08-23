<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100">
      <RText text="Contact Info" :fontSize="14" color="#101010" />
    </div>
    <div class="robin-wrapper robin-w-100">
      <RText text="Select Messages" :fontSize="14" color="#101010" />
    </div>
    <div class="robin-wrapper robin-w-100">
      <RText text="Clear Messages" :fontSize="14" color="#101010" />
    </div>
    <div class="robin-wrapper robin-w-100">
      <RText text="Delete Chat" :fontSize="14" color="#101010" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RText from '@/components/ChatList/RText/RText.vue'

export default Vue.extend({
  name: 'RPersonalMessagePopOver',
  components: {
    RText
  }
})
</script>

<style scoped>
.robin-popup {
  width: 174px;
  /* max-width: 174px; */
  padding: 0.5rem 0.563rem;
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

.robin-w-100 {
  width: 100%;
}

.robin-zoomIn,
.robin-zoomOut {
  transform-origin: top right;
}
</style>
