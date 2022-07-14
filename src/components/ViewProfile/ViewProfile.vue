<template>
  <div class="robin-modal-container robin-flex robin-flex-column robin-slideInRight" ref="popup-body">
    <header class="robin-header">
      <IconButton name="remove" @close="closeModal()" emit="close" :to-emit="true" :to-click-away="false" />
      <Content font-weight="400" :font-size="16" class="robin-ml-12">{{ !currentConversation.is_group ? 'Chat' : 'Group' }} Info</Content>
    </header>

    <div class="robin-wrapper robin-fadeIn" v-if="!isProfileLoading">
      <div class="robin-profile">
        <Avatar :robin-users="$robin_users" v-if="!currentConversation.is_group" :sender-token="currentConversation.sender_token === $user_token ? currentConversation.receiver_token : currentConversation.sender_token" class="robin-mb-8" />
        <GroupAvatar v-else class="robin-mb-8" :img-url="currentConversation.group_icon" />

        <Content fontWeight="500" as="h3" class="robin-mb-8">{{ !currentConversation.is_group ? currentConversation.sender_token != $user_token ? currentConversation.sender_name : currentConversation.receiver_name : currentConversation.name }}</Content>

        <Content color="#51545C" :fontSize="12" :text-align="'center'" as="p" class="robin-mb-8" v-show="currentConversation.is_group">{{ groupParticipants.length > 1 ? `${groupParticipants.length} Members` : `${groupParticipants.length} Member` }}</Content>

        <Content color="#51545C" :fontSize="12" :text-align="'center'" as="p" class="robin-flex" v-if="currentConversation.is_group"
          >Created at {{ formatRecentMessageTime(currentConversation.created_at) }}, By <Content :fontSize="12">{{ currentConversation.moderator.meta_data.display_name }}</Content></Content
        >
      </div>

      <div class="robin-nav-container">
        <div :class="{ active: nav == 'Media' }" @click="nav = 'Media'" data-testid="media-nav-button">Media</div>

        <div :class="{ active: nav == 'Links' }" @click="nav = 'Links'" data-testid="link-nav-button">Links</div>

        <div :class="{ active: nav == 'Docs' }" @click="nav = 'Docs'" data-testid="doc-nav-button">Docs</div>
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

      <div v-show="nav === 'Docs'" class="robin-document-grids">
        <div class="robin-uploaded-documents" v-for="(document, documentIndex) in documents" :key="documentIndex">
          <img v-if="assets[getFileDetails(document.content.attachment).extension]" :src="assets[getFileDetails(document.content.attachment).extension]" alt="document" />

          <img v-else :src="assets['default']" />

          <div class="detail robin-flex robin-h-100 robin-flex-align-center">
            <Content as="span" :fontSize="14"> {{ getFileDetails(document.content.attachment).name && getFileDetails(document.content.attachment).name.length > 9 ? getFileDetails(document.content.attachment).name.substring(0, 9) + '...' + '.' + getFileDetails(document.content.attachment).extension : getFileDetails(document.content.attachment).name + '.' + getFileDetails(document.content.attachment).extension }} </Content>
          </div>

          <IconButton name="download" class="robin-ml-auto" color="#15AE73" @clicked="downloadFile(document.content.attachment)" :to-emit="true" :to-click-away="false" />
        </div>
      </div>

      <Button :font-size="12" emit="click" class="robin-mt-8 robin-mb-11 robin-ml-auto robin-mr-auto" v-show="nav == 'Media' && media.length > 6 && mediaStop != media.length - 1" @click="mediaStop = media.length - 1">See All Media</Button>
      <Button :font-size="12" emit="click" class="robin-mt-8 robin-mb-11 robin-ml-auto robin-mr-auto" v-show="nav === 'Links' && links.length > 6 && linkStop != links.length - 1" @click="linkStop = links.length - 1">See All Links</Button>
      <Button :font-size="12" emit="click" class="robin-mt-8 robin-mb-11 robin-ml-auto robin-mr-auto" v-show="nav === 'Docs' && documents.length > 6 && documentStop != documents.length - 1" @click="documentStop = documents.length - 1">See All Docs</Button>

      <Content :font-size="12" color="#15AE73" class="robin-mt-8 robin-mb-11 robin-ml-auto robin-mr-auto" v-show="nav == 'Media' && media.length == 0">No Media</Content>
      <Content :font-size="12" color="#15AE73" class="robin-mt-8 robin-mb-11 robin-ml-auto robin-mr-auto" v-show="nav === 'Links' && links.length == 0">No Links</Content>
      <Content :font-size="12" color="#15AE73" class="robin-mt-8 robin-mb-11 robin-ml-auto robin-mr-auto" v-show="nav === 'Docs' && documents.length == 0">No Docs</Content>

      <div class="robin-wrapper robin-mb-12">
        <Button color="#51545C" class="robin-tab" :emit="'clicked'" @clicked="showEncriptionDetails()">
          <SvgIcon name="encryption" class="robin-mr-8" />
          Encryption Details
        </Button>
      </div>

      <div class="robin-group-container" v-show="currentConversation.is_group">
        <Button color="#000" class="robin-tab" :emit="'clicked'" @clicked="addGroupParticipant()">
          <SvgIcon name="addParticipant" class="robin-mr-8" />
          Add Group Participant
        </Button>

        <div class="robin-card-container" v-if="!isSignedInUserModerator">
          <div class="robin-card robin-flex robin-flex-align-center" v-for="(participant, participantIndex) in groupParticipants.slice(0, participantsToShow)" :key="participantIndex">
            <div class="robin-card-info robin-mr-12">
              <Avatar :robin-users="$robin_users" :sender-token="participant.user_token" />
            </div>

            <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1">
              <div class="robin-flex">
                <Content :font-size="14" :line-height="18">{{ participant.user_token === $user_token ? 'You' : participant.meta_data.display_name }}</Content>
              </div>

              <div v-show="participant.is_moderator" class="robin-moderator-text">Moderator</div>
            </div>
          </div>
        </div>

        <div class="robin-card-container" v-else>
          <div class="robin-card robin-flex robin-flex-align-center" v-for="(participant, participantIndex) in groupParticipants.slice(0, participantsToShow)" :key="participantIndex" @click.self="openGroupPrompt(participant.user_token, participant.is_moderator)" :class="{ 'robin-clickable': currentConversation.is_group && participant.user_token !== $user_token }">
            <div class="robin-card-info robin-mr-12" @click="openGroupPrompt(participant.user_token, participant.is_moderator)">
              <Avatar :robin-users="$robin_users" :sender-token=" participant.user_token == $user_token ? '' : participant.user_token" />
            </div>

            <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1" @click.self="openGroupPrompt(participant.user_token, participant.is_moderator)">
              <div class="robin-flex" @click="openGroupPrompt(participant.user_token, participant.is_moderator)">
                <Content :font-size="14" :line-height="18">{{ participant.user_token === $user_token ? 'You' : participant.meta_data.display_name }}</Content>
              </div>

              <div class="robin-ml-auto" v-show="!participant.is_moderator" @click="handleRemoveParticipant(participant.user_token)">
                <IconButton name="remove2" :to-emit="false" :to-click-away="false" />
              </div>

              <div v-show="participant.is_moderator" class="robin-moderator-text">Moderator</div>
            </div>
          </div>
        </div>

        <div class="robin-see-all" @click="participantsToShow = groupParticipants.length - 1" v-show="participantsToShow !== groupParticipants.length - 1 && groupParticipants.length > 4">
          <Button :fontSize="14"> See All Participants </Button>
        </div>
      </div>

      <div class="robin-actions robin-mt-14">
        <!-- <Button color="#000" v-show="!currentConversation.is_group"> Share Contact </Button> -->

        <!-- <Button color="#000" v-show="currentConversation.is_group"> Mute Notifcation </Button> -->

        <!-- <Button color="#000"> Export Chat </Button> -->

        <Button color="#D53120" emit="click" @click="handleClearMessages()" v-if="isDeleteMessagesEnabled"> Clear Chat </Button>

        <!-- <Button color="#D53120" v-show="!currentConversation.is_group"> Block Contact </Button> -->

        <Button color="#D53120" v-show="currentConversation.is_group" emit="click" @click="handleLeaveGroup()"> Exit Group </Button>

        <!-- <Button color="#D53120"> Report {{ !currentConversation.is_group ? 'Contact' : 'Group' }} </Button> -->
      </div>
    </div>

    <div class="robin-wrapper" v-else>
      <div class="robin-spinner"></div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import moment from 'moment'
import VLazyImage from 'v-lazy-image/v2'
import Component from 'vue-class-component'
import Content from '@/components/Content/Content.vue'
import Avatar from '@/components/Avatar/Avatar.vue'
import GroupAvatar from '@/components/GroupAvatar/GroupAvatar.vue'
import IconButton from '@/components/IconButton/IconButton.vue'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import Button from '@/components/Button/Button.vue'
import mime from 'mime'
import assets from '@/utils/assets.json'
import store from '@/store/index'
import EventBus from '@/event-bus'

// eslint-disable-next-line
@Component<ViewProfile>({
  name: 'ViewProfile',
  components: {
    IconButton,
    SvgIcon,
    Button,
    Content,
    Avatar,
    GroupAvatar,
    VLazyImage
  },
  watch: {
    // messages () {
    //   this.getAllMediaInConversation()
    //   this.getAllLinksInConversation()
    //   this.getAllDocumentsInConversation()
    // },
    profileOpen () {
      this.getProfile()
    }
  }
})
export default class ViewProfile extends Vue {
  nav = 'Media'
  isProfileLoading = false
  messages = [] as Array<any>
  media = [] as Array<any>
  links = [] as Array<any>
  documents = [] as Array<any>
  participantsToShow = 4
  mediaStop = 6
  linkStop = 6
  documentStop = 6

  imageRegex = /^image/ as any
  videoRegex = /^video/ as any
  documentRegex = /(xls|doc|ppt|txt|pdf|csv|ppt|zip|html|avi|psd|svg|ai|gif|ai|mkv)$/
  emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  websiteRegex = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

  get currentConversation () {
    return store.state.currentConversation
  }

  get groupParticipants () {
    if (Object.keys(this.currentConversation).length > 0 && this.currentConversation.is_group) {
      return this.currentConversation.participants
    }

    return []
  }

  get isSignedInUserModerator () {
    if (Object.keys(this.currentConversation).length > 0 && this.currentConversation.is_group) {
      return this.currentConversation.participants.some((user: any) => user.user_token === this.$user_token && user.is_moderator)
    }

    return false
  }

  get assets (): any {
    return assets
  }

  get profileOpen () {
    return store.state.profileOpen
  }

  get isDeleteMessagesEnabled () {
    return store.state.deleteMessagesEnabled
  }

  created () {
    this.handleConversationMessages()
    this.handleRemoveGroupParticipant()
    this.handleAssignedGroupModerator()
    this.onAddGroupParticipants()
  }

  closeModal () {
    this.participantsToShow = 4
    this.mediaStop = 6
    this.linkStop = 6
    this.documentStop = 6
    this.$emit('close')
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
    this.closePrompt()
  }

  async getProfile () {
    this.isProfileLoading = true

    const res = await this.$robin.getConversationDetails(this.currentConversation._id, this.$user_token)

    console.log('dsd')

    if (res && !res.error) {
      this.isProfileLoading = false
      this.media = res.data.photos ? [...res.data.photos] : []
      this.links = res.data.links ? [...res.data.links] : []
      this.documents = res.data.documents ? [...res.data.documents.filter((doc: any) => this.documentRegex.test(this.checkAttachmentType(doc.content.attachment)))] : []
    }
  }

  handleConversationMessages () {
    EventBus.$on('messages.get', (messages: any) => {
      this.messages = [...messages]
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
    store.setState('exitGroup', true)
  }

  async handleRemoveParticipant (userToken: string) {
    store.setState('participantToken', userToken)
    store.setState('removeParticipant', true)
  }

  getUser (userToken: string) {
    const index = this.$robin_users.findIndex((user: any) => user.userToken === userToken)
    return this.$robin_users[index]
  }

  handleRemoveGroupParticipant () {
    EventBus.$on('remove.group.participant', (value: any) => {
      if (value.participant.user_token !== this.$user_token) {
        const index = this.currentConversation.participants.findIndex((participant: any) => participant.user_token === value.participant.user_token)

        if (index > -1) {
          this.currentConversation.participants.splice(index, 1)

          this.closePrompt()

          this.participantsToShow = 4
        }
      }
    })
  }

  handleAssignedGroupModerator () {
    EventBus.$on('participant.assigned.moderator', (conversation: any) => {
      store.setState('currentConversation', conversation)
      this.$forceUpdate()
    })
  }

  addGroupParticipant () {
    EventBus.$emit('show.new.group')
    EventBus.$emit('edit.participants.group', {
      conversation_id: this.currentConversation._id
    })
  }

  onAddGroupParticipants () {
    EventBus.$on('update.group.conversation', (conversation: any) => {
      store.setState('currentConversation', conversation)
    })
  }

  openGroupPrompt (token: string, isModerator: boolean) {
    if (this.currentConversation.is_group && token !== this.$user_token) {
      store.setState('groupPromptOpen', true)
      store.setState('currentParticipantToken', token)
      store.setState('isParticipantModerator', isModerator)
    }
  }

  showEncriptionDetails () {
    store.setState('encryptionDetailsOpen', true)
    this.closePrompt()
  }

  closePrompt () {
    store.setState('selectMessagesOpen', false)
    store.setState('clearMessages', false)
    store.setState('exitGroup', false)
    store.setState('removeParticipant', false)
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
  position: relative;
  z-index: -1;
}

.robin-header {
  width: 100%;
  min-height: 79px;
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

.robin-tab.robin-button {
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
  margin: 0 auto 0.75rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 0.5rem;
}

.robin-media-grid img {
  width: 100%;
  aspect-ratio: 1 / 1.25;
  object-fit: cover;
  cursor: pointer;
}

.robin-media-grid video {
  width: 100%;
  height: 63px;
}

.robin-link-container {
  width: 90%;
  margin: 0 auto 0.75rem;
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
  min-width: 86px;
  max-width: 86px;
}

.robin-document-grids {
  width: 90%;
  margin: 0 auto 0.75rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.5rem;
}

.robin-uploaded-documents {
  display: flex;
  align-items: center;
  background-color: #f5f7fc;
  border: 1px solid #ecebeb;
  border-radius: 4px;
  padding: 0.5rem 0.938rem 0.5rem 0.5rem;
}

.robin-uploaded-documents .detail {
  margin-right: 2.2rem;
}

/* .robin-uploaded-documents svg {
  margin-left: 0.5rem;
} */

.robin-moderator-text {
  background-color: #eeeeee;
  padding: 0.2rem 0.2rem;
  margin-left: auto;
  font-size: 0.625rem;
}

.robin-spinner {
  margin: 1rem auto 0;
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
