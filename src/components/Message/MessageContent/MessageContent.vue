<template>
  <div class="robin-message-bubble robin-flex robin-flex-wrap robin-flex-align-center" :class="validateMessages(message)">
    <RCheckBox v-if="selectMessagesOpen" @clicked="toggleCheckAction($event)" />
    <div class="robin-bubble" :class="validateMessages(message).includes('message-sender') ? 'robin-ml-5' : 'robin-mr-5'" v-if="!Array.isArray(message)" v-on-clickaway="closeModal">
      <!-- Personal -->
      <div class="robin-message-bubble-inner" :class="{'robin-non-clickable': selectMessagesOpen}" v-if="!message.has_attachment && !conversation.is_group" @click="openModal()">
        <RText :font-size="16" textWrap="pre-line" as="span" v-if="!emailRegex.test(message.content.msg) && !websiteRegex.test(message.content.msg)">
          {{ message.content.msg }}
        </RText>
        <RText :font-size="14" textWrap="pre-line" as="span" v-else-if="emailRegex.test(message.content.msg) && !websiteRegex.test(message.content.msg)">
          <a target="_blank" :href="`mailto:${message.content.msg}`">{{ message.content.msg }}</a>
        </RText>
        <RText :font-size="14" textWrap="pre-line" as="span" v-else>
          <a target="_blank" :href="message.content.msg.includes('http') || message.content.msg.includes('https') ? message.content.msg : `https://${message.content.msg}`">{{ message.content.msg }}</a>
        </RText>
        <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
          <RText :font-size="12" color="#7a7a7a" as="p">
            {{ formatTimeStamp(message.content.timestamp) }}
          </RText>
        </span>
      </div>
      <!-- Group -->
      <div class="robin-message-bubble-inner robin-group" :class="{'robin-non-clickable': selectMessagesOpen}" v-if="!message.has_attachment && conversation.is_group" @click="openModal()">
        <RText v-if="validateMessages(message).includes('message-sender')" :font-size="12" color="#15AE73" as="span" :line-height="20" class="robin-messager-name robin-mb-4"> {{ getContactName(message.content.sender_token) }} </RText>
        <div class="message-inner">
          <RText :font-size="16" textWrap="pre-line" wordBreak="break-all" as="span" v-if="!emailRegex.test(message.content.msg) && !websiteRegex.test(message.content.msg)">
            {{ message.content.msg }}
          </RText>
          <RText :font-size="14" textWrap="pre-line" as="span" v-else-if="emailRegex.test(message.content.msg) && !websiteRegex.test(message.content.msg)">
            <a target="_blank" :href="`mailto:${message.content.msg}`">{{ message.content.msg }}</a>
          </RText>
          <RText :font-size="14" textWrap="pre-line" as="span" v-else>
            <a target="_blank" :href="message.content.msg.includes('http') || message.content.msg.includes('https') ? message.content.msg : `https://${message.content.msg}`">{{ message.content.msg }}</a>
          </RText>
          <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
            <RText :font-size="12" color="#7a7a7a" as="p">
              {{ formatTimeStamp(message.content.timestamp) }}
            </RText>
          </span>
        </div>
      </div>
      <div @click="$emit('open-preview', [message])" class="robin-message-bubble-image" v-if="message.content.is_attachment && imageRegex.test(checkAttachmentType(message.content.attachment))">
        <v-lazy-image class="robin-uploaded-image" :src="message.content.attachment" />
        <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
          <RText :font-size="12" color="#fff" as="p">
            {{ formatTimeStamp(message.content.timestamp) }}
          </RText>
        </span>
      </div>
      <div class="robin-message-bubble-video" v-if="message.content.is_attachment && videoRegex.test(checkAttachmentType(message.content.attachment))" @click="openModal()">
        <video controls>
          <source :src="message.content.attachment" />
          Your browser does not support the video tag.
        </video>
        <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
          <RText :font-size="12" color="#7a7a7a" as="p">
            {{ formatTimeStamp(message.content.timestamp) }}
          </RText>
        </span>
      </div>
      <div class="robin-message-bubble-document" v-if="message.content.is_attachment && documentRegex.test(checkAttachmentType(message.content.attachment))" @click="openModal()">
        <div class="robin-uploaded-document">
          <img v-if="images[getFileDetails(message.content.attachment).extension]" :src="images[getFileDetails(message.content.attachment).extension]" />
          <img v-else src="@/assets/default.png" />
          <div class="details robin-flex robin-h-100 robin-flex-align-center">
            <RText as="span" :fontSize="14"> {{ getFileDetails(message.content.attachment).name.length > 9 ? getFileDetails(message.content.attachment).name.substring(0, 9) + '...' + '.' + getFileDetails(message.content.attachment).extension : getFileDetails(message.content.attachment).name + '.' + getFileDetails(message.content.attachment).extension }} </RText>
          </div>
          <RDownloadButton @clicked="downloadFile(message.content.attachment)" />
        </div>
        <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
          <RText :font-size="12" color="#7a7a7a" as="p">
            {{ formatTimeStamp(message.content.timestamp) }}
          </RText>
        </span>
      </div>
    </div>
    <div class="robin-bubble" :class="validateMessages(message).includes('message-sender') ? 'robin-ml-5' : 'robin-mr-5'" v-if="Array.isArray(message) && message.filter((image) => !image.is_deleted).length === 1">
      <div @click="$emit('open-preview', [message[0]])" class="robin-message-bubble-image" v-if="message[0].content.is_attachment && imageRegex.test(checkAttachmentType(message[0].content.attachment))">
        <v-lazy-image class="robin-uploaded-image" :src="message[0].content.attachment" />
        <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
          <RText :font-size="12" color="#fff" as="p">
            {{ formatTimeStamp(message[0].content.timestamp) }}
          </RText>
        </span>
      </div>
    </div>
    <MessageGrid :class="!validateMessages(message) ? 'robin-ml-5' : 'robin-mr-5'" v-if="Array.isArray(message) && message.filter((image) => !image.is_deleted).length > 1" :message="message.filter((image) => !image.is_deleted)" :conversation="conversation" @open-preview="openPreview($event)" />
    <div class="robin-popup-container" :class="{ top: lastId === message._id && scroll }">
      <RMessagePopOver v-show="messagePopup.opened && validateMessages(message)" @close-modal="closeModal()" ref="popup-1" :id="message._id" :message="message" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VLazyImage from 'v-lazy-image/v2'
import { mixin as clickaway } from 'vue-clickaway'
import store2 from '../../../store2/index'
import Component from 'vue-class-component'
import RDownloadButton from '../RDownloadButton/RDownloadButton.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import MessageGrid from '../MessageGrid/MessageGrid.vue'
import RMessagePopOver from '../RMessagePopOver/RMessagePopOver.vue'
import RCheckBox from '@/components/ChatList/RCheckBox/RCheckBox.vue'
import moment from 'moment'
import mime from 'mime'

// file-extension-images
import pdf from '@/assets/pdf.png'
import doc from '@/assets/doc.png'
import docx from '@/assets/docx.png'
import csv from '@/assets/csv.png'
import ppt from '@/assets/ppt.png'
import rtf from '@/assets/rtf.png'
import rar from '@/assets/rar.png'
import tar from '@/assets/tar.png'
import xls from '@/assets/xls.png'
import xlsx from '@/assets/xlsx.png'
import txt from '@/assets/txt.png'
import odt from '@/assets/odt.png'
import md from '@/assets/md.png'
import zipSeven from '@/assets/7z.png'
import zip from '@/assets/zip.png'
import html from '@/assets/html.png'

const ComponentProps = Vue.extend({
  props: {
    message: {
      type: [Object, Array],
      default: () => {}
    },
    index: {
      type: Number,
      default: 0
    },
    messages: {
      type: Array,
      default: () => []
    },
    conversation: {
      type: Object,
      default: () => {}
    },
    messagePopup: {
      type: Object,
      default: () => {}
    },
    lastId: {
      type: String as PropType<string>,
      default: ''
    },
    scroll: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  }
})

// eslint-disable-next-line
@Component<MessageContent>({
  name: 'MessageContent',
  components: {
    RText,
    RDownloadButton,
    VLazyImage,
    MessageGrid,
    RMessagePopOver,
    RCheckBox
  },
  mixins: [clickaway]
})
export default class MessageContent extends ComponentProps {
  // @State('selectMessagesOpen') selectMessagesOpen?: RootState

  images = {
    pdf: pdf,
    doc: doc,
    docx: docx,
    csv: csv,
    ppt: ppt,
    rtf: rtf,
    rar: rar,
    tar: tar,
    xls: xls,
    xlsx: xlsx,
    txt: txt,
    odt: odt,
    md: md,
    '7z': zipSeven,
    zip: zip,
    html: html
  } as any

  imageRegex = /^image/ as any
  videoRegex = /^video/ as any
  documentRegex = /(csv|xlsx|xls|doc|docx|ppt|pptx|txt|pdf|ppt|rtf|rar|tar|odt|md|zip|7z|zip|html)$/
  emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  websiteRegex = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

  get robinUsers () {
    return store2.state.users
  }

  get selectMessagesOpen () {
    return store2.state.selectMessagesOpen
  }

  formatTimeStamp (value: any): string {
    return moment(String(value)).format('h:mma').toUpperCase()
  }

  checkAttachmentType (attachmentUrl: String): string {
    const strArr = attachmentUrl.split('.')

    if (mime.getType(strArr[strArr.length - 1]) === 'application/msword') {
      return 'doc'
    }

    return `${mime.getType(strArr[strArr.length - 1])}`
  }

  getFileDetails (attachmentUrl: string): { name: any; extension: any } {
    const fileName = attachmentUrl.substring(attachmentUrl.lastIndexOf('/') + 1)
    const strArr = fileName.split('.')

    return {
      name: strArr[strArr.length - 2],
      extension: strArr[strArr.length - 1]
    }
  }

  downloadFile (attachmentUrl: string): void {
    const fileDetails = this.getFileDetails(attachmentUrl) as any
    const element = document.createElement('a')

    element.setAttribute('href', attachmentUrl)
    element.setAttribute('download', fileDetails.name + ' ' + fileDetails.extension)
    element.click()
  }

  openModal (): void {
    if (!this.selectMessagesOpen) {
      this.messagePopup.opened = true
    }
  }

  closeModal (): void {
    const popup = this.$refs['popup-1'] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomIn')
    popup.$refs['popup-body'].classList.add('robin-zoomOut')

    window.setTimeout(() => {
      popup.$refs['popup-body'].classList.add('robin-zoomIn')
      popup.$refs['popup-body'].classList.remove('robin-zoomOut')

      this.messagePopup.opened = false
    }, 300)
  }

  openPreview (event: any): void {
    this.$emit('open-preview', event)
  }

  checkArrayReceiverUserToken (message: any) {
    return message.some((item: { content: { sender_token: string } }) => item.content.sender_token === this.$user_token)
  }

  validateMessages (message: any): string {
    const nextMessage = this.messages[this.index + 1] as any

    if (Array.isArray(message) && this.checkArrayReceiverUserToken(message) && nextMessage && nextMessage.content.sender_token !== this.$user_token) {
      return 'robin-message-receiver robin-ml-auto robin-flex-row-reversed prev'
    }

    if (message.content && message.content.sender_token === this.$user_token && Array.isArray(nextMessage) && !this.checkArrayReceiverUserToken(nextMessage)) {
      return 'robin-message-receiver robin-ml-auto robin-flex-row-reversed prev'
    }

    if (Array.isArray(message) && this.checkArrayReceiverUserToken(message)) {
      return 'robin-message-receiver robin-ml-auto robin-flex-row-reversed' // true
    }

    if (message.content && message.content.sender_token === this.$user_token) {
      return 'robin-message-receiver robin-ml-auto robin-flex-row-reversed' // true
    }

    if (Array.isArray(message) && !this.checkArrayReceiverUserToken(message) && nextMessage && nextMessage.content.sender_token === this.$user_token) {
      return 'robin-message-sender prev'
    }

    if (message.content && message.content.sender_token !== this.$user_token && Array.isArray(nextMessage) && this.checkArrayReceiverUserToken(nextMessage)) {
      return 'robin-message-sender prev'
    }

    return 'robin-message-sender' // false
  }

  toggleCheckAction (val: boolean): void {
    this.$emit('toggle-check-action', val)
  }

  getContactName (sender_token: string): string {
    const index = this.robinUsers.findIndex((user) => user.userToken === sender_token) as number
    const user = this.robinUsers[index] as any
    return user ? user.userName : ''
  }
}
</script>

<style scoped>
.robin-message-sender + .robin-message-receiver {
  margin-top: 1rem;
}

.robin-message-sender + .robin-message-sender,
.robin-message-receiver + .robin-message-receiver {
  margin-top: 0.25rem;
}

.robin-message-bubble {
  position: relative;
  border-radius: 16px;
}

.robin-bubble {
  width: max-content;
  border-radius: inherit;
}

/* Bubble styles */

.robin-message-sender + .robin-message-receiver,
.robin-message-receiver + .robin-message-sender {
  margin-top: 1rem;
}

.robin-message-sender + .robin-message-sender,
.robin-message-receiver + .robin-message-receiver {
  margin-top: 0.25rem;
}

.robin-message-sender.prev {
  border-radius: 16px 16px 16px 0px;
}

.robin-message-receiver.prev {
  border-radius: 16px 16px 0px 16px;
}

.robin-inner-wrapper .robin-message-sender:last-child {
  border-radius: 16px 16px 16px 0px;
}

.robin-inner-wrapper .robin-message-receiver:last-child {
  border-radius: 16px 16px 0px 16px;
}

.robin-message-receiver .robin-side-text {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.robin-message-sender .robin-side-text {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.robin-messager-name {
  margin-right: 1rem;
  display: block;
}

/* Text */

.robin-message-sender .robin-message-bubble-inner {
  background-color: #f4f6f8;
  border: 1px solid rgba(35, 107, 248, 0.2);
  cursor: pointer;
}

.robin-message-receiver .robin-message-bubble-inner {
  background-color: #d3d7ea;
  cursor: pointer;
}

.robin-message-sender .robin-message-bubble-inner >>> .robin-text,
.robin-message-receiver .robin-message-bubble-inner >>> .robin-text {
  text-align: left;
}

.robin-group.robin-message-bubble-inner {
  display: flex;
  flex-wrap: nowrap;
  gap: 0;
  flex-direction: column;
  min-width: 60px;
  width: max-content;
  max-width: 290px;
  padding: 0.5rem 1rem 0.5rem 1rem;
  border-radius: inherit;
}

.message-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem 0.5rem;
}

.robin-message-bubble-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem 0.5rem;
  min-width: 60px;
  width: max-content;
  max-width: 290px;
  padding: 0.5rem 1rem 0.5rem 1rem;
  border-radius: inherit;
}

/* Image */

.robin-message-sender .robin-message-bubble-image {
  background-color: #f4f6f8;
  border: 1px solid rgba(35, 107, 248, 0.2);
}

.robin-message-receiver .robin-message-bubble-image {
  background-color: #d3d7ea;
}

.robin-message-bubble-image {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  /* padding: 0 0 0.5rem 0; */
  border-radius: inherit;
  position: relative;
}

.robin-uploaded-image {
  width: 100%;
  min-width: 170px;
  max-width: 291px;
  height: 200px;
  border-radius: inherit;
  background-color: #fff;
}

.robin-message-sender .robin-message-bubble-image .robin-side-text {
  margin: 0.375rem 0.3rem 0;
  position: absolute;
  bottom: 8px;
}

.robin-message-receiver .robin-message-bubble-image .robin-side-text {
  margin: 0.375rem 1rem 0;
  position: absolute;
  right: 0;
  bottom: 8px;
}

.robin-message-bubble-image img {
  cursor: pointer;
  height: 100%;
  min-height: 90px;
  max-height: 350px;
}

/* Video */

.robin-message-sender .robin-message-bubble-video {
  background-color: #f4f6f8;
  border: 1px solid rgba(35, 107, 248, 0.2);
}

.robin-message-receiver .robin-message-bubble-video {
  background-color: #d3d7ea;
  cursor: pointer;
}

.robin-message-bubble-video {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  padding: 0 0 0.5rem 0;
  border-radius: inherit;
}

.robin-message-sender .robin-message-bubble-video .robin-side-text {
  margin: 0.375rem 0.3rem 0;
}

.robin-message-receiver .robin-message-bubble-video .robin-side-text {
  margin: 0.375rem 1rem 0;
}

video {
  width: 100%;
  height: 100%;
  border-radius: 16px 16px 0px 0px;
}

.v-lazy-image {
  filter: blur(5px);
  transition: filter 1.6s;
  will-change: filter;
}

.v-lazy-image-loaded {
  filter: blur(0);
}

/* Document */

.robin-message-sender .robin-message-bubble-document {
  background-color: #f4f6f8;
  border: 1px solid rgba(35, 107, 248, 0.2);
}

.robin-message-receiver .robin-message-bubble-document {
  background-color: #d3d7ea;
  cursor: pointer;
}

.robin-message-bubble-document {
  display: flex;
  flex-direction: column;
  padding: 0.375rem 0.375rem 0.375rem 0.375rem;
  /* border: 1px solid rgba(21, 174, 115, 0.2); */
  border-radius: inherit;
  /* background-color: #fafafa; */
}

.robin-message-bubble-document .robin-uploaded-document {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #ecebeb;
  border-radius: 12px;
}

.robin-message-sender .robin-message-bubble-document .robin-uploaded-document {
  padding: 0.5rem 0.938rem 0.5rem 0.5rem;
}

.robin-message-receiver .robin-message-bubble-document .robin-uploaded-document {
  padding: 0.5rem 0.938rem 0.5rem 0.5rem;
}

.robin-message-bubble-document .robin-uploaded-document .details {
  margin-right: 4rem;
}

.robin-message-bubble-document .robin-uploaded-document img {
  margin-right: 1rem;
  max-width: 100%;
  height: auto;
}

.robin-message-receiver .robin-message-bubble-document .robin-side-text {
  margin: 0.375rem 0 0;
}

/* .robin-message-receiver .robin-message-bubble-document >>> .robin-text {
  color: #8fbfad !important;
}

.robin-message-sender .robin-message-bubble-document >>> .robin-text {
  color: #4568d1 !important;
} */

.robin-message-sender .robin-message-bubble-document {
  display: flex;
  align-items: center;
  border: 1px solid rgba(35, 107, 248, 0.2);
  border-radius: inherit;
  background-color: #fafafa;
}

.robin-message-bubble-document >>> .robin-text {
  margin-left: 0.75rem;
}

.robin-message-sender .robin-popup-container {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
}

.robin-message-receiver .robin-popup-container {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 100;
}

.robin-popup-container.top {
  top: -68px;
}

.robin-message-sender .robin-popup-container >>> .robin-zoomIn,
.robin-message-sender .robin-popup-container >>> .robin-zoomOut {
  transform-origin: top left;
}

.robin-message-receiver .robin-popup-container >>> .robin-zoomIn,
.robin-message-receiver .robin-popup-container >>> .robin-zoomOut {
  transform-origin: top right;
}

.robin-message-sender .robin-popup-container.top >>> .robin-zoomIn,
.robin-message-sender .robin-popup-container.top >>> .robin-zoomOut {
  transform-origin: bottom left;
}

.robin-message-receiver .robin-popup-container.top >>> .robin-zoomIn,
.robin-message-receiver .robin-popup-container.top >>> .robin-zoomOut {
  transform-origin: bottom right;
}

/* Website & Email */

a {
  display: block;
  text-decoration: none;
  color: #4568d1;
  max-width: 220px;
}

@media (max-width: 480px) {
  .robin-message-bubble-inner,
  .robin-message-bubble-image,
  .robin-message-bubble-video,
  .robin-message-bubble-document {
    max-width: 220px;
  }

  .robin-message-bubble-document .robin-uploaded-document {
    justify-content: space-between;
  }

  .robin-message-bubble-document .robin-text {
    margin-left: 0;
  }

  .robin-message-bubble-document .robin-uploaded-document .details,
  .robin-message-bubble-document .robin-uploaded-document img {
    margin-right: 0;
  }
}
</style>
