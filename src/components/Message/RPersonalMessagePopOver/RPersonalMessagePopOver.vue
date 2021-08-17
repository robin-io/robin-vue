<template>
  <div class="robin-popup-container">
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
.robin-popup-container {
  width: 100%;
  max-width: 174px;
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
}

.robin-wrapper:first-child {
  border: none;
}

.robin-w-100 {
  width: 100%;
}
</style>
