<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <RText class="robin-wrapper robin-w-100" max-width="100%" :font-size="14" color="#101010" as="label" for-ref="camera-upload" @click.native="$emit('open-camera')">
      <div class="robin-mr-9">
        <IconButton name="photo" :to-emit="true" :to-click-away="false" />
        <!-- <RPhotoButton /> -->
      </div>
      Camera
    </RText>
    <RText class="robin-wrapper robin-w-100" max-width="100%" as="label" :font-size="14" color="#101010" for-ref="photo-upload" ref="photo-upload">
      <div class="robin-mr-9">
        <IconButton name="gallery" emit="clicked" :to-emit="true" :to-click-away="false" @clicked="openFileDialog('photo-upload')" />
        <!-- <RGalleryButton @clicked="openFileDialog('photo-upload')" /> -->
      </div>
      <input  :style="{display: 'none'}" type="file" multiple :accept="acceptedVisualFiles" @change="handleFileChange($event.target.files)" @click="resetFileTarget($event)" id="photo-upload" />
      Photos & Videos
    </RText>
    <RText as="label" for-ref="document-upload" :font-size="14" max-width="100%" color="#101010" class="robin-wrapper robin-w-100" ref="document-upload">
      <div class="robin-mr-9">
        <IconButton name="document" emit="clicked" :to-emit="true" :to-click-away="false" @clicked="openFileDialog('document-upload')" />
        <!-- <RDocumentButton @clicked="openFileDialog('document-upload')" /> -->
      </div>
      <input type="file" :style="{display: 'none'}" multiple :accept="acceptedDocFiles" @change="handleFileChange($event.target.files)" @click="resetFileTarget($event)" id="document-upload" />
      Document
    </RText>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import RText from '@/components/ChatList/RText/RText.vue'
import IconButton from '../../IconButton/IconButton.vue'
// import RPhotoButton from '../RPhotoButton/RPhotoButton.vue'
// import RGalleryButton from '../RGalleryButton/RGalleryButton.vue'
// import RDocumentButton from '../RDocumentButton/RDocumentButton.vue'

@Component({
  name: 'RAttachFilePopOver',
  components: {
    RText,
    IconButton
    // RPhotoButton,
    // RGalleryButton,
    // RDocumentButton
  }
})
export default class RAttachFilePopOver extends Vue {
  acceptedDocFiles = '.csv, .xlsx, .xls, .doc, .docx, .ppt, .pptx, .txt, .pdf, .html, .7z, .zip, .rtf, .rar, .tar, .odt, .md' as string
  acceptedVisualFiles = 'image/*, video/*, video/mp4' as string

  resetFileTarget (event: any): void {
    event.target.value = ''
  }

  handleFileChange (files: any): void {
    ;[...files].forEach(async (file: any) => {
      const fileURL = URL.createObjectURL(file)
      const typeIndex = file.name.lastIndexOf('.')

      if (file.size < 5000001) {
        this.$emit('file-upload', {
          name: file.name.substring(0, typeIndex),
          size: file.size,
          type: file.type,
          extension: file.name.substring(typeIndex + 1),
          localUrl: fileURL,
          file: file
        })
      } else {
        this.$toasted.global.custom_error('Image upload cannot be more than 5mb')
      }
    })
  }

  openFileDialog (id: string) {
    const label = this.$refs[id] as any
    label.$el.click()
  }
}
</script>

<style scoped>
.robin-popup {
  width: 178px;
  /* max-width: 178px; */
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
  cursor: pointer;
  position: relative;
}

.robin-wrapper:hover {
  background-color: rgba(244, 246, 248, 0.8);
}

.robin-wrapper:first-child {
  border: none;
}

.robin-zoomIn,
.robin-zoomOut {
  transform-origin: bottom right;
}

input[type="file"] {
  display: none;
  width: 0;
  height: 0;
}

input[type="file"]::file-upload-button {
  display: none;
  width: 0;
  height: 0;
}

input[type="file"]::-webkit-file-upload-button {
  display: none;
  width: 0;
  height: 0;
}

input[type="file"]::-moz-file-upload-button {
  display: none;
  width: 0;
  height: 0;
}
</style>
