<template>
  <div
    :class="sender ? 'robin-reply-sender' : 'robin-reply-receiver'"
    class="robin-reply-message-bubble robin-flex robin-flex-align-start"
    v-if="
      getReplyMessage(message.reply_to) && !getReplyMessage(message.reply_to).content.is_attachment
    "
    @click="scrollToRepliedMessage(message.reply_to)"
  >
    <div>
      <message-content
        :font-size="14"
        color="#51545C"
        as="span"
        :line-height="20"
        class="robin-messager-name robin-mb-4"
      >
        {{
          getReplyMessage(message.reply_to).sender_token === $user_token
            ? 'You'
            : getContactName(getReplyMessage(message.reply_to).sender_token)
        }}
      </message-content>

      <message-content
        :font-size="14"
        color="#8D9091"
        textWrap="pre-line"
        wordBreak="break-word"
        as="span"
        v-if="!validateLinkInMessage().containsEmail && !validateLinkInMessage().containsWebsite"
      >
        {{ getReplyMessage(message.reply_to).content.msg }}
      </message-content>

      <div
        class="robin-link-container"
        v-html="injectHtml()"
        v-if="
          (validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) ||
          validateLinkInMessage().containsEmail ||
          validateLinkInMessage().containsWebsite
        "
      ></div>
    </div>
  </div>

  <div
    :class="sender ? 'robin-reply-sender' : 'robin-reply-receiver'"
    class="robin-reply-message-bubble"
    v-else-if="
      getReplyMessage(message.reply_to) &&
      imageRegex.test(getType(getReplyMessage(message.reply_to).content.attachment))
    "
    @click="scrollToRepliedMessage(message.reply_to)"
  >
    <message-content
      :font-size="14"
      color="#51545C"
      as="span"
      :line-height="20"
      class="robin-messager-name robin-mb-4"
    >
      {{
        getReplyMessage(message.reply_to).sender_token === $user_token
          ? 'You'
          : getContactName(getReplyMessage(message.reply_to).sender_token)
      }}
    </message-content>

    <v-lazy-image
      class="robin-uploaded-image"
      :src="getImage(getReplyMessage(message.reply_to).content.attachment)"
    />

    <message-content
      :max-width="getReplyMessage(message.reply_to).content.msg.length < 120 ? '217' : '270'"
      textWrap="pre-line"
      wordBreak="break-word"
      as="span"
      v-if="
        !validateLinkInMessage().containsEmail &&
        !validateLinkInMessage().containsWebsite &&
        getReplyMessage(message.reply_to).content.msg &&
        getReplyMessage(message.reply_to).content.msg != 'undefined'
      "
    >
      {{ getReplyMessage(message.reply_to).content.msg }}
    </message-content>

    <div
      class="robin-link-container"
      v-html="injectHtml()"
      v-if="
        (validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) ||
        validateLinkInMessage().containsEmail ||
        (validateLinkInMessage().containsWebsite &&
          getReplyMessage(message.reply_to).content.msg &&
          getReplyMessage(message.reply_to).content.msg != 'undefined')
      "
    ></div>
  </div>

  <div
    :class="sender ? 'robin-reply-sender' : 'robin-reply-receiver'"
    class="robin-reply-message-bubble"
    v-else-if="
      getReplyMessage(message.reply_to) &&
      videoRegex.test(getType(getReplyMessage(message.reply_to).content.attachment))
    "
    @click="scrollToRepliedMessage(message.reply_to)"
  >
    <message-content
      :font-size="14"
      color="#51545C"
      as="span"
      :line-height="20"
      class="robin-messager-name robin-mb-4"
    >
      {{
        getReplyMessage(message.reply_to).sender_token === $user_token
          ? 'You'
          : getContactName(getReplyMessage(message.reply_to).sender_token)
      }}
    </message-content>

    <video controls>
      <source :src="getReplyMessage(message.reply_to).content.attachment" />
      Your browser does not support the video tag.
    </video>

    <message-content
      :max-width="getReplyMessage(message.reply_to).content.msg.length < 120 ? '217' : '270'"
      textWrap="pre-line"
      wordBreak="break-word"
      as="span"
      v-if="
        !validateLinkInMessage().containsEmail &&
        !validateLinkInMessage().containsWebsite &&
        getReplyMessage(message.reply_to).content.msg &&
        getReplyMessage(message.reply_to).content.msg != 'undefined'
      "
    >
      {{ getReplyMessage(message.reply_to).content.msg }}
    </message-content>

    <div
      class="robin-link-container"
      v-html="injectHtml()"
      v-if="
        (validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) ||
        validateLinkInMessage().containsEmail ||
        (validateLinkInMessage().containsWebsite &&
          getReplyMessage(message.reply_to).content.msg &&
          getReplyMessage(message.reply_to).content.msg != 'undefined')
      "
    ></div>
  </div>

  <div
    :class="sender ? 'robin-reply-sender' : 'robin-reply-receiver'"
    class="robin-reply-message-bubble"
    v-else-if="
      getReplyMessage(message.reply_to) &&
      documentRegex.test(getType(getReplyMessage(message.reply_to).content.attachment))
    "
    @click="scrollToRepliedMessage(message.reply_to)"
  >
    <message-content
      :font-size="14"
      color="#51545C"
      as="span"
      :line-height="20"
      class="robin-messager-name robin-mb-4"
    >
      {{
        getReplyMessage(message.reply_to).sender_token === $user_token
          ? 'You'
          : getContactName(getReplyMessage(message.reply_to).sender_token)
      }}
    </message-content>

    <div
      class="robin-reply-document robin-flex robin-flex-align-center"
      v-if="
        getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension !== 'mp3'
      "
    >
      <img
        v-if="
          assets[getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension]
        "
        :src="
          assets[getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension]
        "
        alt="document"
      />

      <img v-else :src="assets['default']" />

      <div class="details robin-ml-5">
        <message-content as="span" :fontSize="14">
          {{
            getFileDetails(getReplyMessage(message.reply_to).content.attachment).name.length > 9
              ? getFileDetails(getReplyMessage(message.reply_to).content.attachment).name.substring(
                  0,
                  9
                ) +
                '...' +
                '.' +
                getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension
              : getFileDetails(getReplyMessage(message.reply_to).content.attachment).name +
                '.' +
                getFileDetails(getReplyMessage(message.reply_to).content.attachment).extension
          }}
        </message-content>
      </div>
    </div>

    <audio-player
      :message="getReplyMessage(message.reply_to)"
      :index="`reply-${index}`"
      :show-progress-time="false"
      v-else
    />

    <message-content
      :max-width="getReplyMessage(message.reply_to).content.msg.length < 120 ? '217' : '270'"
      textWrap="pre-line"
      wordBreak="break-word"
      as="span"
      v-if="
        !validateLinkInMessage().containsEmail &&
        !validateLinkInMessage().containsWebsite &&
        getReplyMessage(message.reply_to).content.msg &&
        getReplyMessage(message.reply_to).content.msg != 'undefined'
      "
    >
      {{ getReplyMessage(message.reply_to).content.msg }}
    </message-content>

    <div
      class="robin-link-container"
      v-html="injectHtml()"
      v-if="
        (validateLinkInMessage().containsEmail && validateLinkInMessage().containsWebsite) ||
        validateLinkInMessage().containsEmail ||
        (validateLinkInMessage().containsWebsite &&
          getReplyMessage(message.reply_to).content.msg &&
          getReplyMessage(message.reply_to).content.msg != 'undefined')
      "
    ></div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VLazyImage from 'v-lazy-image/v2'
import store from '@/store/index'
import Component, { mixins } from 'vue-class-component'
import Content from '@/components/Content/Content.vue'
import { createUUID, checkAttachmentType, convertArrayBufferToFile } from '@/utils/helpers'
import { EmailRegex, WebsiteRegex, VideoRegex, ImageRegex, DocumentRegex } from '@/utils/constants'
import AudioPlayer from '@/components/AudioPlayer/AudioPlayer.vue'
import assets from '@/utils/assets.json'
import ConversationMixin from '@/mixins/conversation-mixins'

interface ReplyMessage {
  [index: string]: any
}

const ComponentProps = mixins(ConversationMixin).extend({
  props: {
    messages: {
      type: Array as PropType<Array<any>>,
      default: () => []
    },
    message: {
      type: Object,
      default: () => ({})
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
    'message-content': Content,
    VLazyImage,
    AudioPlayer
  }
})
export default class ReplyMessageBubble extends ComponentProps {
  props = {} as any
  imageRegex = ImageRegex as any
  videoRegex = VideoRegex as any
  documentRegex = DocumentRegex
  emailRegex = EmailRegex
  websiteRegex = WebsiteRegex
  checkAttachmentType = checkAttachmentType
  convertArrayBufferToFile = convertArrayBufferToFile
  getContactName!: (sender_token: string) => string

  get imageSelected () {
    return store.state.imageSelected
  }

  get assets (): any {
    return assets
  }

  getType (attachment: any): string {
    return this.checkAttachmentType(attachment, this.getReplyMessage(this.message.reply_to))
  }

  getFileDetails (attachment: any): { name: any; extension: any } {
    let fileName = ''
    let strArr = [] as Array<string>

    if (typeof attachment !== 'string') {
      const name = createUUID(36)
      const extension = this.getType(attachment)

      return {
        name,
        extension
      }
    } else {
      fileName = attachment.substring(attachment.lastIndexOf('/') + 1)
      strArr = fileName.split('.')
    }

    return {
      name: strArr[strArr.length - 2],
      extension: strArr[strArr.length - 1]
    }
  }

  getImage (attachment: any) {
    if (typeof attachment !== 'string') {
      return this.convertArrayBufferToFile(attachment, this.getReplyMessage(this.message.reply_to))
    }

    return attachment
  }

  checkArrayReceiverUserToken (message: any) {
    return message.some((item: ObjectType) => item.sender_token === this.$user_token)
  }

  getReplyMessage (id: string): ReplyMessage {
    const message = this.messages.find((element: ObjectType | Array<ObjectType>) => {
      if (Array.isArray(element)) {
        return element.find((item) => item._id === id)
      }
      return element._id === id
    }) as ObjectType | Array<ObjectType>

    if (Array.isArray(message)) {
      const found = message.find((element: ObjectType) => element._id === id)
      if (found) {
        return found
      }
    }

    return message
  }

  validateLinkInMessage () {
    const texts = this.getReplyMessage(this.message.reply_to).content.msg.split(' ')

    return {
      containsWebsite: texts.some((text: string) => {
        if (this.websiteRegex.test(text)) return true
        else if (text.includes('http://')) return true
        else if (text.includes('https://')) return true

        return false
      }),
      containsEmail: texts.some((text: string) => this.emailRegex.test(text))
    }
  }

  getTextsInMessage () {
    return {
      texts: this.getReplyMessage(this.message.reply_to).content.msg.split(' '),
      length: this.getReplyMessage(this.message.reply_to).content.msg.split(' ').length
    }
  }

  injectHtml (): string {
    let returnedMessage = ''

    for (const word of this.getReplyMessage(this.message.reply_to).content.msg.split(' ')) {
      if (this.emailRegex.test(word)) {
        returnedMessage += String.raw` <a target="_blank" href="mailto:${word}">${word}<a/>`
      } else if (this.websiteRegex.test(word) || word.includes('http://')) {
        returnedMessage += String.raw` <a target="_blank" href="${word}">${word}<a/>`
      } else if (this.websiteRegex.test(word) || word.includes('https://')) {
        returnedMessage += String.raw` <a target="_blank" href="${word}">${word}<a/>`
      } else if (this.websiteRegex.test(word)) {
        returnedMessage += String.raw` <a target="_blank" href="https://${word}">${word}<a/>`
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
