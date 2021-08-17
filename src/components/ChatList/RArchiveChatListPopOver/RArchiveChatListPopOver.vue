<template>
  <div class="robin-popup-container">
    <div class="robin-wrapper robin-w-100">
      <RText text="Unarchive Chat" :fontSize="14" color="#101010" />
    </div>
    <div class="robin-wrapper robin-w-100">
      <RText text="Delete Chat" :fontSize="14" color="#101010" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RText from './RText/RText.vue'

export default Vue.extend({
  name: 'RChatListPopOver',
  components: {
    RText
  }
})
</script>

<style scoped>
.robin-popup-container {
  width: 100%;
  max-width: 174px;
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
}

.robin-wrapper:first-child {
  border: none;
}
</style>
