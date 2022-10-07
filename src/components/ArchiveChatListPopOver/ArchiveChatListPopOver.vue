<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div data-testid="unarchive-chat" class="robin-wrapper robin-w-100" @click="$emit('unarchive-chat')">
      <Content :font-size="14" :color="currentTheme === 'light' ? '#101010' : '#F9F9F9'">Unarchive Chat</Content>
      <SvgIcon name="mailbox" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import Content from '../Content/Content.vue'

@Component({
  name: 'ArchivedChatListPopOver',
  components: {
    Content,
    SvgIcon
  }
})
export default class ArchivedChatListPopOver extends Vue {
  get currentTheme () {
    return store.state.currentTheme
  }
}
</script>

<style scoped>
.robin-popup {
  width: 174px;
  border: 1px solid var(--rb-color2);
  border-radius: 6px;
  background-color: var(--rb-bg-color);
}

.robin-wrapper {
  border-top: 1px solid var(--rb-color5);
  padding: 0.813rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.robin-wrapper:hover {
  background-color: var(--rb-color6);
}

.robin-wrapper:first-child {
  border: none;
  border-radius: 6px 6px 0 0;
}
.robin-wrapper:last-child {
  border-radius: 0 0 6px 6px;
}

.robin-zoomIn,
.robin-zoomOut {
  transform-origin: center center;
}
</style>
