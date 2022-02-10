<template>
  <div class="robin-modal-container robin-flex robin-flex-column robin-slideInRight" ref="popup-body">
    <header class="robin-header">
      <IconButton name="remove" @close="$emit('close')" emit="close" :to-emit="true" :to-click-away="false" />
      <RText font-weight="400" :font-size="16" class="robin-ml-12">{{ !currentConversation.is_group ? 'Chat' : 'Group' }} Info</RText>
    </header>

    <div class="robin-wrapper robin-slideIn">
      <div class="robin-profile">
        <RAvatar v-if="!currentConversation.is_group" class="robin-mb-8" />
        <RGroupAvatar v-else class="robin-mb-8" />

        <RText fontWeight="500" as="h3" class="robin-mb-8">{{ !currentConversation.is_group ? currentConversation.sender_name : currentConversation.name }}</RText>

        <RText color="#51545C" :fontSize="12" :text-align="'center'" as="p" class="robin-mb-8" v-show="currentConversation.is_group">200 Members</RText>

        <RText color="#51545C" :fontSize="12" :text-align="'center'" as="p" class="robin-flex" v-if="currentConversation.is_group"
          >Created <RText :fontSize="12">{{ formatRecentMessageTime(currentConversation.created_at) }}</RText
          >, By <RText :fontSize="12">{{ getGroupCreator() }}</RText></RText
        >

        <RText color="#51545C" :fontSize="12" :text-align="'center'" as="p" v-show="!currentConversation.is_group">{{ currentConversation.owner_email }}</RText>
      </div>

      <!-- personal -->
      <!-- <RText color="#1F222D" :fontSize="14" as="p" class="robin-mb-13">Files</RText>
      <div class="robin-files">
        <div class="robin-upload robin-flex robin-flex-align-center">
          <img :src="assets['default']" />

          <div class="details robin-flex robin-flex-column robin-h-100 robin-flex-align-center">
            <RText as="span" :fontSize="14"> default.pdf </RText>

            <RText as="span" color="#7A7A7A" :fontSize="14"> 123kb </RText>
          </div>

          <IconButton name="download" class="robin-ml-auto" color="#15AE73" :to-emit="false" :to-click-away="false" />
        </div>
      </div>

      <RText color="#1F222D" :fontSize="14" as="p" class="robin-mb-13">Media</RText>

      <div class="robin-media"></div> -->

      <!-- group -->
      <!-- <RButton :fontSize="14" color="#ea8d51">Load More</RButton> -->

      <div class="robin-nav-container robin-slideIn">
        <div :class="{ active: nav == 'Media' }" @click="nav = 'Media'">Media</div>

        <div :class="{ active: nav == 'Links' }" @click="nav = 'Links'">Links</div>

        <div :class="{ active: nav == 'Docs' }" @click="nav = 'Docs'">Docs</div>
      </div>

      <!-- Media -->
      <div v-show="nav === 'Media'" class="robin-media-grids">
        <div class="robin-media-grid" v-for="(media, mediaIndex) in media.slice(0, mediaStop)" :key="mediaIndex">
          <v-lazy-image v-if="imageRegex.test(checkAttachmentType(media.content.attachment))" class="robin-uploaded-image" :src="media.content.attachment" @click.native="openImagePreview([media])" />

          <video v-if="videoRegex.test(checkAttachmentType(media.content.attachment))" controls>
            <source :src="media.content.attachment" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      <!-- Links -->
      <div v-show="nav === 'Links'" class="robin-link-container">
        <a class="robin-link-preview" v-for="(message, messageIndex) in links.slice(0, linkStop)" :key="messageIndex" :href="getTextsInMessage(message).texts[getTextsInMessage(message).length - 1].includes('http') || getTextsInMessage(message).texts[getTextsInMessage(message).length - 1].includes('https') ? getTextsInMessage(message).texts[getTextsInMessage(message).length - 1] : `https://${getTextsInMessage(message).texts[getTextsInMessage(message).length - 1]}`">
          <div>
            <i class="robin-material-icon"> link </i>
          </div>
          {{ getTextsInMessage(message).texts[getTextsInMessage(message).length - 1].includes('http') || getTextsInMessage(message).texts[getTextsInMessage(message).length - 1].includes('https') ? getTextsInMessage(message).texts[getTextsInMessage(message).length - 1] : `https://${getTextsInMessage(message).texts[getTextsInMessage(message).length - 1]}` }}
        </a>
      </div>

      <!-- Documents -->

      <div class="robin-document-grids" v-show="nav === 'Docs'">
        <div class="robin-uploaded-documents" v-for="(document, documentIndex) in documents" :key="documentIndex">
          <img v-if="assets[getFileDetails(document.content.attachment).extension]" :src="assets[getFileDetails(document.content.attachment).extension]" alt="document" />

          <img v-else :src="assets['default']" />

          <div class="detail robin-flex robin-h-100 robin-flex-align-center">
            <RText as="span" :fontSize="14"> {{ getFileDetails(document.content.attachment).name.length > 9 ? getFileDetails(document.content.attachment).name.substring(0, 9) + '...' + '.' + getFileDetails(document.content.attachment).extension : getFileDetails(document.content.attachment).name + '.' + getFileDetails(document.content.attachment).extension }} </RText>
          </div>

          <IconButton name="download" color="#15AE73" @clicked="downloadFile(document.content.attachment)" :to-emit="true" :to-click-away="false" />
        </div>
      </div>

      <RButton :font-size="12" emit="click" class="robin-mt-8 robin-mb-11 robin-m-auto" v-show="nav == 'Media' && media.length > 7" @click="mediaStop = media.length - 1">See All Media</RButton>
      <RButton :font-size="12" emit="click" class="robin-mt-8 robin-mb-11 robin-m-auto" v-show="nav === 'Links' && links.length > 7" @click="linkStop = links.length - 1">See All Links</RButton>
      <RButton :font-size="12" emit="click" class="robin-mt-8 robin-mb-11 robin-m-auto" v-show="nav === 'Docs' && documents.length > 7" @click="documentStop = documents.length - 1">See All Docs</RButton>

      <RText :font-size="12" color="#15AE73" class="robin-mt-8 robin-mb-11 robin-m-auto" v-show="nav == 'Media' && media.length == 0">No Media</RText>
      <RText :font-size="12" color="#15AE73" class="robin-mt-8 robin-mb-11 robin-m-auto" v-show="nav === 'Links' && links.length == 0">No Links</RText>
      <RText :font-size="12" color="#15AE73" class="robin-mt-8 robin-mb-11 robin-m-auto" v-show="nav === 'Docs' && documents.length == 0">No Docs</RText>

      <div class="robin-group-container" v-show="currentConversation.is_group">
        <RButton color="#000" class="robin-add">
          <IconButton name="addParticipant" class="robin-mr-8" />
          Add Group Participant
        </RButton>

        <div class="robin-card-container">
          <div class="robin-card robin-flex robin-flex-align-center">
            <div class="robin-card-info robin-mr-12">
              <RAvatar />
            </div>

            <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1">
              <div class="robin-flex">
                <RText :font-size="14" :line-height="18">New Name</RText>
              </div>
              <div class="robin-ml-auto">
                <IconButton name="remove2" :to-emit="true" :to-click-away="false" />
              </div>
            </div>
          </div>
        </div>

        <div class="robin-see-all">
          <RButton :fontSize="14"> See All Participants </RButton>
        </div>
      </div>

      <div class="robin-actions robin-mt-14">
        <!-- <RButton color="#000" v-show="!currentConversation.is_group"> Share Contact </RButton> -->

        <!-- <RButton color="#000" v-show="currentConversation.is_group"> Mute Notifcation </RButton> -->

        <!-- <RButton color="#000"> Export Chat </RButton> -->

        <RButton color="#D53120" emit="click" @click="handleClearMessages()"> Clear Chat </RButton>

        <!-- <RButton color="#D53120" v-show="!currentConversation.is_group"> Block Contact </RButton> -->

        <RButton color="#D53120" v-show="currentConversation.is_group" emit="click" @click="handleLeaveGroup()"> Exit Group </RButton>

        <!-- <RButton color="#D53120"> Report {{ !currentConversation.is_group ? 'Contact' : 'Group' }} </RButton> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import moment from 'moment'
import VLazyImage from 'v-lazy-image/v2'
import Component from 'vue-class-component'
import RText from '@/components/ChatList/RText/RText.vue'
import RAvatar from '@/components/ChatList/RAvatar/RAvatar.vue'
import RGroupAvatar from '@/components/ChatList/RGroupAvatar/RGroupAvatar.vue'
import IconButton from '../../IconButton/IconButton.vue'
import RButton from '@/components/ChatList/RButton/RButton.vue'
import mime from 'mime'
import assets from '@/utils/assets.json'
import store from '../../../store/index'
import EventBus from '@/event-bus'

// eslint-disable-next-line
@Component<ViewMessageProfile>({
  name: 'ViewMessageProfile',
  components: {
    IconButton,
    RButton,
    RText,
    RAvatar,
    RGroupAvatar,
    VLazyImage
  },
  watch: {
    messages: {
      handler (val) {
        this.getAllMediaInConversation()
        this.getAllLinksInConversation()
        this.getAllDocumentsInConversation()
      }
    }
  }
})
export default class ViewMessageProfile extends Vue {
  screenWidth = 0 as number
  nav = 'Media'
  messages = [] as Array<any>
  media = [] as Array<any>
  links = [] as Array<any>
  documents = [] as Array<any>
  participants = [] as Array<any>
  mediaStop = 7
  linkStop = 7
  documentStop = 7

  imageRegex = /^image/ as any
  videoRegex = /^video/ as any
  documentRegex = /(xls|doc|ppt|txt|pdf|ppt|zip|html|avi|psd|svg|ai|gif|mp3|ai|mkv)$/
  emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  websiteRegex = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

  get currentConversation () {
    return store.state.currentConversation
  }

  get assets (): any {
    return assets
  }

  created () {
    this.handleConversationMessages()
  }

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
  }

  onResize () {
    this.screenWidth = window.innerWidth
  }

  getGroupParticipants () {
    const users = this.currentConversation.participants.map((user: any) => {
      return user.user_token
    })

    this.participants = this.$robin_users.filter((user: any) => {
      console.log(users.includes(user.userToken), user.userToken)
      return users.includes(user.userToken)
    })
  }

  formatRecentMessageTime (time: string): string {
    const datetime = moment(time)
    return datetime.calendar(null, {
      sameDay: 'hh:mm a',
      lastDay: '[Yesterday]',
      lastWeek: 'DD/MM/YYYY',
      sameElse: 'DD/MM/YYYY'
    })
  }

  openImagePreview (media: any): void {
    store.setState('imagePreviewOpen', true)
    store.setState('imagesToPreview', media)
  }

  getGroupCreator () {
    const groupchatCreator = this.currentConversation.participants.find((participant: { is_moderator: any }) => participant.is_moderator) as any
    if (groupchatCreator) {
      const user = this.$robin_users.find((user) => user.user_token === groupchatCreator.user_token)

      if (user && user.userToken !== this.$user_token) {
        return user.userName
      } else {
        return this.$senderName
      }
    }
  }

  handleConversationMessages () {
    EventBus.$on('messages.get', (messages: any) => {
      this.messages = [...messages]
      this.getGroupParticipants()
    })
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

  checkAttachmentType (attachmentUrl: String): string {
    const strArr = attachmentUrl.split('.')

    if (mime.getType(strArr[strArr.length - 1]) === 'application/msword') {
      return 'doc'
    }

    return `${mime.getType(strArr[strArr.length - 1])}`
  }

  getAllMediaInConversation () {
    const media = this.messages.filter((message: any) => {
      if (Array.isArray(message)) {
        return true
      }

      if (!Array.isArray(message) && message.content.is_attachment) {
        const isVideo = this.videoRegex.test(this.checkAttachmentType(message.content.attachment))
        const isImage = this.imageRegex.test(this.checkAttachmentType(message.content.attachment))

        if (isVideo || isImage) {
          return true
        }
      }

      return false
    })

    this.media = []

    media.forEach((message: any) => {
      if (Array.isArray(message)) {
        message.forEach((item) => {
          if (!item.is_deleted) {
            this.media.push(item)
          }
        })
      } else {
        this.media.push(message)
      }
    })
  }

  getAllLinksInConversation () {
    this.links = this.messages.filter((message: any) => {
      if (!Array.isArray(message) && !message.content.is_attachment) {
        if ((this.validateLinkInMessage(message).containsEmail && this.validateLinkInMessage(message).containsWebsite) || this.validateLinkInMessage(message).containsEmail || this.validateLinkInMessage(message).containsWebsite) {
          const isWebsite = this.websiteRegex.test(this.getTextsInMessage(message).texts[this.getTextsInMessage(message).length - 1])
          const isEmail = this.emailRegex.test(this.getTextsInMessage(message).texts[this.getTextsInMessage(message).length - 1])

          if (isWebsite || !isEmail) {
            return true
          }
        } else {
          return false
        }
      }

      return false
    })
  }

  getAllDocumentsInConversation () {
    this.documents = this.messages.filter((message: any) => {
      if (!Array.isArray(message) && message.content.is_attachment) {
        const isDocument = this.documentRegex.test(this.checkAttachmentType(message.content.attachment))

        if (isDocument) {
          return true
        }
      }

      return false
    })
  }

  validateLinkInMessage (message: any) {
    const texts = message.content.msg.split(' ')

    return {
      containsWebsite: texts.some((text: string) => this.websiteRegex.test(text)),
      containsEmail: texts.some((text: string) => this.emailRegex.test(text))
    }
  }

  getTextsInMessage (message: any) {
    return {
      texts: message.content.msg.split(' '),
      length: message.content.msg.split(' ').length
    }
  }

  handleClearMessages () {
    store.setState('clearMessages', true)
  }

  async handleLeaveGroup () {
    const res = await this.$robin.removeGroupParticipant(this.currentConversation._id, this.$user_token)

    if (res && !res.error) {
      this.$toast.open({
        message: 'You left group',
        type: 'success',
        position: 'bottom-left'
      })

      EventBus.$emit('left.group')
      EventBus.$emit('regular-conversation.delete', this.currentConversation)
      this.$emit('close')
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }
}
</script>

<style scoped>
.robin-modal-container {
  width: 385px;
  height: 100%;
  background-color: #fff;
  border: 1px solid #efefef;
  overflow-y: auto;
}

.robin-header {
  width: 100%;
  height: 79px;
  display: flex;
  align-items: center;
  padding: 0 clamp(2%, 4vw, 1.25rem);
  border-bottom: 1px solid #f5f7fc;
}

.robin-wrapper {
  display: flex;
  flex-direction: column;
}

.robin-wrapper .robin-flex {
  display: flex !important;
}

.robin-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 1.625rem clamp(3%, 5vw, 0.875rem) 1rem clamp(3%, 5vw, 1rem);
}

.robin-profile >>> h3,
.robin-profile >>> p {
  white-space: pre-wrap !important;
  text-align: center;
}

.robin-files {
  display: grid;
  grid-template-columns: repeat(2, 50%);
  gap: 0.5rem;
}

.robin-upload {
  border: 1px solid #ecebeb;
  border-radius: 12px;
  padding: 0.5rem;
  margin-bottom: 1.813rem;
}

.robin-upload .details {
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.1rem 0px;
  margin-left: 1.063rem;
}

.robin-media {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(72px, 72px));
  gap: 0.625rem 0.875rem;
}

.robin-media + .robin-button {
  text-align: center;
  letter-spacing: 0.02em;
  margin: 1.188rem auto 0px;
  display: block;
}

.robin-nav-container {
  display: flex;
  align-items: center;
  width: 90%;
  background-color: #efefef;
  border-radius: 8.91px;
  margin: 0 auto 0.438rem;
}

.robin-nav-container div {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  color: #8d9091;
  letter-spacing: -0.08px;
  font-size: 0.813rem;
  border-right: 1px solid rgba(84, 84, 88, 0.65);
}

.robin-nav-container div:last-child {
  border-right: none;
}

.robin-nav-container div:not(.active):hover {
  background: var(--primary-color);
  height: 28px;
  border: 0.5px solid rgba(0, 0, 0, 0.04);
  border-radius: 6.93px;
  color: #fff;
  cursor: pointer;
}

.robin-nav-container div.active {
  background: var(--primary-color);
  height: 28px;
  /* border: 0.5px solid rgba(0, 0, 0, 0.04); */
  border: none;
  border-radius: 6.93px;
  color: #fff;
}

.robin-actions {
  width: 100%;
}

.robin-actions >>> .robin-button {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #fbfbfb;
  padding-left: 1rem;
}

.robin-actions >>> .robin-button:not(:last-child) {
  border-bottom: 1px solid #f5f7fc;
}

.robin-group-container >>> .robin-add.robin-button {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #fbfbfb;
  padding-left: 1rem;
  width: 100%;
}

.robin-see-all {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fbfbfb;
}

.robin-card-container {
  width: 100%;
  max-height: 500px;
  overflow-y: auto;
}

.robin-card-container .robin-card {
  box-shadow: 0px 1px 0px 2.5px rgba(69, 104, 209, 0.05);
  padding: 0.875rem 1rem 1rem;
  transition: all 0.15s;
  background-color: #fff;
}

.robin-card-container .robin-card:not(:first-child) {
  margin: 0.25rem 0;
}

.robin-media-grids {
  width: 90%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 80px));
  gap: 0.5rem;
}

.robin-media-grid img {
  width: 100%;
  object-fit: cover;
  height: 63px;
  cursor: pointer;
}

.robin-media-grid video {
  width: 100%;
  height: 63px;
}

.robin-link-container {
  width: 90%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.robin-link-preview {
  padding: 0.5rem;
  color: #4568d1;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.robin-link-preview i {
  color: #4b545a;
}

.robin-link-preview div {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
}

.robin-document-grids {
  width: 90%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(173px, 200px));
  gap: 0.5rem;
}

.robin-uploaded-documents {
  display: flex;
  align-items: center;
  background-color: #F5F7FC;
  border: 1px solid #ecebeb;
  border-radius: 4px;
  padding: 0.5rem 0.938rem 0.5rem 0.5rem;
}

.robin-uploaded-documents .detail {
  margin-right: 2.2rem;
}

.robin-uploaded-documents svg {
  margin-right: 0.5rem;
}

@media (min-width: 768px) {
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-track {
    /* border: 1px solid #00000017; */
    border-radius: 24px;
  }

  ::-webkit-scrollbar-thumb {
    width: 2px;
    background-color: #d6d6d6;
    border-radius: 24px;
    -webkit-border-radius: 24px;
    -moz-border-radius: 24px;
    -ms-border-radius: 24px;
    -o-border-radius: 24px;
  }
}

@media (max-width: 768px) {
  .robin-header {
    padding-top: 1.6rem;
    padding-bottom: 1.6rem;
  }
}

@media (max-width: 1200px) {
  .robin-modal-container {
    width: 100%;
  }
}
</style>
