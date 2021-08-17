<template>
  <div class="robin-popup-container">
    <div class="robin-wrapper robin-w-100">
      <RText text="Reply" :fontSize="14" color="#101010" />
      <RReplyButton />
    </div>
    <div class="robin-wrapper robin-w-100">
      <RText text="Forward" :fontSize="14" color="#101010" />
      <RForwardButton />
    </div>
    <div class="robin-wrapper robin-w-100">
      <RText text="Star" :fontSize="14" color="#101010" />
      <RStarButton />
    </div>
    <div class="robin-wrapper robin-w-100">
      <RText text="Delete" :fontSize="14" color="#101010" />
      <RDeleteButton />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RText from '@/components/ChatList/RText/RText.vue'
import RReplyButton from '../RReplyButton/RReplyButton.vue'
import RForwardButton from '../RForwardButton/RForwardButton.vue'
import RStarButton from '../RStarButton/RStarButton.vue'
import RDeleteButton from '../RDeleteButton/RDeleteButton.vue'

export default Vue.extend({
  name: 'RMessagePopOver',
  components: {
    RText,
    RReplyButton,
    RForwardButton,
    RStarButton,
    RDeleteButton
  }
})
</script>

<style scoped>
.robin-popup-container {
  width: 100%;
  max-width: 220px;
  padding: 0.5rem 0.75rem;
  border-radius: 16px;
  background-color: #ffffff;
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
