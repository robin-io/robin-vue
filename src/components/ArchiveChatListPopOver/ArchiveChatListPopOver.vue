<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div data-testid="unarchive-chat" class="robin-wrapper robin-w-100" @click="$emit('unarchive-chat')">
      <Content :font-size="14" color="#101010">Unarchive Chat</Content>
      <SvgIcon name="mailbox" color="#51545C" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import Content from '../Content/Content.vue'

@Component({
  name: 'RArchivedChatListPopOver',
  components: {
    Content,
    SvgIcon
  }
})
export default class RArchivedChatListPopOver extends Vue {}
</script>

<style scoped>
.robin-popup {
    width: 174px;
    border: 1px solid #f5f7fc;
    border-radius: 6px;
    background-color: #fff;
}

.robin-wrapper {
    border-top: 1px solid #efefef;
    padding: 0.813rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
}

.robin-wrapper:hover {
    background-color: rgba(244, 246, 248, 0.8);
}

.robin-wrapper:first-child {
    border: none;
}

.robin-zoomIn,
.robin-zoomOut {
    transform-origin: center center;
}
</style>
