<template>
  <div class="robin-attach-file-popup robin-zoomIn" ref="popup-body">
    <message-content
      v-if="screenWidth > 1024"
      class="robin-wrapper robin-w-100"
      max-width="100%"
      :font-size="14"
      :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
      as="label"
      for-ref="camera-upload"
      @click.native="$emit('open-camera')"
    >
      Camera
      <icon-button name="photo" :to-emit="false" :to-click-away="false" class="robin-ml-auto" />
    </message-content>
    <message-content
      v-else
      class="robin-wrapper robin-w-100"
      max-width="100%"
      :font-size="14"
      :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
      as="label"
      for-ref="camera-upload"
    >
      <input
        :style="{ display: 'none' }"
        type="file"
        accept="image/*"
        capture="environment"
        @change="handleFileChange($event)"
        @click="resetFileTarget($event)"
        id="camera-upload"
      />
      Camera
      <icon-button name="photo" :to-emit="false" :to-click-away="false" class="robin-ml-auto" />
    </message-content>

    <message-content
      class="robin-wrapper robin-w-100"
      max-width="100%"
      as="label"
      :font-size="14"
      :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
      for-ref="photo-upload"
      ref="photo-upload"
    >
      <input
        :style="{ display: 'none' }"
        type="file"
        multiple
        :accept="acceptedVisualFiles"
        @change="handleFileChange($event)"
        @click="resetFileTarget($event)"
        id="photo-upload"
      />
      Photos & Videos
      <icon-button
        name="gallery"
        emit="clicked"
        :to-emit="false"
        :to-click-away="false"
        class="robin-ml-auto"
      />
    </message-content>

    <message-content
      as="label"
      for-ref="document-upload"
      :font-size="14"
      max-width="100%"
      :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
      class="robin-wrapper robin-w-100"
      ref="document-upload"
    >
      <input
        type="file"
        :style="{ display: 'none' }"
        multiple
        :accept="acceptedDocFiles"
        @change="handleFileChange($event)"
        @click="resetFileTarget($event)"
        id="document-upload"
      />
      Document
      <icon-button
        name="document"
        emit="clicked"
        :to-emit="false"
        :to-click-away="false"
        class="robin-ml-auto"
      />
    </message-content>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import store from '@/store/index'
import { createUUID } from '@/utils/helpers'
import Content from '@/components/Content/Content.vue'
import IconButton from '@/components/IconButton/IconButton.vue'
import ConversationMixin from '@/mixins/conversation-mixins'

@Component({
  name: 'AttachFilePopOver',
  components: {
    'message-content': Content,
    IconButton
  }
})
export default class AttachFilePopOver extends mixins(ConversationMixin) {
  acceptedDocFiles = 'application/*, text/*' as string
  acceptedVisualFiles = 'image/*, video/*' as string

  get currentTheme () {
    return store.state.currentTheme
  }

  resetFileTarget (event: any): void {
    event.target.value = ''
  }

  handleFileChange (event: Event): void {
    const input = event.target as HTMLInputElement
    const files = input.files

    if (files) {
      [...files].forEach((file: any) => {
        const extension = file.name.split('.')[1]
        const blob = file.slice(0, file.size, file.type)
        const customFile = new File([blob], createUUID(36) + '.' + extension, { type: file.type })

        const fileURL = URL.createObjectURL(customFile)

        if (file.size < 5000001) {
          this.$emit('file-upload', {
            name: customFile.name.split('.')[0],
            size: customFile.size,
            type: customFile.type,
            extension: customFile.name.split('.')[1],
            localUrl: fileURL,
            file: customFile
          })
        } else {
          this.showToast('Image upload cannot be more than 5mb.', 'error')
        }
      })
    }
  }
}
</script>
