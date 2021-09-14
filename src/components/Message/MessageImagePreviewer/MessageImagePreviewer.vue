<template>
  <div class="robin-image-box robin-squeezeOut" ref="popup-body">
    <header class="robin-head">
      <div class="robin-wrapper robin-mr-12" @click="closeImagePreview()">
        <RRemoveButton />
      </div>
      <RText as="h3" :font-size="18"> Image Preview </RText>
    </header>
    <div class="robin-body">
      <carousel-3d v-if="images.length > 0" @after-slide-change="onSelectChange($event)">
        <slide v-for="(image, index) in images" v-show="!image.is_deleted" :key="image._id" :index="index">
          <img :src="image.content.attachment" v-viewer="viewerOptions" />
        </slide>
      </carousel-3d>
      <div class="robin-button-container">
        <button class="robin-delete-button" @click="deleteImage()">
          <span class="robin-material-icon material-icons-outlined"> delete </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import EventBus from '@/event-bus'
import RRemoveButton from '../../ChatList/RRemoveButton/RRemoveButton.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import { Carousel3d, Slide } from 'vue-carousel-3d'
import 'viewerjs/dist/viewer.css'
import { directive as viewer } from 'v-viewer'

const ComponentProps = Vue.extend({
  props: {
    imagesToPreview: {
      type: Array as PropType<Array<any>>,
      default: () => []
    }
  }
})

// eslint-disable-next-line
@Component<MessageImagePreviewer>({
  name: 'MessageImagePreviewer',
  components: {
    RText,
    RRemoveButton,
    Carousel3d,
    Slide
  },
  watch: {
    imagesToPreview: {
      handler (val) {
        this.images = [...val]
      },
      immediate: true
    }
  },
  directives: { viewer: viewer({ debug: true }) }
})
export default class MessageImagePreviewer extends ComponentProps {
 viewerOptions = {
   toolbar: false,
   title: false,
   navbar: false
 } as any

  images = [] as Array<any>
  id = 0 as number

  settings = {
    dots: true,
    infinite: true,
    slidesToScroll: 1,
    rtl: true
  }

  closeImagePreview () {
    this.$emit('close')
  }

  onSelectChange (event: any): void {
    console.log('selected-change', event)
    this.id = event
  }

  async deleteImage (): Promise<void> {
    const res = await this.$robin.deleteMessages([this.images[this.id]._id], this.$user_token)

    if (res && !res.error) {
      console.log(res, [this.images[this.id]._id])
      EventBus.$emit(this.imagesToPreview.length > 1 ? 'image-deleted' : 'message-deleted', this.images[this.id])
      this.$toasted.global.custom_success('Message Deleted.')

      if (this.images.length < 2) this.closeImagePreview()

      window.setTimeout(() => this.images.splice(this.id, 1), 300)
    } else {
      this.$toasted.global.custom_error('Check your connection.')
    }
  }
}
</script>

<style scoped>
.robin-image-box {
  height: calc(100% - 6.3rem);
  position: absolute;
  /* top: 300px; */
  bottom: 0;
  width: 100%;
  /* border: 1px solid; */
  background-color: #fff;
  z-index: 2;
  display: flex;
  flex-direction: column;
  transform-origin: bottom;
}

.robin-head {
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 0 2.688rem 0 3.125rem;
  box-shadow: 0 0px 0px rgba(0, 104, 255, 0.07), 0px -1px 10px rgba(0, 104, 255, 0.07);
}

.robin-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0 2.688rem 1rem 3.125rem;
  overflow-y: auto;
}

.robin-delete-button {
  cursor: pointer;
  border: none;
  background-color: transparent;
  width: max-content;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  min-height: 50px;
  background-color: rgba(255, 0, 0, 1);
  border-radius: 50%;
  color: #fff;
  font-size: 2rem;
}
</style>
