<template>
  <div class="robin-message-input">
    <div class="robin-mt-4">
      <REmojiButton />
    </div>
    <div class="robin-input-wrapper" tabindex="1" @focus="handleFocus()">
      <div
        class="robin-input"
        contenteditable="true"
        ref="input"
        @input="userTyping($event)"
      ></div>
      <div class="robin-placeholder">Type a message...</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import REmojiButton from '../REmojiButton/REmojiButton.vue'

export default Vue.extend({
  name: 'RMessageInputBar',
  components: {
    REmojiButton
  },
  data: () => ({
    text: '' as string
  }),
  methods: {
    userTyping(event: any): void {
      const element = event.target as HTMLElement
      this.text = element?.innerText
    },
    handleFocus(): void {
      const input = this.$refs.input as HTMLElement
      input?.focus()
    }
  }
})
</script>

<style scoped>
/* Input styles */
.robin-message-input {
  flex: 1;
  background-color: #f4f6f8;
  border: 1px solid rgba(35, 107, 248, 0.2);
  border-radius: 24px;
  display: flex;
  align-items: center;
  padding: 0 0 0 2.063rem;
  transition: background-color 0.1s;
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
  min-height: 44px;
  max-height: 44px;
  background-color: transparent;
  border: none;
  font-size: 0.875rem;
  padding: 0.9rem 0 0 0.625rem;
  overflow-y: auto;
  overflow-x: hidden;
  white-space: pre-wrap;
  word-wrap: break-word;
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

.robin-input:empty + .robin-placeholder {
  opacity: 1;
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
</style>
