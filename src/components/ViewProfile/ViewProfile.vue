<template>
  <div class="robin-view-profile robin-flex robin-flex-column robin-slideInRight" ref="popup-body">
    <header class="robin-header">
      <icon-button
        name="remove"
        @close="closeModal()"
        emit="close"
        :to-emit="true"
        :to-click-away="false"
      />
      <message-content font-weight="400" :font-size="16" class="robin-ml-12"
        >{{ !currentConversation.is_group ? 'Chat' : 'Group' }} Info</message-content
      >
    </header>

    <div class="robin-wrapper robin-fadeIn" v-if="!isProfileLoading">
      <div class="robin-profile">
        <avatar
          :img-url="getProfileImage(currentConversation) || currentConversation.display_photo"
          v-if="!currentConversation.is_group"
          :sender-token="
            currentConversation.sender_token === $user_token
              ? currentConversation.receiver_token
              : currentConversation.sender_token
          "
          class="robin-mb-8"
        />
        <group-avatar v-else class="robin-mb-8" :img-url="currentConversation.group_icon" />

        <message-content fontWeight="500" as="h3" class="robin-mb-8">{{
          !currentConversation.is_group
            ? currentConversation.sender_token != $user_token
              ? currentConversation.sender_name
              : currentConversation.receiver_name
            : currentConversation.name
        }}</message-content>

        <message-content
          color="#51545C"
          :fontSize="12"
          :text-align="'center'"
          as="p"
          class="robin-mb-8"
          v-show="currentConversation.is_group"
          >{{
            groupParticipants.length > 1
              ? `${groupParticipants.length} Members`
              : `${groupParticipants.length} Member`
          }}</message-content
        >

        <message-content
          color="#51545C"
          :fontSize="12"
          :text-align="'center'"
          as="p"
          class="robin-flex"
          v-if="currentConversation.is_group"
          >Created at {{ getRecentMessageTime(currentConversation.created_at) }}, By
          <message-content :fontSize="12">{{
            currentConversation.moderator.meta_data.display_name
          }}</message-content></message-content
        >
      </div>

      <div class="robin-nav-container">
        <div
          :class="{ active: nav == 'Media' }"
          @click="nav = 'Media'"
          data-testid="media-nav-button"
        >
          Media
        </div>

        <div
          :class="{ active: nav == 'Links' }"
          @click="nav = 'Links'"
          data-testid="link-nav-button"
        >
          Links
        </div>

        <div :class="{ active: nav == 'Docs' }" @click="nav = 'Docs'" data-testid="doc-nav-button">
          Docs
        </div>
      </div>

      <!-- Media -->
      <div v-if="nav === 'Media'" class="robin-media-grids">
        <virtual-scroller
          :items="media.slice(0, linkStop)"
          :item-count="media.slice(0, linkStop).length"
          :max-content="true"
          :child-height="mediaChildHeight"
          v-slot="slotProps"
        >
          <div class="robin-media-grid" :key="slotProps.index">
            <img
              v-if="imageRegex.test(checkAttachmentType(slotProps.item.content.attachment))"
              :data-src="slotProps.item.content.attachment"
              class="robin-uploaded-image lazyload blur-up"
              @click="openImagePreview([slotProps.item])"
              alt="uploaded-image"
            />

            <video
              v-if="videoRegex.test(checkAttachmentType(slotProps.item.content.attachment))"
              controls
            >
              <source :src="slotProps.item.content.attachment" />
              Your browser does not support the video tag.
            </video>
          </div>
        </virtual-scroller>
      </div>

      <!-- Links -->
      <div v-show="nav === 'Links'" class="robin-link-container">
        <virtual-scroller
          :items="links.slice(0, linkStop)"
          :item-count="links.slice(0, linkStop).length"
          :child-height="linkChildHeight"
          v-slot="slotProps"
        >
          <a
            class="robin-link-preview"
            :key="slotProps.index"
            :href="
              getTextsInMessage(slotProps.item).texts[
                getTextsInMessage(slotProps.item).length - 1
              ].includes('http') ||
              getTextsInMessage(slotProps.item).texts[
                getTextsInMessage(slotProps.item).length - 1
              ].includes('https')
                ? getTextsInMessage(slotProps.item).texts[
                    getTextsInMessage(slotProps.item).length - 1
                  ]
                : `https://${
                    getTextsInMessage(slotProps.item).texts[
                      getTextsInMessage(slotProps.item).length - 1
                    ]
                  }`
            "
          >
            <div>
              <i class="robin-material-icon"> link </i>
            </div>
            {{
              getTextsInMessage(slotProps.item).texts[
                getTextsInMessage(slotProps.item).length - 1
              ].includes('http') ||
              getTextsInMessage(slotProps.item).texts[
                getTextsInMessage(slotProps.item).length - 1
              ].includes('https')
                ? getTextsInMessage(slotProps.item).texts[
                    getTextsInMessage(slotProps.item).length - 1
                  ]
                : `https://${
                    getTextsInMessage(slotProps.item).texts[
                      getTextsInMessage(slotProps.item).length - 1
                    ]
                  }`
            }}
          </a>
        </virtual-scroller>
      </div>

      <!-- Documents -->

      <div v-show="nav === 'Docs'" class="robin-document-grids">
        <virtual-scroller
          :items="documents"
          :item-count="documents.length"
          :max-content="true"
          :child-height="documentChildHeight"
          v-slot="slotProps"
        >
          <div class="robin-uploaded-documents" :key="slotProps.index">
            <img
              v-if="assets[getFileDetails(slotProps.item.content.attachment).extension]"
              :data-src="assets[getFileDetails(slotProps.item.content.attachment).extension]"
              class="lazyload blur-up"
              alt="document"
            />

            <img v-else :data-src="assets['default']" class="lazyload blur-up" alt="document" />

            <div class="detail robin-flex robin-h-100 robin-flex-align-center">
              <message-content as="span" :fontSize="14">
                {{
                  getFileDetails(slotProps.item.content.attachment).name &&
                  getFileDetails(slotProps.item.content.attachment).name.length > 9
                    ? getFileDetails(slotProps.item.content.attachment).name.substring(0, 9) +
                      '...' +
                      '.' +
                      getFileDetails(slotProps.item.content.attachment).extension
                    : getFileDetails(slotProps.item.content.attachment).name +
                      '.' +
                      getFileDetails(slotProps.item.content.attachment).extension
                }}
              </message-content>
            </div>

            <icon-button
              name="download"
              class="robin-ml-auto"
              color="#15AE73"
              @clicked="downloadFile(slotProps.item.content.attachment)"
              :to-emit="true"
              :to-click-away="false"
            />
          </div>
        </virtual-scroller>
      </div>

      <custom-button
        :font-size="12"
        emit="click"
        class="robin-mt-8 robin-mb-11 robin-ml-auto robin-mr-auto"
        v-show="nav == 'Media' && media.length > 6 && mediaStop != media.length - 1"
        @click="mediaStop = media.length - 1"
        >See All Media</custom-button
      >
      <custom-button
        :font-size="12"
        emit="click"
        class="robin-mt-8 robin-mb-11 robin-ml-auto robin-mr-auto"
        v-show="nav === 'Links' && links.length > 6 && linkStop != links.length - 1"
        @click="linkStop = links.length - 1"
        >See All Links</custom-button
      >
      <custom-button
        :font-size="12"
        emit="click"
        class="robin-mt-8 robin-mb-11 robin-ml-auto robin-mr-auto"
        v-show="nav === 'Docs' && documents.length > 6 && documentStop != documents.length - 1"
        @click="documentStop = documents.length - 1"
        >See All Docs</custom-button
      >

      <message-content
        :font-size="12"
        color="#15AE73"
        class="robin-mt-8 robin-mb-11 robin-ml-auto robin-mr-auto"
        v-show="nav == 'Media' && media.length == 0"
        >No Media</message-content
      >
      <message-content
        :font-size="12"
        color="#15AE73"
        class="robin-mt-8 robin-mb-11 robin-ml-auto robin-mr-auto"
        v-show="nav === 'Links' && links.length == 0"
        >No Links</message-content
      >
      <message-content
        :font-size="12"
        color="#15AE73"
        class="robin-mt-8 robin-mb-11 robin-ml-auto robin-mr-auto"
        v-show="nav === 'Docs' && documents.length == 0"
        >No Docs</message-content
      >

      <div class="robin-wrapper robin-mb-12">
        <custom-button
          :color="currentTheme === 'light' ? '#51545C' : '#B6B6B6'"
          class="robin-tab"
          :emit="'clicked'"
          @clicked="showEncriptionDetails()"
        >
          <SvgIcon name="encryption" class="robin-mr-8" />
          Encryption Details
        </custom-button>
      </div>

      <div class="robin-group-container" v-show="currentConversation.is_group">
        <custom-button
          class="robin-tab"
          :color="currentTheme === 'light' ? '#15AE73' : '#F9F9F9'"
          :emit="'clicked'"
          @clicked="addGroupParticipant()"
        >
          <svg-icon name="addParticipant" class="robin-mr-8" />
          Add Group Participant
        </custom-button>

        <div class="robin-card-container" v-if="!isSignedInUserModerator">
          <virtual-scroller
            :items="groupParticipants.slice(0, participantsToShow)"
            :item-count="groupParticipants.slice(0, participantsToShow).length"
            :max-content="true"
            :child-height="participantChildHeight"
            v-slot="slotProps"
          >
            <view-profile-card :key="slotProps.index" :item="slotProps.item" :type="1" />
          </virtual-scroller>
        </div>

        <div class="robin-card-container" v-else>
          <virtual-scroller
            :items="groupParticipants.slice(0, participantsToShow)"
            :item-count="groupParticipants.slice(0, participantsToShow).length"
            :max-content="true"
            :child-height="participantChildHeight"
            v-slot="slotProps"
          >
            <view-profile-card
              :key="slotProps.index"
              :item="slotProps.item"
              :type="2"
              @remove-participant="handleRemoveParticipant(slotProps.item.user_token)"
              @open-group-prompt="
                openGroupPrompt(slotProps.item.user_token, slotProps.item.is_moderator)
              "
            />
          </virtual-scroller>
        </div>

        <div
          class="robin-see-all"
          @click="participantsToShow = groupParticipants.length - 1"
          v-show="
            participantsToShow !== groupParticipants.length - 1 && groupParticipants.length > 4
          "
        >
          <custom-button :fontSize="14"> See All Participants </custom-button>
        </div>
      </div>

      <div class="robin-actions robin-mt-14">
        <!-- <Button color="#000" v-show="!currentConversation.is_group"> Share Contact </Button> -->

        <!-- <Button color="#000" v-show="currentConversation.is_group"> Mute Notifcation </Button> -->

        <!-- <Button color="#000"> Export Chat </Button> -->

        <custom-button
          color="#D53120"
          emit="click"
          @click="handleClearMessages()"
          v-if="isDeleteMessagesEnabled"
        >
          Clear Chat
        </custom-button>

        <!-- <Button color="#D53120" v-show="!currentConversation.is_group"> Block Contact </Button> -->

        <custom-button
          color="#D53120"
          v-show="currentConversation.is_group"
          emit="click"
          @click="handleLeaveGroup()"
        >
          Exit Group
        </custom-button>

        <!-- <Button color="#D53120"> Report {{ !currentConversation.is_group ? 'Contact' : 'Group' }} </Button> -->
      </div>
    </div>

    <div class="robin-wrapper" v-else>
      <div class="robin-spinner"></div>
    </div>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import Content from '../Content/Content.vue'
import Avatar from '../Avatar/Avatar.vue'
import GroupAvatar from '../GroupAvatar/GroupAvatar.vue'
import IconButton from '../IconButton/IconButton.vue'
import SvgIcon from '../SvgIcon/SvgIcon.vue'
import Button from '../Button/Button.vue'
import ViewProfileCard from '../ViewProfileCard/ViewProfileCard.vue'
import VirtualScroller from '../VirtualScroller/VirtualScroller.vue'
import mime from 'mime'
import assets from '@/utils/assets.json'
import { DocumentRegex, EmailRegex, VideoRegex, ImageRegex, WebsiteRegex } from '@/utils/constants'
import store from '@/store/index'
import EventBus from '@/event-bus'
import ConversationMixin from '@/mixins/conversation-mixins'

// eslint-disable-next-line
@Component<ViewProfile>({
  name: 'ViewProfile',
  components: {
    IconButton,
    SvgIcon,
    'custom-button': Button,
    'message-content': Content,
    Avatar,
    GroupAvatar,
    ViewProfileCard,
    VirtualScroller
  },
  watch: {
    profileOpen () {
      this.getProfile()
    },
    groupParticipants () {
      const participantChildHeight = [] as Array<number>
      this.groupParticipants.forEach(() => {
        participantChildHeight.push(40)
      })

      this.participantChildHeight = [...participantChildHeight]
    }
  }
})
export default class ViewProfile extends mixins(ConversationMixin) {
  nav = 'Media'
  isProfileLoading = false
  messages = [] as Array<ObjectType>
  media = [] as Array<ObjectType>
  links = [] as Array<ObjectType>
  documents = [] as Array<ObjectType>
  mediaChildHeight = [] as Array<number>
  linkChildHeight = [] as Array<number>
  documentChildHeight = [] as Array<number>
  participantChildHeight = [] as Array<number>
  participantsToShow = 4
  mediaStop = 6
  linkStop = 6
  documentStop = 6

  imageRegex = ImageRegex
  videoRegex = VideoRegex
  documentRegex = DocumentRegex
  emailRegex = EmailRegex
  websiteRegex = WebsiteRegex

  get groupParticipants () {
    if (Object.keys(this.currentConversation).length > 0 && this.currentConversation.is_group) {
      return this.currentConversation.participants
    }

    return []
  }

  get isSignedInUserModerator () {
    if (Object.keys(this.currentConversation).length > 0 && this.currentConversation.is_group) {
      return this.currentConversation.participants.some(
        (user: any) => user.user_token === this.$user_token && user.is_moderator
      )
    }

    return false
  }

  get assets (): any {
    return assets
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

  openImagePreview (media: any): void {
    store.setState('imagePreviewOpen', true)
    store.setState('imagesToPreview', media)
    this.closePrompt()
  }

  async getProfile () {
    this.isProfileLoading = true

    const res = await this.$robin.getConversationDetails(
      this.currentConversation._id,
      this.$user_token
    )

    if (res && !res.error) {
      this.isProfileLoading = false
      this.media = res.data.photos ? [...res.data.photos] : []
      this.links = res.data.links ? [...res.data.links] : []
      this.documents = res.data.documents
        ? [
            ...res.data.documents.filter((doc: any) =>
              this.documentRegex.test(this.checkAttachmentType(doc.content.attachment))
            )
          ]
        : []

      const mediaChildHeight = [] as Array<number>
      const linkChildHeight = [] as Array<number>
      const documentChildHeight = [] as Array<number>

      this.media.forEach(() => {
        if (this.media.length < 2) mediaChildHeight.push(50)
        else mediaChildHeight.push(40)
      })

      this.links.forEach(() => {
        linkChildHeight.push(40)
      })

      this.documents.forEach(() => {
        documentChildHeight.push(40)
      })

      this.mediaChildHeight = [...mediaChildHeight]
      this.linkChildHeight = [...linkChildHeight]
      this.documentChildHeight = [...documentChildHeight]
    }
  }

  getProfileImage (conversation: any) {
    const index = this.$robin_users.findIndex(
      (user: any) => user.userToken === conversation.sender_token
    )

    return this.$robin_users[index] ? this.$robin_users[index].profileImage : null
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

  checkAttachmentType (attachmentUrl: string): string {
    const strArr = attachmentUrl.split('.')

    if (mime.getType(strArr[strArr.length - 1]) === 'application/msword') {
      return 'doc'
    }

    return `${mime.getType(strArr[strArr.length - 1])}`
  }

  validateLinkInMessage (message: ObjectType) {
    const texts = message.content.msg.split(' ')

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

  getTextsInMessage (message: ObjectType) {
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
        const index = this.currentConversation.participants.findIndex(
          (participant: any) => participant.user_token === value.participant.user_token
        )

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
