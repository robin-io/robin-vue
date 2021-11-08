<template>
  <div :class="sender ? 'robin-reply-sender' : 'robin-reply-receiver'" class="robin-reply-message-bubble" v-if="!getReplyMessage(message.reply_to).content.is_attachment">
    <RText :font-size="14" color="#15AE73" as="span" :line-height="20" class="robin-messager-name robin-mb-4"> {{ getReplyMessage(message.reply_to).sender_token === $user_token ? 'You' : getContactName(getReplyMessage(message.reply_to).content.sender_token) }} </RText>
    <RText :font-size="12" textWrap="pre-line" wordBreak="break-word" as="span">
      {{ getReplyMessage(message.reply_to).content.msg }}
    </RText>
  </div>
  <div :class="sender ? 'robin-reply-sender' : 'robin-reply-receiver'" class="robin-reply-message-bubble" v-else-if="imageRegex.test(checkAttachmentType(getReplyMessage(message.reply_to).content.attachment))">
    <RText :font-size="14" color="#15AE73" as="span" :line-height="20" class="robin-messager-name robin-mb-4"> {{ getReplyMessage(message.reply_to).sender_token === $user_token ? 'You' : getContactName(getReplyMessage(message.reply_to).content.sender_token) }} </RText>
    <v-lazy-image class="robin-uploaded-image" :src="getReplyMessage(message.reply_to).content.attachment" />
  </div>
  <div :class="sender ? 'robin-reply-sender' : 'robin-reply-receiver'" class="robin-reply-message-bubble" v-else-if="videoRegex.test(checkAttachmentType(getReplyMessage(message.reply_to).content.attachment))">
    <RText :font-size="14" color="#15AE73" as="span" :line-height="20" class="robin-messager-name robin-mb-4"> {{ getReplyMessage(message.reply_to).sender_token === $user_token ? 'You' : getContactName(getReplyMessage(message.reply_to).content.sender_token) }} </RText>
    <video controls>
      <source :src="getReplyMessage(message.reply_to).content.attachment" />
      Your browser does not support the video tag.
    </video>
  </div>
  <div :class="sender ? 'robin-reply-sender' : 'robin-reply-receiver'" class="robin-reply-message-bubble" v-else>
    <RText :font-size="14" color="#15AE73" as="span" :line-height="20" class="robin-messager-name robin-mb-4"> {{ getReplyMessage(message.reply_to).sender_token === $user_token ? 'You' : getContactName(getReplyMessage(message.reply_to).content.sender_token) }} </RText>
    <div class="robin-reply-document robin-flex robin-flex-align-center">
      <img v-if="images[getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension]" :src="images[getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension]" />
      <img v-else src="@/assets/default.png" />
      <div class="details robin-ml-5">
        <RText as="span" :fontSize="14"> {{ getFileDetails(getReplyMessage(message.reply_to).content.attachment).name.length > 9 ? getFileDetails(getReplyMessage(message.reply_to).content.attachment).name.substring(0, 9) + '...' + '.' + getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension : getFileDetails(getReplyMessage(message.reply_to).content.attachment).name + '.' + getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension }} </RText>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VLazyImage from 'v-lazy-image/v2'
import store from '../../../store/index'
import Component from 'vue-class-component'
import RText from '@/components/ChatList/RText/RText.vue'
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

interface ReplyMessage {
  [index: string]: any
}

const ComponentProps = Vue.extend({
  props: {
    messages: {
      type: Array as PropType<Array<any>>,
      default: () => []
    },
    message: {
      type: Object,
      default: () => {}
    },
    sender: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  }
})

// eslint-disable-next-line
@Component<ReplyMessageBubble>({
  name: 'ReplyMessageBubble',
  components: {
    RText,
    VLazyImage
  }
})
export default class ReplyMessageBubble extends ComponentProps {
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
    return store.state.users
  }

  get imageSelected () {
    return store.state.imageSelected
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

  checkArrayReceiverUserToken (message: any) {
    return message.some((item: { content: { sender_token: string } }) => item.content.sender_token === this.$user_token)
  }

  getContactName (sender_token: string): string {
    const index = this.robinUsers.findIndex((user) => user.userToken === sender_token) as number
    const user = this.robinUsers[index] as any
    return user ? user.userName : ''
  }

  getReplyMessage (id: string): ReplyMessage {
    const message: any = this.messages.find((element: any) => {
      if (Array.isArray(element)) {
        return element.find((item) => item._id === id)
      }

      if (!Array.isArray(element)) {
        if (element._id === id) {
          return element
        }
      }

      return false
    })

    console.log(message)

    if (Array.isArray(message)) {
      return message[this.imageSelected]
    }

    return message
  }
}
</script>

<style scoped>
.robin-reply-sender.robin-reply-message-bubble {
  background-color: rgba(177, 179, 180, 0.2);
  border-radius: 7.5px;
  width: 100%;
  padding: 0.4rem 0.3rem;
}

.robin-reply-receiver.robin-reply-message-bubble {
  background-color: rgba(163, 166, 180, 0.2);
  border-radius: 7.5px;
  width: 100%;
  position: relative;
  padding: 0.4rem 0.3rem;
}

.robin-uploaded-image {
  width: 100%;
  height: 200px;
}

video {
  width: 100%;
  max-height: 100px;
}

.robin-reply-document img {
  width: 20px;
}

/* Website & Email */

a {
  display: block;
  text-decoration: none;
  color: #4568d1;
  max-width: 220px;
}
</style>
