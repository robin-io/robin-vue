<template>
  <div class="robin-toast-container">
    <toast
      v-for="([key, value], index) in toastMessages"
      :key="index"
      :message="key"
      :type="value"
    />
  </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import Toast from '../Toast/Toast.vue'
import ConversationMixin from '@/mixins/conversation-mixins'

// eslint-disable-next-line
@Component<ToastContainer>({
  name: 'ToastContainer',
  components: {
    Toast
  },
  watch: {
    isToastOpen: {
      handler (val) {
        if (val) {
          this.removeToast()
        }
      },
      immediate: true
    }
  }
})
export default class ToastContainer extends mixins(ConversationMixin) {
  updated () {
    if (this.isToastOpen) {
      this.removeToast()
    }
  }

  async removeToast () {
    // eslint-disable-next-line
    for (const [key, _] of this.toastMessages) {
      await new Promise((resolve) =>
        setTimeout(() => {
          this.closeToast(key)
          resolve(null)
        }, 3000)
      )
    }
  }
}
</script>
