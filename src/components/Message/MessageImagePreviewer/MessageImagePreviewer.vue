<template>
  <div class="robin-image-box robin-squeezeOut" ref="popup-body">
    <header class="robin-head">
      <div class="robin-card-container robin-flex robin-flex-align-center">
        <div class="robin-wrapper robin-mr-27" @click="closeImagePreview()">
          <IconButton name="remove" :to-emit="false" :to-click-away="false" />
        </div>

        <div class="robin-card-info robin-mr-16">
          <RGroupAvatar v-if="conversation.is_group" :img-url="conversation.group_icon" />
          <RAvatar :robin-users="$robin_users"  :sender-token="conversation.sender_token" v-else />
        </div>

        <div class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-flex-1">
          <div class="robin-mt-6">
            <RText font-weight="normal" color="#000000" :font-size="16" :line-height="20" v-if="!conversation.is_group">
              {{ conversation.sender_token != $user_token ? conversation.sender_name : conversation.receiver_name }}
            </RText>

            <RText font-weight="normal" color="#000000" :font-size="16" :line-height="20" v-else>
              {{ conversation.name }}
            </RText>
          </div>

          <div class="robin-mt-6">
            <RText v-show="!conversation.is_group" as="p" font-weight="normal" color="#7A7A7A" :font-size="14" :line-height="18">{{ conversation.status }}</RText>
          </div>
        </div>
      </div>

      <div class="robin-options robin-ml-auto" @click="handleOpenPopUp()">
        <IconButton name="openModalDot" @clickoutside="handleClosePopUp()" :to-emit="false" :to-click-away="true" />

        <div class="robin-popup-container" v-show="popUpState.opened">
          <MessagePreviewPopOver ref="popup-1" @delete="deleteImage()" @download="downloadImage()" @forward="openForwardMessage()" @reply="replyImageMessage()" />
        </div>
      </div>
    </header>

    <div class="robin-body">
      <div class="robin-wrapper robin-h-100 robin-flex robin-flex-column robin-flex-align-center robin-flex-space-between">
        <div class="robin-image-preview">
          <v-lazy-image class="robin-uploaded-image" :src="imagePreview" />
        </div>

        <div class="robin-image-row robin-overflow-x-auto robin-flex robin-flex-align-center robin-mt-16">
          <v-lazy-image class="robin-uploaded-image" v-for="(image, index) in images" :key="index" :src="image.content.attachment" @click.native="onSelectChange(index)" :class="[index === imageSelected && images.length > 1 ? 'selected' : '', images.length === 1 && 'not-selected']" />
        </div>
      </div>
    </div>
    <RForwardMessage v-if="forwardMessage" @closemodal="onCloseForwardMessagePopup()" :selected-messages="selectedMessages" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import EventBus from '@/event-bus'
import VLazyImage from 'v-lazy-image/v2'
import store from '../../../store/index'
import IconButton from '../../IconButton/IconButton.vue'
import RGroupAvatar from '@/components/ChatList/RGroupAvatar/RGroupAvatar.vue'
import RAvatar from '@/components/ChatList/RAvatar/RAvatar.vue'
import ROptionButton from '../ROptionButton/ROptionButton.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import MessagePreviewPopOver from '../MessagePreviewPopOver/MessagePreviewPopOver.vue'
import RForwardMessage from '../RForwardMessage/RForwardMessage.vue'

interface PopUpState {
  opened: boolean
}

const ComponentProps = Vue.extend({
  props: {
    imagesToPreview: {
      type: Array as PropType<Array<any>>,
      default: () => []
    },
    conversation: {
      type: Object,
      default: () => ({})
    }
  }
})

// eslint-disable-next-line
@Component<MessageImagePreviewer>({
  name: 'MessageImagePreviewer',
  components: {
    RText,
    IconButton,
    RGroupAvatar,
    ROptionButton,
    RAvatar,
    MessagePreviewPopOver,
    VLazyImage,
    RForwardMessage
  },
  watch: {
    imagesToPreview: {
      handler (val) {
        this.images = [...val]
      },
      immediate: true
    }
  }
})
export default class MessageImagePreviewer extends ComponentProps {
  viewerOptions = {
    toolbar: false,
    title: false,
    navbar: false
  } as any

  imageSelected = 0 as number
  selectedMessages = [] as Array<any>
  forwardMessage = false as boolean

  images = [] as Array<any>
  id = 0 as number

  settings = {
    dots: true,
    infinite: true,
    slidesToScroll: 1,
    rtl: true
  }

  popUpState: PopUpState = {
    opened: false
  }

  get imagePreview (): string {
    return this.images[this.imageSelected] ? this.images[this.imageSelected].content.attachment : ''
  }

  handleOpenPopUp (): void {
    const popup = this.$refs['popup-1'] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomOut')

    this.popUpState.opened = true
  }

  handleClosePopUp (): void {
    const popup = this.$refs['popup-1'] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomIn')
    popup.$refs['popup-body'].classList.add('robin-zoomOut')

    window.setTimeout(() => {
      const popup = this.$refs['popup-1'] as any
      popup.$refs['popup-body'].classList.add('robin-zoomIn')
      popup.$refs['popup-body'].classList.remove('robin-zoomOut')

      this.popUpState.opened = false
    }, 300)
  }

  closeImagePreview () {
    this.$emit('close')
  }

  getFileDetails (attachmentUrl: string): { name: any; extension: any } {
    const fileName = attachmentUrl.substring(attachmentUrl.lastIndexOf('/') + 1)
    const strArr = fileName.split('.')

    return {
      name: strArr[strArr.length - 2],
      extension: strArr[strArr.length - 1]
    }
  }

  onSelectChange (index: number): void {
    this.imageSelected = index
  }

  downloadImage (): void {
    const fileDetails = this.getFileDetails(this.imagePreview) as any
    const element = document.createElement('a')

    element.setAttribute('href', this.imagePreview)
    element.setAttribute('download', fileDetails.name + ' ' + fileDetails.extension)
    element.click()
  }

  async deleteImage (): Promise<void> {
    const res = await this.$robin.deleteMessages([this.images[this.imageSelected]._id], this.$user_token)

    if (res && !res.error) {
      if (this.images.length < 2) this.closeImagePreview()

      EventBus.$emit('image-deleted', this.images[this.imageSelected])
      console.log(this.images[this.imageSelected])

      window.setTimeout(() => {
        this.images.splice(this.imageSelected, 1)
      }, 300)
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  openForwardMessage () {
    this.forwardMessage = true
    this.selectedMessages = [this.imagesToPreview[0]]
    store.setState('messageProfileOpen', false)
  }

  replyImageMessage () {
    store.setState('imageSelected', this.imageSelected)
    store.setState('isImageReplying', true)
    store.setState('messageProfileOpen', false)
    this.closeImagePreview()
  }

  onCloseForwardMessagePopup (): void {
    this.forwardMessage = false
    store.setState('selectMessagesOpen', false)
  }
}
</script>

<style scoped>
.robin-image-box {
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  background: rgba(107, 116, 145, 0.6);
  backdrop-filter: blur(10.8731px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  transform-origin: bottom;
}

.robin-image-box .robin-head {
  width: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding-top: 1.738rem;
  padding-right: clamp(3%, 5vw, 2.625rem);
  padding-bottom: 1.175rem;
  padding-left: clamp(3%, 5vw, 1.5rem);
  position: relative;
  z-index: 3;
  min-height: max-content;
}

.robin-card-container >>> .robin-button {
  margin-right: 10%;
}

.robin-options {
  position: relative;
}

.robin-popup-container {
  position: absolute;
  top: 30px;
  right: 5px;
  z-index: 100;
}

.robin-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  padding: 2.5rem 2.688rem 0 3.125rem;
  overflow-y: auto;
}

.robin-image-preview {
  width: 100%;
  text-align: center;
}

.robin-image-preview .robin-uploaded-image {
  /* width: 100%; */
  max-height: 500px;
  max-width: 100%;
  border-radius: 10px;
  background-color: #fff;
}

.robin-image-row {
  width: 100%;
  /* gap: 0.625rem; */
  /* padding: 0.5rem; */
  overflow-y: hidden;
}

.selected {
  transform: scale(0.8);
  cursor: default !important;
}

.not-selected {
  transform: scale(1);
  cursor: default !important;
}

.robin-image-row::-webkit-scrollbar {
  display: none;
}

.robin-image-row .robin-uploaded-image {
  min-width: 144px;
  width: 144px;
  height: 109px;
  border-radius: 10px;
  cursor: pointer;
  margin: 0.3rem;
  transition: 0.05s;
  background-color: #fff;
}

.robin-image-row .robin-uploaded-image:not(.selected, .not-selected):hover {
  transform: scale(1.08);
}

@media (max-width: 768px) {
  .robin-image-box .robin-head {
    padding: 1rem clamp(3%, 5vw, 2.688rem) 1rem clamp(3%, 5vw, 3.125rem);
  }

  .robin-body {
    justify-content: center;
    height: 100%;
    padding: 5.5rem clamp(3%, 5vw, 2.625rem) 0px clamp(0%, 5vw, 1.5rem);
  }

  .robin-wrapper {
    width: 100%;
  }

  .robin-image-row .robin-uploaded-image:not(.selected, .not-selected):hover {
    transform: none;
  }
}

@media (max-width: 1200px) {
  .robin-image-box .robin-head {
    box-shadow: 0px 2px 20px rgba(0, 104, 255, 0.06);
  }
}

@media (max-width: 1200px) {
  .robin-image-box {
    height: 100%;
    /* z-index: 4; */
  }
}
</style>
