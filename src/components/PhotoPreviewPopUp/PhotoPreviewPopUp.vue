<template>
  <div class="robin-message-preview-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100" @click="$emit('download')" data-testid="download-button">
      <message-content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'"
        >Save Image</message-content
      >
      <svg-icon
        name="imageDownload"
        :to-emit="false"
        :to-click-away="false"
        :color="currentTheme === 'light' ? '#6B7491' : '#F9F9F9'"
      />
    </div>
    <div
      class="robin-wrapper robin-w-100"
      @click="$emit('reply')"
      data-testid="reply-button"
      v-if="isReplyMessagesEnabled"
    >
      <message-content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'"
        >Reply Message</message-content
      >
      <svg-icon
        name="reply"
        :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
        :to-emit="false"
        :to-click-away="false"
      />
    </div>
    <div
      class="robin-wrapper robin-w-100"
      @click="$emit('forward')"
      data-testid="forward-button"
      v-if="isForwardMessagesEnabled"
    >
      <message-content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'"
        >Forward</message-content
      >
      <svg-icon
        name="forward"
        :to-emit="false"
        :to-click-away="false"
        :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"
      />
    </div>
    <div
      class="robin-wrapper robin-w-100"
      @click="$emit('delete')"
      data-testid="delete-button"
      v-if="isDeleteMessagesEnabled"
    >
      <message-content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'"
        >Delete Message</message-content
      >
      <svg-icon
        name="trash"
        :color="currentTheme === 'light' ? '#D53120' : '#000000'"
        :to-emit="false"
        :to-click-away="false"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import Content from '@/components/Content/Content.vue'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'

@Component({
  name: 'MessagePreviewPopOver',
  components: {
    'message-content': Content,
    SvgIcon
  }
})
export default class MessagePreviewPopOver extends Vue {
  get currentTheme () {
    return store.state.currentTheme
  }

  get isDeleteMessagesEnabled () {
    return store.state.deleteMessagesEnabled
  }

  get isForwardMessagesEnabled () {
    return store.state.forwardMessagesEnabled
  }

  get isReplyMessagesEnabled () {
    return store.state.replyMessagesEnabled
  }
}
</script>
