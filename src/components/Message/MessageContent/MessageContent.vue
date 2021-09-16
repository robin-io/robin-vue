<template>
  <div class="robin-message-bubble robin-flex robin-flex-wrap robin-flex-align-center" :class="!validateMessages(message) ? 'robin-message-sender' : 'robin-message-receiver robin-ml-auto robin-flex-row-reversed'" v-on-clickaway="closeModal">
    <RCheckBox v-if="selectMessagesOpen" @clicked="toggleCheckAction($event)" />
    <div class="robin-bubble" :class="!validateMessages(message) ? 'robin-ml-5' : 'robin-mr-5'" v-if="!Array.isArray(message)">
      <div class="robin-message-bubble-inner" v-if="!message.has_attachment" @click="openModal()">
        <RText v-if="conversation.isGroup" :font-size="12" color="#15AE73" as="span" :line-height="20"> Precious Ogar </RText>
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
          <img v-if="images[getFileDetails(message.content.attachment).extension]" :src="`/images/${getFileDetails(message.content.attachment).extension}.png`" />
          <img v-else src="/images/default.png" />
          <div class="details robin-flex robin-h-100 robin-flex-align-center">
            <RText as="span"> {{ getFileDetails(message.content.attachment).name.length > 9 ? getFileDetails(message.content.attachment).name.substring(0, 9) + '...' + '.' + getFileDetails(message.content.attachment).extension : getFileDetails(message.content.attachment).name + '.' + getFileDetails(message.content.attachment).extension }} </RText>
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
    <MessageGrid :class="!validateMessages(message) ? 'robin-ml-5' : 'robin-mr-5'" v-if="Array.isArray(message) && message.filter((image) => !image.is_deleted).length > 0" :message="message.filter((image) => !image.is_deleted)" :conversation="conversation" @open-preview="openPreview($event)" />
    <RMessagePopOver v-show="messagePopup.opened && validateMessages(message)" :class="{ top: lastId === message._id && scroll }" @close-modal="closeModal()" ref="popup-1" :id="message._id" :message="message" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Promised } from 'vue-promised'
import VLazyImage from 'v-lazy-image/v2'
import { mixin as clickaway } from 'vue-clickaway'
// import 'viewerjs/dist/viewer.css'
// import { directive as viewer } from 'v-viewer'
import { State } from 'vuex-class'
import { RootState } from '@/utils/types'
import Component from 'vue-class-component'
import RDownloadButton from '../RDownloadButton/RDownloadButton.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import MessageGrid from '../MessageGrid/MessageGrid.vue'
import RMessagePopOver from '../RMessagePopOver/RMessagePopOver.vue'
import RCheckBox from '@/components/ChatList/RCheckBox/RCheckBox.vue'
import moment from 'moment'
import mime from 'mime'

const ComponentProps = Vue.extend({
  props: {
    message: {
      type: [Object, Array],
      default: () => {}
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
    Promised,
    VLazyImage,
    MessageGrid,
    RMessagePopOver,
    RCheckBox
    // RUnreadMessageBar
    // RForwardMessage
  },
  mixins: [clickaway]
  // directives: { viewer: viewer({ debug: true }) }
})
export default class MessageContent extends ComponentProps {
  @State('selectMessagesOpen') selectMessagesOpen?: RootState
  // vViewerOptions = {
  //   toolbar: false,
  //   title: false,
  //   navbar: false
  // } as any

  images = {
    pdf: 'pdf.png',
    doc: 'doc.png',
    docx: 'docx.png',
    csv: 'csv.csv',
    ppt: 'ppt.png',
    rtf: 'rtf.png',
    rar: 'rar.png',
    tar: 'tar.png',
    xls: 'xls.png',
    xlsx: 'xlsx.png',
    txt: 'txt.png',
    odt: 'odt.png',
    md: 'md.png',
    '7z': '7z.png',
    zip: 'zip.png',
    html: 'html.png'
  } as any

  imageRegex = /^image/ as any
  videoRegex = /^video/ as any
  documentRegex = /(csv|xlsx|xls|doc|docx|ppt|pptx|txt|pdf|ppt|rtf|rar|tar|odt|md|zip|7z|zip|html)$/
  emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  websiteRegex = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

  formatTimeStamp (value: any): string {
    return moment(String(value)).format('h:mma').toUpperCase()
  }

  checkAttachmentType (attachmentUrl: String): string {
    const strArr = attachmentUrl.split('.')
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

    element.setAttribute('download', fileDetails.name + ' ' + fileDetails.extension)
    element.setAttribute('href', attachmentUrl)
    element.click()
  }

  openModal (): void {
    this.messagePopup.opened = true
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

  validateMessages (message: any): boolean {
    if (Array.isArray(message) && this.checkArrayReceiverUserToken(message)) {
      return true
    }

    if (message.content && message.content.sender_token === this.$user_token) {
      return true
    }

    return false
  }

  toggleCheckAction (val: boolean): void {
    this.$emit('toggle-check-action', val)
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

.robin-message-sender + .robin-message-receiver {
  border-radius: 16px 16px 0px 16px;
}

.robin-message-receiver + .robin-message-sender {
  border-radius: 16px 16px 16px 0px;
}

.robin-inner-wrapper .robin-message-sender:last-child {
  border-radius: 16px 16px 16px 0px;
}

.robin-inner-wrapper .robin-message-receiver:last-child {
  border-radius: 16px 16px 0px 16px;
}

.robin-message-bubble {
  position: relative;
  border-radius: 16px;
  /* margin-top: 10px; */
}

.robin-bubble {
  width: max-content;
  border-radius: inherit;
}

/* Bubble styles */

.robin-message-sender + .robin-message-receiver {
  margin-top: 1rem;
}

.robin-message-sender + .robin-message-sender,
.robin-message-receiver + .robin-message-receiver {
  margin-top: 0.25rem;
}

.robin-message-sender + .robin-message-receiver {
  border-radius: 16px 16px 0px 16px;
}

.robin-message-receiver + .robin-message-sender {
  border-radius: 16px 16px 16px 0px;
}

.robin-inner-wrapper .robin-message-sender:last-child {
  border-radius: 16px 16px 16px 0px;
}

.robin-inner-wrapper .robin-message-receiver:last-child {
  border-radius: 16px 16px 0px 16px;
}

.robin-message-bubble {
  border-radius: 16px;
  /* margin-top: 10px; */
}

.robin-message-receiver .robin-side-text {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.robin-message-sender .robin-side-text {
  flex: 1;
  display: flex;
  justify-content: flex-start;
}

/* Text */

.robin-message-sender .robin-message-bubble-inner {
  background-color: #f4f6f8;
  border: 1px solid rgba(35, 107, 248, 0.2);
}

.robin-message-receiver .robin-message-bubble-inner {
  background-color: #d3d7ea;
  cursor: pointer;
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

/* Website & Email */

a {
  display: block;
  text-decoration: none;
  color: #4568d1;
  max-width: 220px;
}
</style>
