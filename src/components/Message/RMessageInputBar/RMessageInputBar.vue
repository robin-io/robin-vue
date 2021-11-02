<template>
  <div class="robin-message-box" v-on-clickaway="handleEmojiClosePopUp">
    <div class="robin-emoji-container robin-emoji-out robin-squeezeOut" v-show="popUpState.emojiOpened" ref="popup-1" @keydown.enter.exact.prevent="sendMessage()" tabindex="1">
      <VEmojiPicker @select="selectEmoji" :emojisByRow="15" label-search="Search" lang="pt-BR" class="robin-emoji" />
    </div>

    <div class="robin-file-upload-container robin-squeezeOut" ref="popup-2" v-show="files && files.length > 0">
      <div class="robin-wrapper robin-flex robin-flex-1 robin-pt-8 robin-pb-8 robin-pl-24 robin-pr-24 robin-overflow-y-auto">
        <div class="robin-file-upload" v-for="(file, index) in files" :key="`image-${index}`">
          <div class="robin-file-upload-delete" @click="removeFile(index)">
            <IconButton name="close" :to-emit="false" :to-click-away="false" />
            <!-- <RCloseButton /> -->
          </div>
          <img :src="file.localUrl" :alt="`${file.name}-image`" v-if="file.type.includes('image')" />
          <div class="robin-video" v-if="file.type.includes('video')">
            <video width="100%" height="100%" @click="removeFile(index)" controls>
              <source :src="file.localUrl" :type="file.type" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div class="robin-file" v-if="acceptedDocFiles.includes(file.extension)">
            <RFileIcon />
            <RText as="span">
              {{ file.name.length > 6 ? file.name.substring(0, 6) + '..' : file.name }}
            </RText>
            <RText as="span">
              {{ '.' + file.extension }}
            </RText>
          </div>
        </div>
      </div>
      <div class="robin-file-upload-close">
        <!-- <RRemoveButton @clicked="handleFileUploadClose" /> -->
        <IconButton name="remove" @clicked="handleFileUploadClose" :to-emit="true" :to-click-away="false" />
      </div>
    </div>

    <div class="robin-message-box-inner" @keydown.enter.exact.prevent="sendMessage()" tabindex="1">
      <div class="robin-message-input">
        <div class="robin-mt-4">
          <IconButton name="emoji" @clicked="!popUpState.emojiOpened ? handleEmojiOpenPopUp() : handleEmojiClosePopUp()" :active="popUpState.emojiOpened" :to-emit="true" :to-click-away="false" />
          <!-- <REmojiButton @clicked="!popUpState.emojiOpened ? handleEmojiOpenPopUp() : handleEmojiClosePopUp()" :active="popUpState.emojiOpened" /> -->
        </div>
        <div class="robin-input-wrapper" tabindex="1">
          <textarea class="robin-input" ref="input" @input="enterText($event)" :value="text" @keydown.esc="escapeText()" placeholder="Type a message..."></textarea>
        </div>
      </div>
      <div class="robin-pl-21 robin-come-up" v-show="(text.trim().length > 0 || files.length > 0) && !isUploading">
        <IconButton name="send" @sendmessage="sendMessage()" emit="sendmessage" :to-emit="true" :to-click-away="false" />
        <!-- <RSendButton @sendmessage="sendMessage()" /> -->
      </div>
      <div class="robin-send-button-loader robin-ml-21" v-show="isUploading">
        <div class="robin-spinner2"></div>
      </div>
      <div class="robin-pl-25" v-show="text.trim() == '' && files.length < 1 && !isUploading" @click="handleOpenPopUp()">
        <IconButton name="attachFile" @clickoutside="handleClosePopUp()" :to-click-away="true" :style-stroke="true" :to-emit="false" primary-color="rgba(21, 174, 115, 1)" :hasFocus="true" />
        <!-- <RAttachFileButton @clickoutside="handleClosePopUp()" /> -->
      </div>
      <!-- <div class="robin-pl-21" v-show="text == ''">
        <RVoiceRecorderButton />
      </div> -->
      <div class="robin-popup-container" v-show="popUpState.opened">
        <RAttachFilePopOver ref="popup-3" @file-upload="handleFileUpload" @open-camera="$emit('open-camera')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { VEmojiPicker } from 'v-emoji-picker'
import { mixin as clickaway } from 'vue-clickaway'
import Component from 'vue-class-component'
// import RSendButton from '../RSendButton/RSendButton.vue'
// import RVoiceRecorderButton from '../RVoiceRecorderButton/RVoiceRecorderButton.vue'
import IconButton from '../../IconButton.vue'
// import RAttachFileButton from '../RAttachFileButton/RAttachFileButton.vue'
// import REmojiButton from '../REmojiButton/REmojiButton.vue'
import RAttachFilePopOver from '../RAttachFilePopOver/RAttachFilePopOver.vue'
// import RCloseButton from '../../ChatList/RCloseButton/RCloseButton.vue'
// import RRemoveButton from '../../ChatList/RRemoveButton/RRemoveButton.vue'
import RText from '../../ChatList/RText/RText.vue'
import RFileIcon from '../RFileIcon.vue'

interface PopUpState {
  opened: boolean
  emojiOpened: boolean
}

const ComponentProps = Vue.extend({
  props: {
    conversation: {
      type: Object as any,
      default: (): any => {}
    },
    capturedImage: {
      type: Object,
      default: (): any => {}
    }
  }
})

// eslint-disable-next-line
@Component<RMessageInputBar>({
  name: 'RMessageInputBar',
  mixins: [clickaway],
  components: {
    // REmojiButton,
    // RSendButton,
    IconButton,
    // RAttachFileButton,
    // RVoiceRecorderButton,
    RAttachFilePopOver,
    VEmojiPicker,
    // RCloseButton,
    // RRemoveButton,
    RText,
    RFileIcon
  },
  watch: {
    capturedImage: function (image) {
      this.files.push({
        name: 'captured-image',
        type: 'image/jpeg',
        extension: 'jpeg',
        localUrl: image.localUrl,
        file: image.file
      })
    }
  }
})
export default class RMessageInputBar extends ComponentProps {
  text = '' as string
  files = [] as Array<any>
  acceptedDocFiles = '.csv, .xlsx, .xls, .doc, .docx, .ppt, .pptx, .txt, .pdf, .html, .7z, .zip, .rtf, .rar, .tar, .odt, .md' as string
  isUploading = false as boolean

  popUpState: PopUpState = {
    opened: false,
    emojiOpened: false
  }

  get checkFileFormat () {
    return this.files.some((file) => file.type.includes('image'))
  }

  async sendMessage (): Promise<void> {
    this.isUploading = true
    if (this.files.length > 0 && this.text.trim().length === 0) {
      await this.sendFileMessage()
    } else if (this.text.trim().length > 0 && this.files.length < 1) {
      await this.sendTextMessage()
    } else if (this.text.trim().length > 0 && this.files.length > 0) {
      await Promise.all([this.sendTextMessage(), this.sendFileMessage()])
    } else {
      // Do nothing
    }

    const input = this.$refs.input as HTMLInputElement
    input.value = ''
    this.text = ''
    this.files = []
    this.isUploading = false
    this.popUpState.emojiOpened = false
  }

  async sendTextMessage () {
    this.$robin.sendMessageToConversation(
      {
        msg: this.text,
        sender_token: this.$user_token,
        receiver_token: this.conversation.receiver_token === this.$user_token ? this.conversation.sender_token : this.conversation.receiver_token,
        timestamp: new Date()
      },
      this.$conn,
      this.$channel,
      this.conversation._id,
      this.$user_token
    )
    return await new Promise((resolve) => setTimeout(resolve, 250))
  }

  async sendFileMessage (): Promise<any> {
    return await Promise.all(
      this.files.map(async (file) => {
        await this.$robin.sendMessageAttachment(this.$user_token, this.conversation._id, file.file)
      })
    )
  }

  enterText (event: any): void {
    this.text = event.target.value
  }

  escapeText (): void {
    const input = this.$refs.input as HTMLInputElement
    input.value = ''
    this.text = ''
  }

  selectEmoji (emoji: any): void {
    this.text += emoji.data
    const input = this.$refs.input as HTMLInputElement
    input.focus()
  }

  handleEmojiOpenPopUp (): void {
    const popup = this.$refs['popup-1'] as any
    popup.classList.remove('robin-squeezeIn')

    this.popUpState.emojiOpened = true
  }

  handleEmojiClosePopUp (): void {
    const popup = this.$refs['popup-1'] as any
    popup.classList.remove('robin-squeezeOut')
    popup.classList.add('robin-squeezeIn')

    window.setTimeout(() => {
      const popup = this.$refs['popup-1'] as any
      popup.classList.remove('robin-squeezeIn')
      popup.classList.add('robin-squeezeOut')

      this.popUpState.emojiOpened = false
    }, 100)
  }

  handleOpenPopUp (): void {
    const popup = this.$refs['popup-3'] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomOut')

    this.popUpState.opened = true
  }

  handleClosePopUp (): void {
    const popup = this.$refs['popup-3'] as any
    popup.$refs['popup-body'].classList.add('robin-zoomOut')

    window.setTimeout(() => {
      const popup = this.$refs['popup-3'] as any
      popup.$refs['popup-body'].classList.remove('robin-zoomOut')

      this.popUpState.opened = false
    }, 300)
  }

  handleFileUpload (file: any) {
    this.files.push(file)
  }

  handleFileUploadClose (): void {
    const popup = this.$refs['popup-2'] as any
    popup.classList.remove('robin-squeezeOut')
    popup.classList.add('robin-squeezeIn')

    window.setTimeout(() => {
      const popup = this.$refs['popup-2'] as any
      popup.classList.remove('robin-squeezeIn')
      popup.classList.add('robin-squeezeOut')

      this.files = []
    }, 100)
  }

  removeFile (index: number): void {
    if (this.files.length > 1) {
      this.files.splice(index, 1)
    } else {
      const popup = this.$refs['popup-2'] as any
      popup.classList.remove('robin-squeezeOut')
      popup.classList.add('robin-squeezeIn')

      window.setTimeout(() => {
        const popup = this.$refs['popup-2'] as any
        popup.classList.remove('robin-squeezeIn')
        popup.classList.add('robin-squeezeOut')

        this.files = []
      }, 100)
    }
  }
}
</script>

<style scoped>
.robin-message-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.robin-emoji-container {
  width: 100%;
  z-index: 1;
}

.robin-emoji-container:focus {
  outline: none;
}

.robin-emoji-out {
  position: absolute;
  top: -426px;
  left: 0;
  transform-origin: bottom;
}

.robin-emoji {
  width: 100% !important;
}

.robin-file-upload-container {
  box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.07);
  width: 100%;
  flex: 1;
  height: 140px;
  top: -140px;
  left: 0;
  bottom: 0;
  transform-origin: bottom;
  display: flex;
  align-items: center;
  background-color: #fff;
  position: absolute;
  z-index: 1;
}

.robin-file-upload-container .robin-wrapper {
  gap: 1rem;
}

.robin-file-upload-container img {
  width: 100px;
  height: 100px;
}

.robin-file-upload .robin-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 104px;
  height: 104px;
  border: 1px solid #f4f6f8;
  padding: 1rem 1rem;
}

.robin-file > .material-icon {
  color: var(--primary-color);
  font-size: 1.3rem;
}

.robin-file-upload .robin-video {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 104px;
  height: 104px;
  border: 1px solid #f4f6f8;
}

.robin-message-box-inner {
  background-color: #fff;
  box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.07);
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  padding: clamp(2.3rem, 4vh, 2.875rem) 2.688rem clamp(2.3rem, 4vh, 2.875rem) 3.125rem;
  position: relative;
  z-index: 2;
}

.robin-message-box-inner:focus {
  outline: 0;
}

/* Input styles */
.robin-message-input {
  flex: 1;
  background-color: #f4f6f8;
  border: 1px solid rgba(35, 107, 248, 0.2);
  border-radius: 24px;
  display: flex;
  align-items: center;
  padding: 0 0 0 clamp(3%, 5vw, 2.063rem);
  transition: background-color 200ms;
}

.robin-message-input:focus-within {
  background-color: #fff;
}

.robin-input-wrapper {
  width: 100%;
  position: relative;
}

.robin-input {
  width: 100%;
  min-width: 100%;
  min-height: 44px;
  max-height: 44px;
  background-color: transparent;
  border: none;
  font-size: 1rem;
  line-height: 1rem;
  /* padding: 0.9rem 0 0 0.625rem; */
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;

  /* textarea */
  resize: none;
  padding: 1rem 0 0 0.625rem;
}

.robin-input::placeholder {
  white-space: nowrap;
}

.robin-popup-container {
  position: absolute;
  top: -140px;
  right: 52px;
  /* right: 89px; */
  z-index: 100;
}

.robin-file-upload {
  position: relative;
}

.robin-file-upload-close {
  flex: 1;
  max-width: 50px;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -1px 0px 20px -10px rgba(35, 107, 248, 0.2);
}

.robin-file-upload-delete {
  position: absolute;
  top: -3px;
  left: -7px;
  z-index: 3;
  transition: transform 0.4s;
}

.robin-file-upload-delete:hover {
  transform: scale(1.1);
}

.robin-send-button-loader {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #15ae73;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: default;
}

/* Input focus */
.robin-input:focus {
  outline: none;
}

/* Input placeholder */
::placeholder {
  color: #bbc1d6;
}

::-moz-placeholder {
  color: #bbc1d6;
}

:-ms-input-placeholder {
  color: #bbc1d6;
}

::-ms-input-placeholder {
  color: #bbc1d6;
}

@media (min-width: 768px) {
  .robin-file-upload-container .robin-wrapper::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

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
</style>
