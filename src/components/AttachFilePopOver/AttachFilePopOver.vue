<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <Content v-if="screenWidth > 1024" class="robin-wrapper robin-w-100" max-width="100%" :font-size="14" color="#51545C" as="label" for-ref="camera-upload" @click.native="$emit('open-camera')">
      Camera
      <IconButton name="photo" :to-emit="false" :to-click-away="false" class="robin-ml-auto" />
    </Content>
    <Content v-else class="robin-wrapper robin-w-100" max-width="100%" :font-size="14" color="#51545C" as="label" for-ref="camera-upload">
      <input :style="{ display: 'none' }" type="file" accept="image/*" capture="environment" @change="handleFileChange($event.target.files)" @click="resetFileTarget($event)" id="camera-upload" />
      Camera
      <IconButton name="photo" :to-emit="false" :to-click-away="false" class="robin-ml-auto" />
    </Content>

    <Content class="robin-wrapper robin-w-100" max-width="100%" as="label" :font-size="14" color="#51545C" for-ref="photo-upload" ref="photo-upload">
      <input :style="{ display: 'none' }" type="file" multiple :accept="acceptedVisualFiles" @change="handleFileChange($event.target.files)" @click="resetFileTarget($event)" id="photo-upload" />
      Photos & Videos
      <IconButton name="gallery" emit="clicked" :to-emit="false" :to-click-away="false" class="robin-ml-auto" />
    </Content>

    <Content as="label" for-ref="document-upload" :font-size="14" max-width="100%" color="#51545C" class="robin-wrapper robin-w-100" ref="document-upload">
      <input type="file" :style="{ display: 'none' }" multiple :accept="acceptedDocFiles" @change="handleFileChange($event.target.files)" @click="resetFileTarget($event)" id="document-upload" />
      Document
      <IconButton name="document" emit="clicked" :to-emit="false" :to-click-away="false" class="robin-ml-auto" />
    </Content>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Content from '@/components/Content/Content.vue'
import IconButton from '@/components/IconButton/IconButton.vue'

@Component({
  name: 'AttachFilePopOver',
  components: {
    Content,
    IconButton
  }
})
export default class AttachFilePopOver extends Vue {
  acceptedDocFiles = 'application/*, text/*' as string
  acceptedVisualFiles = 'image/*, video/*' as string
  screenWidth = 0 as number

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
  }

  resetFileTarget (event: any): void {
    event.target.value = ''
  }

  handleFileChange (files: any): void {
    ;[...files].forEach((file: any) => {
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
        this.$toast.open({
          message: 'Image upload cannot be more than 5mb',
          type: 'error',
          position: 'bottom-left'
        })
      }
    })
  }

  onResize () {
    this.screenWidth = window.innerWidth
  }
}
</script>

<style scoped>
.robin-popup {
  width: 178px;
  /* max-width: 178px; */
  border: 1px solid #f5f7fc;
  border-radius: 6px;
  background-color: #ffffff;
}

.robin-wrapper {
  border-top: 1px solid #efefef;
  padding: 0.813rem 1rem;
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
  transform-origin: bottom left;
}
</style>
