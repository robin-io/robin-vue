<template>
  <div class="robin-bubble" :class="!validateMessageClass() ? 'robin-grid-sender' : 'robin-grid-receiver'" @click.self="$emit('open-modal')" data-testid="bubble">
    <div class="robin-popup-container reactions" ref="popup-body">
      <ReactionPopUp v-show="messagePopup.opened && isMessageReactionViewEnabled" @close-modal="closeModal()" :id="message[0]._id" :message="message[0]" @reaction="$emit('add-reaction', $event)"/>
    </div>

    <Content v-if="!validateMessageClass() && conversation.is_group" :font-size="12" as="span" :color="groupnameColors[message[0].sender_token]" :line-height="20" class="robin-messager-name robin-mb-4"> {{ getContactName(message[0].sender_token) }} </Content>

    <div class="robin-bubble-inner robin-grid-container" :class="getSizeOfGridClass" @click="openPreview(message)" data-testid="bubble-inner">
      <div class="robin-message-bubble-image" v-for="(image, index) in images" :key="image._id" :class="validateImageClass(index)">
        <v-lazy-image class="robin-uploaded-image" :src="image.content.attachment" />
      </div>

      <span :class="message.length > 4 ? 'back-drop robin-flex-column robin-flex-space-between' : 'robin-flex-end'" class="robin-drop-shadow robin-flex">
        <Content v-show="message.length > 4" :font-size="26" color="#fff" as="p" class="robin-message-count"> {{ message.length - 4 }}+ </Content>
      </span>
    </div>

    <Content :font-size="10" :font-weight="'300'" :color="currentTheme === 'light' ? '#7a7a7a' : '#B6B6B6'" as="p" class="robin-side-text">
      {{ formatTimeStamp(message[0].content.timestamp) }}

      <SvgIcon name="read" v-if="message[0].is_read" />

      <SvgIcon name="not-read" v-if="!message[0].is_read" />
    </Content>

    <IconButton class="download-btn" @clicked="downloadImages(message)" name="downloadImage" :to-emit="true" :to-click-away="false" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VLazyImage from 'v-lazy-image/v2'
import Component from 'vue-class-component'
import store from '@/store/index'
import ReactionPopUp from '../ReactionPopUp/ReactionPopUp.vue'
import Content from '@/components/Content/Content.vue'
import IconButton from '@/components/IconButton/IconButton.vue'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import moment from 'moment'

interface Message {
  [key: string]: any
}

const ComponentProps = Vue.extend({
  props: {
    groupnameColors: {
      type: Object,
      default: () => {}
    },
    message: {
      type: Array as PropType<Array<any>>,
      default: (): Array<any> => []
    },
    messagePopup: {
      type: Object,
      default: () => {}
    },
    conversation: {
      type: Object,
      default: () => {}
    },
    readReceipts: {
      type: Array as PropType<Array<string>>,
      default: () => []
    }
  }
})

// eslint-disable-next-line
@Component<MessageGrid>({
  name: 'MessageGrid',
  components: {
    Content,
    VLazyImage,
    ReactionPopUp,
    SvgIcon,
    IconButton
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

  get currentTheme () {
    return store.state.currentTheme
  }

  get getSizeOfGridClass () {
    if (this.message.length >= 4) {
      return 'robin-grid-4-by-4'
    } else if (this.message.length === 3) {
      return 'robin-grid-3-by-3'
    } else {
      return 'robin-grid-2-by-2'
    }
  }

  get isMessageReactionViewEnabled () {
    return store.state.messageReactionViewEnabled
  }

  closeModal (): void {
    this.$emit('close-modal')
  }

  openPreview (message: any): void {
    this.$emit('open-preview', message)
    this.closeModal()
  }

  formatTimeStamp (value: any): string {
    return moment(String(value)).format('h:mma').toUpperCase()
  }

  validateImageClass (index: number): string {
    return this.message.some((item: any) => item.content && item.sender_token !== this.$user_token) ? `robin-image-sender robin-grid-${index}` : `robin-image-receiver robin-grid-${index}`
  }

  validateMessageClass (): boolean {
    return this.message.some((item: any) => item.content && item.sender_token === this.$user_token)
  }

  getFileDetails (attachmentUrl: string): { name: any; extension: any } {
    const fileName = attachmentUrl.substring(attachmentUrl.lastIndexOf('/') + 1)
    const strArr = fileName.split('.')

    return {
      name: strArr[strArr.length - 2],
      extension: strArr[strArr.length - 1]
    }
  }

  async downloadImages (messages: any) {
    let intervalLevel = 0

    const interval = setInterval(() => {
      if (intervalLevel === messages.length) {
        clearInterval(interval)

        return
      }

      const element = document.createElement('a')
      const fileDetails = this.getFileDetails(messages[intervalLevel].content.attachment) as any
      element.setAttribute('href', messages[intervalLevel].content.attachment)
      element.setAttribute('download', fileDetails.name + ' ' + fileDetails.extension)

      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      intervalLevel += 1
    }, 1000)
  }

  getContactName (sender_token: string): string {
    const index = this.$robin_users.findIndex((user) => user.userToken === sender_token) as number
    const user = this.$robin_users[index] as any
    return user ? user.userName : ''
  }
}
</script>

<style scoped>
.robin-bubble {
  width: max-content;
  border-radius: inherit;
  padding: 0.813rem 0.625rem 0.813rem 0.75rem;
  position: relative;
}

.robin-bubble-inner {
  width: max-content;
  border-radius: inherit;
  position: relative;
  z-index: 0;
}

.robin-grid-container {
  display: grid;
  gap: 0.25rem 0.25rem;
}

.robin-grid-container::before {
  content: '';
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 1;
  border-radius: 8px;
  transition: background-color 0.1s;
  cursor: pointer;
}

.robin-grid-container:hover::before {
  background: rgba(0, 0, 0, 0.3);
}

.robin-grid-container:active::before {
  background: transparent;
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
  grid-template-rows: 192px;
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
  border-radius: 4px;
}

.robin-grid-4-by-4 .robin-grid-1 {
  border-radius: 4px;
}

.robin-grid-4-by-4 .robin-grid-2 {
  border-radius: 4px;
}

.robin-grid-4-by-4 .robin-grid-3 {
  border-radius: 4px;
}

/* 3 by 3 */
.robin-grid-3-by-3 .robin-image-receiver.robin-grid-0 {
  grid-column: 1;
  grid-row: 1;
  border-radius: 4px;
}

.robin-grid-3-by-3 .robin-image-receiver.robin-grid-1 {
  grid-column: 2;
  grid-row: 1;
  border-radius: 4px;
}

.robin-grid-3-by-3 .robin-image-receiver.robin-grid-2 {
  grid-column: 1 / span 2;
  grid-row: 2;
  border-radius: 4px;
}

.robin-grid-3-by-3 .robin-image-sender.robin-grid-0 {
  grid-column: 2;
  grid-row: 1;
  border-radius: 4px;
}

.robin-grid-3-by-3 .robin-image-sender.robin-grid-1 {
  grid-column: 1;
  grid-row: 1 / span 2;
  border-radius: 4px;
}

.robin-grid-3-by-3 .robin-image-sender.robin-grid-2 {
  grid-column: 2;
  grid-row: 2;
  border-radius: 4px;
}

/* 2 by 2 */
.robin-grid-2-by-2 .robin-grid-0 {
  border-radius: 4px;
}

.robin-grid-2-by-2 .robin-image-sender.robin-grid-0 {
  border-radius: 4px;
}

.robin-grid-2-by-2 .robin-image-receiver.robin-grid-1 {
  border-radius: 4px;
}

.robin-grid-2-by-2 .robin-image-sender.robin-grid-1 {
  border-radius: 4px;
}

/* Image */
.robin-message-bubble-image img {
  height: 100%;
  min-width: 100%;
  width: 100%;
  border-radius: inherit;
  background-color: var(--rb-color7);
  object-fit: cover;
  /* max-width: 90px; */
  /* max-height: 350px; */
}

.robin-grid-sender {
  background-color: var(--rb-color9);
}

.robin-grid-receiver {
  background-color: var(--rb-color10);
}

.robin-grid-sender .robin-side-text {
  display: flex;
  align-items: flex-start;
  margin: 0.375rem 0 0;
}

.robin-grid-receiver .robin-side-text {
  display: flex;
  align-items: flex-start;
  margin: 0.375rem 0 0 auto;
}

.robin-grid-sender .robin-popup-container.reactions {
  position: absolute;
  top: -50px;
  left: 50%;
  z-index: 10;
}

.robin-grid-receiver .robin-popup-container.reactions {
  position: absolute;
  top: -50px;
  right: 50%;
  z-index: 10;
}

.robin-grid-receiver .robin-popup-container.reactions >>> .robin-popup::before {
  bottom: -3px;
  left: 100px;
}

.robin-grid-receiver .robin-popup-container.reactions >>> .robin-popup::after {
  bottom: -8px;
  left: 109px;
}

.robin-grid-sender .robin-popup-container.reactions >>> .robin-zoomIn,
.robin-grid-sender .robin-popup-container.reactions >>> .robin-zoomOut {
  transform-origin: bottom top;
}

.robin-grid-sender .robin-popup-container.reactions >>> .robin-zoomIn,
.robin-grid-sender .robin-popup-container.reactions >>> .robin-zoomOut {
  transform-origin: bottom top;
}

.robin-grid-receiver .download-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  left: -20%;
  transition: transform 100ms ease-in;
}

.robin-grid-sender .download-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  right: -20%;
  transition: transform 100ms ease-in;
}

.download-btn:hover {
  transform: translateY(-50%) scale(1.05);
}
</style>
