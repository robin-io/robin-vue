<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <!-- <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" color="#101010">Contact Info</RText>
    </div> -->
    <div class="robin-wrapper robin-w-100" @click="handleSelectMessages()">
      <RText :font-size="14" color="#101010">Select Messages</RText>
    </div>
    <div class="robin-wrapper robin-w-100" @click="handleClearMessages()">
      <RText :font-size="14" color="#101010">Clear Messages</RText>
    </div>
    <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" color="#101010">Delete Chat</RText>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Mutation } from 'vuex-class'
import RText from '@/components/ChatList/RText/RText.vue'

@Component({
  name: 'RPersonalMessagePopOverr',
  components: {
    RText
  }
})

export default class RPersonalMessagePopOver extends Vue {
  @Mutation('setSelectMessagesOpen') setSelectMessagesOpen: any
  @Mutation('setClearMessages') setClearMessages: any

  handleSelectMessages () {
    this.setSelectMessagesOpen(true)
  }

  handleClearMessages () {
    this.setClearMessages(true)
  }
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

.robin-w-100 {
  width: 100%;
}

.robin-zoomIn,
.robin-zoomOut {
  transform-origin: top right;
}
</style>
