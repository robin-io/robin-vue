<template>
  <div class="robin-message-container">
    <RGroupChatHeader :conversation="conversation" />
    <div class="robin-wrapper robin-flex robin-flex-column robin-flex-space-between">
      <Promised :promise="promise">
        <template v-slot:pending>
          <div class="robin-inner-wrapper robin-flex robin-flex-align-center">
            <div class="robin-spinner"></div>
          </div>
        </template>
        <template v-slot:default>
          <div class="robin-inner-wrapper" ref="messages">
            <div class="robin-message-bubble robin-flex robin-flex-wrap" :class="message.content.receiver_token === $user_token ? 'robin-message-sender' : 'robin-message-receiver robin-ml-auto'" v-for="message in messages" :key="message._id">
              <div class="robin-message-bubble-inner" v-if="!message.has_attachment">
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
              <div v-viewer class="robin-message-bubble-image" v-if="message.content.is_attachment && imageRegex.test(checkAttachmentType(message.content.attachment))">
                <v-lazy-image class="robin-uploaded-image" :src="message.content.attachment" />
                <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
                  <RText :font-size="12" color="#7a7a7a" as="p">
                    {{ formatTimeStamp(message.content.timestamp) }}
                  </RText>
                </span>
              </div>
              <div class="robin-message-bubble-video" v-if="message.content.is_attachment && videoRegex.test(checkAttachmentType(message.content.attachment))">
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
              <div class="robin-message-bubble-document" v-if="message.content.is_attachment && documentRegex.test(checkAttachmentType(message.content.attachment))">
                <RFileIcon />
                <RText as="span"> File </RText>
              </div>
              <!-- <div class="robin-message-bubble-document" v-if="message.content.is_attachment && documentRegex.test(checkAttachmentType(message.content.attachment))">
                <div class="robin-file">
                  <span class="material-icon material-icons-outlined"> article </span>
                  <RText as="span">
                    {{ getFileDetails(message.content.attachment).name.length > 6 ? getFileDetails(message.content.attachment).name.substring(0, 6) + '..' : getFileDetails(message.content.attachment).name }}
                  </RText>
                  <RText as="span">
                    {{ '.' + getFileDetails(message.content.attachment).extension }}
                  </RText>
                </div>
                <span class="robin-side-text robin-flex robin-flex-align-end robin-ml-auto">
                  <RText :font-size="12" color="#7a7a7a" as="p">
                    {{ formatTimeStamp(message.content.timestamp) }}
                  </RText>
                </span>
              </div> -->
            </div>
          </div>
        </template>
      </Promised>
      <!-- <RUnreadMessageBar :number="1" /> -->
    </div>
    <RMessageInputBar :conversation="conversation" @open-camera="openCamera()" :captured-image="capturedImage" />
    <RCamera ref="popup-1" :camera-opened="popUpState.cameraOpened" @close="closeCamera()" @captured-image="handleCapturedImage" v-show="popUpState.cameraOpened" />
    <!-- <RForwardMessage /> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Promised } from 'vue-promised'
import VLazyImage from 'v-lazy-image/v2'
import 'viewerjs/dist/viewer.css'
import { directive as viewer } from 'v-viewer'
import EventBus from '@/event-bus'
import Component from 'vue-class-component'
import RGroupChatHeader from '../RGroupChatHeader/RGroupChatHeader.vue'
import RMessageInputBar from '../RMessageInputBar/RMessageInputBar.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import RFileIcon from '../RFileIcon.vue'
import RCamera from '../RCamera/RCamera.vue'
import moment from 'moment'
import mime from 'mime'
// import RUnreadMessageBar from '../RUnreadMessagesBar/RUnreadMessagesBar.vue'
// import RForwardMessage from '../RForwardMessage/RForwardMessage.vue'

// eslint-disable-next-line
@Component<RGroupMessageContainer>({
  name: 'RGroupMessageContainer',
  components: {
    RGroupChatHeader,
    RText,
    RMessageInputBar,
    RCamera,
    RFileIcon,
    Promised,
    VLazyImage
    // RUnreadMessageBar
    // RForwardMessage
  },
  watch: {
    messages: {
      handler (val: any): void {
        this.scrollToBottom()
      },
      deep: true
    }
  },
  directives: { viewer: viewer({ debug: true }) }
})
export default class RGroupMessageContainer extends Vue {
  text = ''
  conversation = {} as any
  messages = [] as any
  promise = null as any
  capturedImage = null as any
  popUpState = {
    cameraOpened: false
  }

  imageRegex = /^image/ as any
  videoRegex = /^video/ as any
  documentRegex = /(csv|xlsx|xls|doc|docx|ppt|pptx|txt|pdf)$/
  emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  websiteRegex = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

  created () {
    EventBus.$on('conversation-opened', (conversation: any) => {
      this.messages = []
      this.conversation = conversation || []
      this.promise = this.getConversationMessages(conversation._id)
    })
    EventBus.$on('new-message', (message: any) => {
      if (message.conversation_id === this.conversation._id) {
        this.messages.push(message)
      }
      this.$conversations.forEach((conversation, index) => {
        if (conversation._id === this.conversation._id) {
          this.$conversations[index].updated_at = message.content.timestamp
          this.$conversations[index].last_message = message.content.msg
          const newConv = this.$conversations[index]
          this.$conversations.splice(index, 1)
          this.$conversations.unshift(newConv)
        }
      })
    })
  }

  formatTimeStamp (value: any): string {
    return moment(String(value)).format('h:mma').toUpperCase()
  }

  async getConversationMessages (id: string): Promise<void> {
    const resp = await this.$robin.getConversationMessages(id)

    if (!resp.error) {
      this.messages = resp.data == null ? [] : resp.data
    }

    console.log(this.messages)
    this.scrollToBottom()
  }

  scrollToBottom (): void {
    window.setTimeout(() => {
      const messages = this.$refs.messages as HTMLElement

      if (messages) {
        messages.scrollTop = 10000000
      }
    }, 100)
  }

  openCamera (): void {
    this.popUpState.cameraOpened = true
  }

  closeCamera (): void {
    const popup = this.$refs['popup-1'] as any
    console.log(popup)
    popup.$refs['popup-body'].classList.remove('robin-squeezeOut')
    popup.$refs['popup-body'].classList.add('robin-squeezeIn')

    window.setTimeout(() => {
      popup.$refs['popup-body'].classList.remove('robin-squeezeIn')
      popup.$refs['popup-body'].classList.add('robin-squeezeOut')

      this.popUpState.cameraOpened = false
    }, 300)
  }

  handleCapturedImage (val: Object): void {
    this.capturedImage = val
  }

  checkAttachmentType (attachmentUrl: String): string {
    const strArr = attachmentUrl.split('.')
    return `${mime.getType(strArr[strArr.length - 1])}`
  }

  getFileDetails (attachmentUrl: String): Object {
    const fileName = attachmentUrl.substring(attachmentUrl.lastIndexOf('/') + 1)
    const strArr = fileName.split('.')

    return {
      name: strArr[strArr.length - 2],
      extension: strArr[strArr.length - 1]
    }
  }
}
</script>

<style scoped>
.robin-message-container {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  /* box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.07); */
}

.robin-wrapper {
  flex: 1;
  height: 100%;
  overflow-y: hidden;
  background-color: #fafafa;
}

.robin-inner-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 2.688rem 2.688rem 1.25rem 3.125rem;
  overflow-y: auto;
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

/* .robin-message-sender {
  background-color: #f4f6f8;
  border: 1px solid rgba(35, 107, 248, 0.2);
}

.robin-message-receiver {
  background-color: #d3d7ea;
} */

/* Default bubble styles */

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
  padding: 0 0 0.5rem 0;
  border-radius: inherit;
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
}

.robin-message-receiver .robin-message-bubble-image .robin-side-text {
  margin: 0.375rem 1rem 0;
}

.robin-message-bubble-image img {
  cursor: pointer;
}

/* Video */

.robin-message-sender .robin-message-bubble-video {
  background-color: #f4f6f8;
  border: 1px solid rgba(35, 107, 248, 0.2);
}

.robin-message-receiver .robin-message-bubble-video {
  background-color: #d3d7ea;
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
  border-radius: inherit;
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
}

.robin-message-receiver .robin-message-bubble-document {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem 0.5rem 1rem;
  border: 1px solid rgba(21, 174, 115, 0.2);
  border-radius: inherit;
  background-color: #fafafa;
}

.robin-message-receiver .robin-message-bubble-document >>> .robin-text {
  color: #8fbfad !important;
}

.robin-message-sender .robin-message-bubble-document >>> .robin-text {
  color: #4568d1 !important;
}

.robin-message-sender .robin-message-bubble-document {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem 0.5rem 1rem;
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

/* .robin-message-sender .robin-message-bubble-document .robin-side-text {
  margin: 0.375rem 0.3rem 0;
}

.robin-message-receiver .robin-message-bubble-document .robin-side-text {
  margin: 0.375rem 1rem 0;
} */

/* .robin-message-bubble-document {
  display: flex;
  flex-direction: column;
  max-width: 325px;
  width: 178px;
  height: 130px;
  padding: 0 0 0.5rem 0;
}

.robin-message-bubble-document .robin-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: transparent;
}

.robin-message-bubble-document .robin-file > .material-icon {
  color: var(--primary-color);
  font-size: 1.3rem;
} */
</style>
