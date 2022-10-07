<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100" @click="$emit('download')" data-testid="download-button">
      <Content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'">Save Image</Content>
      <SvgIcon name="imageDownload" :to-emit="false" :to-click-away="false" :color="currentTheme === 'light' ? '#6B7491' : '#F9F9F9'" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('reply')" data-testid="reply-button" v-if="isReplyMessagesEnabled">
      <Content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'">Reply Message</Content>
      <SvgIcon name="reply" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'" :to-emit="false" :to-click-away="false" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('forward')" data-testid="forward-button" v-if="isForwardMessagesEnabled">
      <Content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'">Forward</Content>
      <SvgIcon name="forward"  :to-emit="false" :to-click-away="false" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'"/>
    </div>
    <div class="robin-wrapper robin-w-100" @click="$emit('delete')" data-testid="delete-button" v-if="isDeleteMessagesEnabled">
      <Content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'">Delete Message</Content>
      <SvgIcon name="trash" :color="currentTheme === 'light' ? '#D53120' : '#000000'" :to-emit="false" :to-click-away="false" />
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
    Content,
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

<style scoped>
.robin-popup {
  width: 220px;
  /* max-width: 174px; */
  /* padding: 0.5rem 0.563rem; */
  border: 1px solid var(--rb-color2);
  border-radius: 6px;
  background-color: var(--rb-bg-color);
  will-change: transform;
}

.robin-wrapper {
  border-top: 1px solid var(--rb-color5);
  padding: 0.813rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.robin-wrapper:first-child {
  border: none;
  border-radius: 6px 6px 0 0;
}
.robin-wrapper:last-child {
  border-radius: 0 0 6px 6px;
}

.robin-wrapper:hover {
  background-color: var(--rb-color6);
}

.robin-zoomIn,
.robin-zoomOut {
  transform-origin: top right;
}
</style>
