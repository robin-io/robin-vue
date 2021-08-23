<template>
  <div class="robin-message-box">
    <div class="robin-message-input">
      <div class="robin-mt-4">
        <REmojiButton />
      </div>
      <div class="robin-input-wrapper" tabindex="1" @focus="handleFocus()">
        <textarea
          class="robin-input"
          ref="input"
          v-model="text"
          @keydown.enter.exact.prevent
          @keyup.enter="sendMessage($event)"
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
    <div class="robin-pl-21" v-show="text == ''">
      <RVoiceRecorderButton />
    </div>
    <div class="robin-popup-container" v-show="popUpState.opened">
      <RAttachFilePopOver ref="popup-1" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import RSendButton from '../RSendButton/RSendButton.vue'
import RVoiceRecorderButton from '../RVoiceRecorderButton/RVoiceRecorderButton.vue'
import RAttachFileButton from '../RAttachFileButton/RAttachFileButton.vue'
import REmojiButton from '../REmojiButton/REmojiButton.vue'
import RAttachFilePopOver from '../RAttachFilePopOver/RAttachFilePopOver.vue'

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
  components: {
    REmojiButton,
    RSendButton,
    RAttachFileButton,
    RVoiceRecorderButton,
    RAttachFilePopOver
  }
})
export default class RMessageInputBar extends ComponentProps {
  text = '' as string
  popUpState = {
    opened: false
  }

  sendMessage (event: any) {
    if (event.ctrlKey) {
      console.log(event, 'ctrl')
      this.addNewLine()
    } else {
      console.log(event, 'none')
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
      this.text = ''
    }
  }

  addNewLine (): void {
    const input = this.$refs.input as HTMLInputElement
    if (input) {
      input.innerHTML += '&#13;&#10;'
    }
  }

  handleOpenPopUp (): void {
    const popup = this.$refs['popup-1'] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomOut')

    this.popUpState.opened = true
  }

  handleClosePopUp (): void {
    const popup = this.$refs['popup-1'] as any
    popup.$refs['popup-body'].classList.add('robin-zoomOut')

    window.setTimeout(() => {
      const popup = this.$refs['popup-1'] as any
      popup.$refs['popup-body'].classList.remove('robin-zoomOut')

      this.popUpState.opened = false
    }, 300)
  }
}
</script>

<style scoped>
.robin-message-box {
  width: 100%;
  height: 44px;
  background-color: #fff;
  display: flex;
  align-items: center;
  box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.07);
  padding: 2.875rem 2.688rem 2.875rem 3.125rem;
  position: relative;
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
  font-size: 0.875rem;
  /* padding: 0.9rem 0 0 0.625rem; */
  overflow-y: auto;
  overflow-x: hidden;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;

  /* textarea */
  resize: none;
  padding: 1rem 0 0 0.625rem;
}

.robin-placeholder {
  position: absolute;
  top: 0;
  left: 11px;
  display: flex;
  align-items: center;
  height: 100%;
  opacity: 0;
  font-size: 0.875rem;
  color: #bbc1d6;
}

.robin-popup-container {
  position: absolute;
  top: -140px;
  right: 89px;
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
