<template>
  <div class="robin-bubble" :class="!validateMessageClass() ? 'robin-grid-sender' : 'robin-grid-receiver'">
    <div class="robin-bubble-inner robin-grid-container" :class="getSizeOfGridClass" @click="$emit('open-preview', message)">
      <div class="robin-message-bubble-image" v-for="(image, index) in images" :key="image._id" :class="validateImageClass(index)">
        <v-lazy-image class="robin-uploaded-image" :src="image.content.attachment" />
      </div>
      <span :class="message.length > 4 ? 'back-drop robin-flex-column robin-flex-space-between' : 'robin-flex-end'" class="robin-drop-shadow robin-flex">
        <RText v-show="message.length > 4" :font-size="26" color="#fff" as="p" class="robin-message-count"> {{ message.length - 4 }}+ </RText>
      </span>
    </div>
    <RText :font-size="12" color="#7a7a7a" as="p" class="robin-side-text">
      {{ formatTimeStamp(message[0].content.timestamp) }}
    </RText>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VLazyImage from 'v-lazy-image/v2'
import Component from 'vue-class-component'
import RText from '@/components/ChatList/RText/RText.vue'
import moment from 'moment'

interface Message {
  [key: string]: any
}

const ComponentProps = Vue.extend({
  props: {
    message: {
      type: Array as PropType<Array<any>>,
      default: (): Array<any> => []
    },
    conversation: {
      type: Object,
      default: () => {}
    }
  }
})

// eslint-disable-next-line
@Component<MessageGrid>({
  name: 'MessageGrid',
  components: {
    RText,
    VLazyImage
  },
  watch: {
    message: {
      handler (val: any) {
        this.images = [...val].slice(0, 4) as Array<Message>
      },
      immediate: true
    }
  }
})
export default class MessageGrid extends ComponentProps {
  images: Array<Message> = []
  get getSizeOfGridClass () {
    if (this.message.length >= 4) {
      return 'robin-grid-4-by-4'
    } else if (this.message.length === 3) {
      return 'robin-grid-3-by-3'
    } else {
      return 'robin-grid-2-by-2'
    }
  }

  formatTimeStamp (value: any): string {
    return moment(String(value)).format('h:mma').toUpperCase()
  }

  validateImageClass (index: number): string {
    return this.message.some((item: any) => item.content && item.content.sender_token !== this.$user_token) ? `robin-image-sender robin-grid-${index}` : `robin-image-receiver robin-grid-${index}`
  }

  validateMessageClass (): boolean {
    return this.message.some((item: any) => item.content && item.content.sender_token === this.$user_token)
  }
}
</script>

<style scoped>
.robin-bubble {
  width: max-content;
  border-radius: inherit;
  padding-bottom: 0.5rem;
}

.robin-bubble-inner {
  width: max-content;
  border-radius: inherit;
  position: relative;
  z-index: 0;
}

.robin-grid-container {
  display: grid;
  gap: 0.125rem 0.125rem;
}

.robin-grid-container::before {
  content: '';
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 1;
  border-radius: 16px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.robin-grid-container:hover::before {
  background: rgba(0, 0, 0, 0.3);
}

.robin-grid-container .robin-drop-shadow {
  border-radius: 0px 0px 14px 0px;
  width: 125px;
  height: 94px;
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0.5rem 1rem 0.5rem 1rem;
  z-index: 0;
}

.back-drop {
  background: rgba(0, 0, 0, 0.5);
}

.robin-message-count {
  align-self: center;
  margin-top: 1.4rem;
}

.robin-grid-4-by-4 {
  grid-template-columns: repeat(2, minmax(0, 125px));
  grid-template-rows: 94px 94px;
}

.robin-grid-3-by-3 {
  grid-template-columns: 125px 125px;
  grid-template-rows: 94px 94px;
}

.robin-grid-2-by-2 {
  grid-template-columns: 125px 125px;
  grid-template-rows: 226px;
}

.robin-image-receiver {
  width: 100%;
  /* height: 94px; */
}

.robin-image-sender {
  width: 100%;
  /* height: 94px; */
}

/* 4 by 4 */
.robin-grid-4-by-4 .robin-grid-0 {
  border-radius: 16px 0px 0px 0px;
}

.robin-grid-4-by-4 .robin-grid-1 {
  border-radius: 0px 16px 0px 0px;
}

.robin-grid-4-by-4 .robin-grid-2 {
  border-radius: 0px 0px 0px 16px;
}

.robin-grid-4-by-4 .robin-grid-3 {
  border-radius: 0px 0px 16px 0px;
}

/* 3 by 3 */
.robin-grid-3-by-3 .robin-image-receiver.robin-grid-0 {
  grid-column: 1;
  grid-row: 1;
  border-radius: 16px 0px 0px 0px;
}

.robin-grid-3-by-3 .robin-image-receiver.robin-grid-1 {
  grid-column: 2;
  grid-row: 1 / span 2;
  border-radius: 0px 16px 0px 0px;
}

.robin-grid-3-by-3 .robin-image-receiver.robin-grid-2 {
  grid-column: 1;
  grid-row: 2;
  border-radius: 0px 0px 0px 16px;
}

.robin-grid-3-by-3 .robin-image-sender.robin-grid-0 {
  grid-column: 2;
  grid-row: 1;
  border-radius: 0px 16px 0px 0px;
}

.robin-grid-3-by-3 .robin-image-sender.robin-grid-1 {
  grid-column: 1;
  grid-row: 1 / span 2;
  border-radius: 16px 0px 0px 0px;
}

.robin-grid-3-by-3 .robin-image-sender.robin-grid-2 {
  grid-column: 2;
  grid-row: 2;
  border-radius: 0px 0px 16px 0px;
}

/* 2 by 2 */
.robin-grid-2-by-2 .robin-grid-0 {
  border-radius: 16px 0px 0px 16px;
}

.robin-grid-2-by-2 .robin-image-sender.robin-grid-0 {
  border-radius: 16px 0px 0px 0px;
}

.robin-grid-2-by-2 .robin-image-receiver.robin-grid-1 {
  border-radius: 0px 16px 0px 0px;
}

.robin-grid-2-by-2 .robin-image-sender.robin-grid-1 {
  border-radius: 0px 16px 16px 0px;
}

/* Image */
.robin-message-bubble-image img {
  height: 100%;
  min-width: 100%;
  width: 100%;
  border-radius: inherit;
  /* max-width: 90px; */
  /* max-height: 350px; */
}

.robin-grid-sender {
  background-color: #f4f6f8;
}

.robin-grid-receiver {
  background-color: #d3d7ea;
}

.robin-grid-sender .robin-side-text {
  margin: 0.375rem 0.3rem 0;
}

.robin-grid-receiver .robin-side-text {
  margin: 0.375rem 1rem 0 auto;
}
</style>
