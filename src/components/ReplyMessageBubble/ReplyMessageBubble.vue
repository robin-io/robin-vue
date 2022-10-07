<template>
  <div :class="sender ? 'robin-reply-sender' : 'robin-reply-receiver'" class="robin-reply-message-bubble robin-flex robin-flex-align-start" v-if="getReplyMessage(message.reply_to) && !getReplyMessage(message.reply_to).content.is_attachment" @click="scrollToRepliedMessage(message.reply_to)">
    <div>
      <Content :font-size="14" color="#51545C" as="span" :line-height="20" class="robin-messager-name robin-mb-4"> {{ getReplyMessage(message.reply_to).sender_token === $user_token ? 'You' : getContactName(getReplyMessage(message.reply_to).sender_token) }} </Content>

      <Content :font-size="14" color="#8D9091" textWrap="pre-line" wordBreak="break-word" as="span" v-if="!validateLinkInMessage().containsEmail && !validateLinkInMessage().containsWebsite">
        {{ getReplyMessage(message.reply_to).content.msg }}
      </Content>

      <div class="robin-link-container" v-html="injectHtml()" v-if="(validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) || validateLinkInMessage().containsEmail || validateLinkInMessage().containsWebsite"></div>
    </div>
  </div>

  <div :class="sender ? 'robin-reply-sender' : 'robin-reply-receiver'" class="robin-reply-message-bubble" v-else-if="getReplyMessage(message.reply_to) && imageRegex.test(checkAttachmentType(getReplyMessage(message.reply_to).content.attachment))" @click="scrollToRepliedMessage(message.reply_to)">
    <Content :font-size="14" color="#51545C" as="span" :line-height="20" class="robin-messager-name robin-mb-4"> {{ getReplyMessage(message.reply_to).sender_token === $user_token ? 'You' : getContactName(getReplyMessage(message.reply_to).sender_token) }} </Content>

    <v-lazy-image class="robin-uploaded-image" :src="getReplyMessage(message.reply_to).content.attachment" />

    <Content :max-width="getReplyMessage(message.reply_to).content.msg.length < 120 ? '217' : '270'" textWrap="pre-line" wordBreak="break-word" as="span" v-if="!validateLinkInMessage().containsEmail && !validateLinkInMessage().containsWebsite && getReplyMessage(message.reply_to).content.msg && getReplyMessage(message.reply_to).content.msg != 'undefined'">
      {{ getReplyMessage(message.reply_to).content.msg }}
    </Content>

    <div class="robin-link-container" v-html="injectHtml()" v-if="(validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) || validateLinkInMessage().containsEmail || (validateLinkInMessage().containsWebsite && getReplyMessage(message.reply_to).content.msg && getReplyMessage(message.reply_to).content.msg != 'undefined')"></div>
  </div>

  <div :class="sender ? 'robin-reply-sender' : 'robin-reply-receiver'" class="robin-reply-message-bubble" v-else-if="getReplyMessage(message.reply_to) && videoRegex.test(checkAttachmentType(getReplyMessage(message.reply_to).content.attachment))" @click="scrollToRepliedMessage(message.reply_to)">
    <Content :font-size="14" color="#51545C" as="span" :line-height="20" class="robin-messager-name robin-mb-4"> {{ getReplyMessage(message.reply_to).sender_token === $user_token ? 'You' : getContactName(getReplyMessage(message.reply_to).sender_token) }} </Content>

    <video controls>
      <source :src="getReplyMessage(message.reply_to).content.attachment" />
      Your browser does not support the video tag.
    </video>

    <Content :max-width="getReplyMessage(message.reply_to).content.msg.length < 120 ? '217' : '270'" textWrap="pre-line" wordBreak="break-word" as="span" v-if="!validateLinkInMessage().containsEmail && !validateLinkInMessage().containsWebsite && getReplyMessage(message.reply_to).content.msg && getReplyMessage(message.reply_to).content.msg != 'undefined'">
      {{ getReplyMessage(message.reply_to).content.msg }}
    </Content>

    <div class="robin-link-container" v-html="injectHtml()" v-if="(validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) || validateLinkInMessage().containsEmail || (validateLinkInMessage().containsWebsite && getReplyMessage(message.reply_to).content.msg && getReplyMessage(message.reply_to).content.msg != 'undefined')"></div>
  </div>

  <div :class="sender ? 'robin-reply-sender' : 'robin-reply-receiver'" class="robin-reply-message-bubble" v-else-if="getReplyMessage(message.reply_to) && documentRegex.test(checkAttachmentType(getReplyMessage(message.reply_to).content.attachment))" @click="scrollToRepliedMessage(message.reply_to)">
    <Content :font-size="14" color="#51545C" as="span" :line-height="20" class="robin-messager-name robin-mb-4"> {{ getReplyMessage(message.reply_to).sender_token === $user_token ? 'You' : getContactName(getReplyMessage(message.reply_to).sender_token) }} </Content>

    <div class="robin-reply-document robin-flex robin-flex-align-center" v-if="getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension !== 'mp3'">
      <img v-if="assets[getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension]" :src="assets[getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension]" alt="document" />

      <img v-else :src="assets['default']" />

      <div class="details robin-ml-5">
        <Content as="span" :fontSize="14"> {{ getFileDetails(getReplyMessage(message.reply_to).content.attachment).name.length > 9 ? getFileDetails(getReplyMessage(message.reply_to).content.attachment).name.substring(0, 9) + '...' + '.' + getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension : getFileDetails(getReplyMessage(message.reply_to).content.attachment).name + '.' + getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension }} </Content>
      </div>
    </div>

    <AudioPlayer :message="getReplyMessage(message.reply_to)" :index="`reply-${index}`" :show-progress-time="false" v-else />

    <Content :max-width="getReplyMessage(message.reply_to).content.msg.length < 120 ? '217' : '270'" textWrap="pre-line" wordBreak="break-word" as="span" v-if="!validateLinkInMessage().containsEmail && !validateLinkInMessage().containsWebsite && getReplyMessage(message.reply_to).content.msg && getReplyMessage(message.reply_to).content.msg != 'undefined'">
      {{ getReplyMessage(message.reply_to).content.msg }}
    </Content>

    <div class="robin-link-container" v-html="injectHtml()" v-if="(validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) || validateLinkInMessage().containsEmail || (validateLinkInMessage().containsWebsite && getReplyMessage(message.reply_to).content.msg && getReplyMessage(message.reply_to).content.msg != 'undefined')"></div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VLazyImage from 'v-lazy-image/v2'
import store from '@/store/index'
import Component from 'vue-class-component'
import Content from '@/components/Content/Content.vue'
import mime from 'mime'
import AudioPlayer from '@/components/AudioPlayer/AudioPlayer.vue'
import assets from '@/utils/assets.json'

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
    },
    index: {
      type: Number as PropType<number>,
      default: 0
    }
  }
})

// eslint-disable-next-line
@Component<ReplyMessageBubble>({
  name: 'ReplyMessageBubble',
  components: {
    Content,
    VLazyImage,
    AudioPlayer
  }
})
export default class ReplyMessageBubble extends ComponentProps {
  props = {} as any
  imageRegex = /^image/ as any
  videoRegex = /^video/ as any
  documentRegex = /(csv|xlsx|xls|doc|docx|ppt|pptx|txt|pdf|ppt|rtf|rar|tar|odt|md|zip|7z|zip|mp3|html)$/
  emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  websiteRegex = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

  get imageSelected () {
    return store.state.imageSelected
  }

  get assets (): any {
    return assets
  }

  checkAttachmentType (attachmentUrl: String): string {
    const strArr = attachmentUrl.split('.')

    if (mime.getType(strArr[strArr.length - 1]) === 'application/msword') {
      return 'doc'
    }

    if (mime.getType(strArr[strArr.length - 1]) === 'audio/mpeg') {
      return 'mp3'
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
    return message.some((item: ObjectType) => item.sender_token === this.$user_token)
  }

  getContactName (sender_token: string): string {
    const index = this.$robin_users.findIndex((user) => user.userToken === sender_token) as number
    const user = this.$robin_users[index] as any
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

    if (Array.isArray(message)) {
      return message.find((element: any) => element._id === id)
    }

    // (message)

    return message
  }

  validateLinkInMessage () {
    const texts = this.getReplyMessage(this.message.reply_to).content.msg.split(' ')

    return {
      containsWebsite: texts.some((text: string) => this.websiteRegex.test(text)),
      containsEmail: texts.some((text: string) => this.emailRegex.test(text))
    }
  }

  getTextsInMessage () {
    return {
      texts: this.getReplyMessage(this.message.reply_to).content.msg.split(' '),
      length: this.getReplyMessage(this.message.reply_to).content.msg.split(' ').length
    }
  }

  injectHtml (): String {
    let returnedMessage = ''

    for (const word of this.getReplyMessage(this.message.reply_to).content.msg.split(' ')) {
      if (this.emailRegex.test(word)) {
        returnedMessage += String.raw` <a target="_blank" href="mailto:${word}" > ${word} <a/>`
      } else if (this.websiteRegex.test(word)) {
        if (word.includes('http://') || word.includes('https://')) {
          returnedMessage += String.raw` <a target="_blank" href="${word}" > ${word} <a/>`
        } else {
          returnedMessage += String.raw` <a target="_blank" href="http://${word}"> ${word} <a/>`
        }
      } else {
        returnedMessage += ` ${word}`
      }
    }

    return returnedMessage
  }

  // Method to scroll to the position of a replied message
  scrollToRepliedMessage (id: string) {
    this.$emit('scroll-replied-message', id)
  }
}
</script>

<style scoped>
.robin-reply-sender.robin-reply-message-bubble {
  background-color: var(--rb-bg-color);
  width: 100%;
  padding: 0.4rem 0.625rem;
  border-left: 3px solid var(--rb-color19);
  position: relative;
  margin-bottom: 0.625rem;
}

.robin-reply-receiver.robin-reply-message-bubble {
  background-color: var(--rb-bg-color);
  width: 100%;
  position: relative;
  padding: 0.4rem 0.625rem;
  border-left: 3px solid var(--rb-color19);
  margin-bottom: 0.625rem;
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

.robin-link-container {
  font-size: 0.825rem;
  max-width: 120px;
}

.robin-link-container >>> a {
  color: #4568d1;
  max-width: 120px;
}

.robin-link-preview {
  width: max-content;
  height: 100%;
  display: flex;
  margin-left: auto;
  position: absolute;
  top: 0;
  right: 0;
}

.robin-link-preview .robin-card {
  width: 100%;
  height: 100%;
}

.robin-link-preview .robin-card-img-top {
  width: 40px;
  height: 100%;
  object-fit: cover;
}

/* Website & Email */

a {
  display: block;
  text-decoration: none;
  color: #4568d1;
  max-width: 220px;
}
</style>
