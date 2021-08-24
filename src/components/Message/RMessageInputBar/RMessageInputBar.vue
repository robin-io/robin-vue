<template>
  <div class="robin-message-box" v-on-clickaway="handleEmojiClosePopUp">
    <div
      class="robin-emoji-container robin-emoji-out robin-squeezeOut"
      v-show="popUpState.emojiOpened"
      ref="popup-1"
    >
      <VEmojiPicker
        @select="selectEmoji"
        label-search="Search"
        lang="pt-BR"
        class="robin-emoji"
      />
    </div>
    <div class="robin-message-box-inner">
      <div class="robin-message-input">
        <div class="robin-mt-4">
          <REmojiButton
            @clicked="!popUpState.emojiOpened ? handleEmojiOpenPopUp() : handleEmojiClosePopUp()"
          />
        </div>
        <div class="robin-input-wrapper" tabindex="1">
          <textarea
            class="robin-input"
            ref="input"
            v-model="text"
            @keydown.esc="escapeText()"
            @keydown.enter.exact.prevent="sendMessage()"
            placeholder="Type a message..."
          ></textarea>
        </div>
      </div>

      <div class="robin-pl-21" v-show="text != ''">
        <RSendButton @sendmessage="sendMessage()" />
      </div>

      <div class="robin-pl-25" v-show="text == ''" @click="handleOpenPopUp()">
        <RAttachFileButton @clickoutside="handleClosePopUp()" />
      </div>
      <!-- <div class="robin-pl-21" v-show="text == ''">
        <RVoiceRecorderButton />
      </div> -->
      <div class="robin-popup-container" v-show="popUpState.opened">
        <RAttachFilePopOver ref="popup-2" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { VEmojiPicker } from 'v-emoji-picker'
import { mixin as clickaway } from 'vue-clickaway'
import Component from 'vue-class-component'
import RSendButton from '../RSendButton/RSendButton.vue'
// import RVoiceRecorderButton from '../RVoiceRecorderButton/RVoiceRecorderButton.vue'
import RAttachFileButton from '../RAttachFileButton/RAttachFileButton.vue'
import REmojiButton from '../REmojiButton/REmojiButton.vue'
import RAttachFilePopOver from '../RAttachFilePopOver/RAttachFilePopOver.vue'

interface PopUpState {
  opened: boolean
  emojiOpened: boolean
}

const ComponentProps = Vue.extend({
  props: {
    conversation: {
      type: Object as any,
      default: (): any => {}
    }
  }
})

@Component({
  name: 'RMessageInputBar',
  mixins: [clickaway],
  components: {
    REmojiButton,
    RSendButton,
    RAttachFileButton,
    // RVoiceRecorderButton,
    RAttachFilePopOver,
    VEmojiPicker
  }
})
export default class RMessageInputBar extends ComponentProps {
  text = '' as string
  popUpState: PopUpState = {
    opened: false,
    emojiOpened: false
  }

  sendMessage (): void {
    this.$robin.sendMessageToConversation(
      {
        msg: this.text,
        sender_token: this.$user_token,
        receiver_token: this.conversation.receiver_token,
        timestamp: new Date()
      },
      this.$conn,
      this.$channel,
      this.conversation._id
    )

    const input = this.$refs.input as HTMLInputElement
    input.value = ''
    this.text = ''
  }

  escapeText (): void {
    const input = this.$refs.input as HTMLInputElement
    input.value = ''
    this.text = ''
  }

  selectEmoji (emoji: any): void {
    this.text += emoji.data
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
    }, 300)
  }

  handleOpenPopUp (): void {
    const popup = this.$refs['popup-2'] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomOut')

    this.popUpState.opened = true
  }

  handleClosePopUp (): void {
    const popup = this.$refs['popup-2'] as any
    popup.$refs['popup-body'].classList.add('robin-zoomOut')

    window.setTimeout(() => {
      const popup = this.$refs['popup-2'] as any
      popup.$refs['popup-body'].classList.remove('robin-zoomOut')

      this.popUpState.opened = false
    }, 300)
  }
}
</script>

<style scoped>
.robin-message-box {
  width: 100%;
  position: relative;
}

.robin-emoji-container {
  width: 100%;
  z-index: 1;
}

.robin-emoji-out {
  position: absolute;
  top: -400px;
  left: 0;
  transform-origin: bottom;
}

.robin-emoji {
  width: 100% !important;
}

.robin-message-box-inner {
  background-color: #fff;
  box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.07);
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  padding: 2.875rem 2.688rem 2.875rem 3.125rem;
  position: relative;
  z-index: 2;
}

/* Input styles */
.robin-message-input {
  flex: 1;
  background-color: #f4f6f8;
  border: 1px solid rgba(35, 107, 248, 0.2);
  border-radius: 24px;
  display: flex;
  align-items: center;
  padding: 0 0 0 2.063rem;
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

.robin-popup-container {
  position: absolute;
  top: -140px;
  right: 52px;
  /* right: 89px; */
  z-index: 100;
}

/* .robin-input:empty + .robin-placeholder {
  opacity: 1;
} */

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
</style>
