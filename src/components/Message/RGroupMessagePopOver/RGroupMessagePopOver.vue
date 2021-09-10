<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <!-- <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" as="span" color="#101010">Group Info</RText>
    </div> -->
    <div class="robin-wrapper robin-w-100" @click="handleSelectMessages()">
      <RText :font-size="14" as="span" color="#101010">Select Messages</RText>
    </div>
    <!-- <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" as="span" color="#101010">Mute Group</RText>
    </div> -->
    <div class="robin-wrapper robin-w-100" @click="handleLeaveGroup()">
      <RText :font-size="14" as="span" color="#101010">Leave Group</RText>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Mutation } from 'vuex-class'
import RText from '@/components/ChatList/RText/RText.vue'

@Component({
  name: 'RGroupMessagePopOver',
  components: {
    RText
  }
})
export default class RGroupMessagePopOver extends Vue {
  @Mutation('setSelectMessagesOpen') setSelectMessagesOpen: any

  handleSelectMessages() {
    this.setSelectMessagesOpen(true)
  }

  handleLeaveGroup() {}
}
</script>

<style scoped>
.robin-popup {
  width: 174px;
  /* max-width: 174px; */
  padding: 0.5rem 0.563rem;
  border: 1px solid rgba(35, 107, 248, 0.2);
  border-radius: 24px;
  background-color: #fff;
}

.robin-wrapper {
  border-top: 1px solid #f4f6f8;
  padding: 0.813rem 0.5rem;
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
  transform-origin: top right;
}
</style>
