<template>
  <div class="robin-popup-container">
    <div class="robin-wrapper robin-w-100">
      <div class="robin-mr-9">
        <RPhotoButton />
      </div>
      <RText text="Camera" :fontSize="14" color="#101010" />
    </div>
    <div class="robin-wrapper robin-w-100">
      <div class="robin-mr-9">
        <RGalleryButton />
      </div>
      <RText text="Photos & Videos" :fontSize="14" color="#101010" />
    </div>
    <div class="robin-wrapper robin-w-100">
      <div class="robin-mr-9">
        <RDocumentButton />
      </div>
      <RText text="Document" :fontSize="14" color="#101010" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RText from '@/components/ChatList/RText/RText.vue'
import RPhotoButton from '../RPhotoButton/RPhotoButton.vue'
import RGalleryButton from '../RGalleryButton/RGalleryButton.vue'
import RDocumentButton from '../RDocumentButton/RDocumentButton.vue'

export default Vue.extend({
  name: 'RAttachFilePopOver',
  components: {
    RText,
    RPhotoButton,
    RGalleryButton,
    RDocumentButton
  }
})
</script>

<style scoped>
.robin-popup-container {
  width: 100%;
  max-width: 178px;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(35, 107, 248, 0.2);
  border-radius: 24px;
  background-color: #ffffff;
}

.robin-wrapper {
  border-top: 1px solid #f4f6f8;
  padding: 0.813rem 0.5rem;
  display: flex;
  align-items: center;
}

.robin-wrapper:first-child {
  border: none;
}
</style>
