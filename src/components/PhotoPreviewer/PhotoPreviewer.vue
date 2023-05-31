<template>
  <div class="robin-image-previewer robin-squeezeOut" ref="popup-body">
    <header class="robin-head">
      <div class="robin-card-container robin-flex robin-flex-align-center">
        <div class="robin-wrapper robin-mr-27" @click="closeImagePreview()">
          <icon-button name="remove" :to-emit="false" :to-click-away="false" />
        </div>

        <div class="robin-card-info robin-mr-16">
          <group-avatar v-if="conversation.is_group" :img-url="conversation.group_icon" />
          <avatar
            :img-url="getProfileImage(conversation) || conversation.display_photo"
            :sender-token="
              conversation.sender_token === $user_token
                ? conversation.receiver_token
                : conversation.sender_token
            "
            v-else
          />
        </div>

        <div
          class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-flex-1"
        >
          <div class="robin-mt-6">
            <message-content
              font-weight="normal"
              :font-size="16"
              :line-height="20"
              v-if="!conversation.is_group"
            >
              {{
                conversation.sender_token != $user_token
                  ? conversation.sender_name
                  : conversation.receiver_name
              }}
            </message-content>

            <message-content font-weight="normal" :font-size="16" :line-height="20" v-else>
              {{ conversation.name }}
            </message-content>
          </div>
        </div>
      </div>

      <div
        class="robin-options robin-ml-auto"
        @click="handleOpenPopUp()"
        data-testid="options"
        v-if="
          isReplyMessagesEnabled ||
          isDeleteMessagesEnabled ||
          isForwardMessagesEnabled ||
          (isReplyMessagesEnabled && isDeleteMessagesEnabled && isForwardMessagesEnabled)
        "
      >
        <icon-button
          name="openModalDot"
          @clickoutside="handleClosePopUp()"
          :to-emit="false"
          :to-click-away="true"
        />

        <div class="robin-popup-container" v-show="popUpState.opened">
          <photo-preview-pop-up
            ref="popup-1"
            @delete="deleteImage()"
            @download="downloadImage()"
            @forward="openForwardMessage()"
            @reply="replyImageMessage()"
            data-testid="message-preview-popover"
          />
        </div>
      </div>
    </header>

    <div class="robin-body">
      <div
        class="robin-wrapper robin-w-100 robin-h-100 robin-flex robin-flex-column robin-flex-align-center robin-flex-space-between"
      >
        <div class="robin-image-preview" v-viewer="vOptions">
          <img :src="imagePreview" alt="uploaded image" />
        </div>

        <div
          class="robin-image-row robin-overflow-x-auto robin-flex robin-flex-align-center robin-mt-16"
        >
          <img
            v-for="(image, index) in images"
            :key="index"
            :data-src="
              typeof image.content.attachment !== 'string'
                ? convertArrayBufferToFile(image.content.attachment, image)
                : image.content.attachment
            "
            @click="onSelectChange(index)"
            class="robin-uploaded-image lazyload blur-up"
            :class="[
              index === imageSelected && images.length > 1 ? 'selected' : '',
              images.length === 1 && 'not-selected'
            ]"
            alt="uploaded-image"
          />
        </div>
      </div>
    </div>
    <forward-message
      v-if="forwardMessage"
      @closemodal="onCloseForwardMessagePopup()"
      :selected-messages="selectedMessages"
    />
  </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import EventBus from '@/event-bus'
import store from '@/store/index'
import mime from 'mime'
import { directive as viewer } from 'v-viewer'
import { arrayBufferToBlob, createUUID } from '@/utils/helpers'
import IconButton from '@/components/IconButton/IconButton.vue'
import GroupAvatar from '@/components/GroupAvatar/GroupAvatar.vue'
import Avatar from '@/components/Avatar/Avatar.vue'
import Content from '@/components/Content/Content.vue'
import PhotoPreviewPopUp from '../PhotoPreviewPopUp/PhotoPreviewPopUp.vue'
import ForwardMessage from '../ForwardMessage/ForwardMessage.vue'
import ConversationMixin from '@/mixins/conversation-mixins'

interface PopUpState {
  opened: boolean;
}

const ComponentProps = mixins(ConversationMixin).extend({
  props: {
    conversation: {
      type: Object,
      default: () => ({})
    }
  }
})

// eslint-disable-next-line
@Component<PhotoPreviewer>({
  name: 'MessageImagePreviewer',
  components: {
    'message-content': Content,
    IconButton,
    GroupAvatar,
    Avatar,
    PhotoPreviewPopUp,
    ForwardMessage
  },
  watch: {
    imagesToPreview: {
      handler () {
        this.images = [...this.imagesToPreview].slice(0, 4) as Array<ObjectType>
      },
      immediate: true
    }
  },
  directives: {
    viewer: viewer({
      debug: false
    })
  }
})
export default class PhotoPreviewer extends ComponentProps {
  selectedMessages = [] as Array<any>;
  forwardMessage = false as boolean;
  pseudoAttachmentUrl = '' as string;
  vOptions = {
    inline: false,
    button: false,
    navbar: false,
    title: false,
    toolbar: false,
    tooltip: false,
    movable: false,
    zoomable: true,
    rotatable: false,
    scalable: false,
    transition: true,
    fullscreen: false,
    keyboard: false
  };

  images = [] as Array<any>;
  id = 0 as number;
  imageSelected!: number;
  isReplyMessagesEnabled!: boolean;
  isDeleteMessagesEnabled!: boolean;
  isForwardMessagesEnabled!: boolean;
  imagesToPreview!: Array<ObjectType>;
  showToast!: (message: string, info: string) => void;

  popUpState: PopUpState = {
    opened: false
  };

  get imagePreview (): string {
    const attachment = this.images[this.imageSelected]
      ? this.images[this.imageSelected].content.attachment
      : ''

    if (typeof attachment === 'string') {
      return attachment
    }

    return this.convertArrayBufferToFile(attachment, this.images[this.imageSelected])
  }

  handleOpenPopUp (): void {
    const popup = this.$refs['popup-1'] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomOut')

    this.popUpState.opened = true
  }

  handleClosePopUp (): void {
    const popup = this.$refs['popup-1'] as any
    if (popup) {
      popup.$refs['popup-body'].classList.remove('robin-zoomIn')
      popup.$refs['popup-body'].classList.add('robin-zoomOut')

      window.setTimeout(() => {
        const popup = this.$refs['popup-1'] as any
        popup.$refs['popup-body'].classList.add('robin-zoomIn')
        popup.$refs['popup-body'].classList.remove('robin-zoomOut')

        this.popUpState.opened = false
      }, 300)
    }
  }

  closeImagePreview () {
    this.$emit('close')
  }

  convertArrayBufferToFile (buffer: Uint8Array, message: ObjectType): string {
    const type = message.content.mime_type
    const blob = arrayBufferToBlob(buffer, type)
    const file = new File([blob], createUUID(36) + '.' + mime.getExtension(type), { type }) as File

    return this.convertFileToURL(file)
  }

  convertFileToURL (file: File): string {
    return URL.createObjectURL(file)
  }

  getFileDetails (attachment: any): Record<string, any> {
    let fileName = ''
    let strArr = [] as Array<string>

    if (typeof attachment !== 'string') {
      strArr = attachment.name.split('.')
    } else {
      fileName = attachment.substring(attachment.lastIndexOf('/') + 1)
      strArr = fileName.split('.') as Array<string>
    }

    return {
      name: strArr[strArr.length - 2],
      extension: strArr[strArr.length - 1]
    }
  }

  getProfileImage (conversation: any) {
    const index = this.$robin_users.findIndex(
      (user: any) => user.userToken === conversation.sender_token
    )

    return this.$robin_users[index] ? this.$robin_users[index].profileImage : null
  }

  onSelectChange (index: number): void {
    // this.imageSelected = index
    store.setState('imageSelected', index)
  }

  downloadImage (): void {
    const fileDetails = this.getFileDetails(this.imagePreview) as any
    const element = document.createElement('a')

    element.setAttribute('href', this.imagePreview)
    element.setAttribute('download', fileDetails.name + ' ' + fileDetails.extension)
    element.click()
  }

  async deleteImage (): Promise<void> {
    const res = await this.$robin.deleteMessages(
      [this.images[this.imageSelected]._id]
    )

    if (res && !res.error) {
      if (this.images.length < 2) this.closeImagePreview()

      EventBus.$emit('image-deleted', this.images[this.imageSelected])

      window.setTimeout(() => {
        this.images.splice(this.imageSelected, 1)
      }, 300)
    } else {
      this.showToast('Failed delete image from preview.', 'error')
    }
  }

  openForwardMessage () {
    this.forwardMessage = true
    this.selectedMessages = [this.imagesToPreview[0]]
    store.setState('messageViewProfileOpen', false)
  }

  replyImageMessage () {
    store.setState('imageSelected', this.imageSelected)
    store.setState('isImageReplying', true)
    store.setState('messageViewProfileOpen', false)
    this.closeImagePreview()
  }

  onCloseForwardMessagePopup (): void {
    this.forwardMessage = false
    store.setState('selectMessagesOpen', false)
  }
}
</script>
