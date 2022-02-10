<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100" @click="$emit('view-profile')">
      <RText :font-size="14" color="#51545C">Contact Info</RText>

      <SvgIcon name="user-circle" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="handleSelectMessages()">
      <RText :font-size="14" color="#51545C">Select Messages</RText>

      <SvgIcon name="check-circle" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="handleClearMessages()">
      <RText :font-size="14" color="#51545C">Delete Chat</RText>

      <SvgIcon name="trash" />
    </div>
    <!-- <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" color="#51545C">Delete Chat</RText>
    </div> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import SvgIcon from '../../SvgIcon/SvgIcon.vue'
import store from '../../../store/index'
import RText from '@/components/ChatList/RText/RText.vue'

@Component({
  name: 'RPersonalMessagePopOverr',
  components: {
    RText,
    SvgIcon
  }
})
export default class RPersonalMessagePopOver extends Vue {
  handleSelectMessages () {
    store.setState('selectMessagesOpen', true)
  }

  handleClearMessages () {
    store.setState('clearMessages', true)
  }
}
</script>

<style scoped>
.robin-popup {
  width: 174px;
  border: 1px solid #F5F7FC;
  border-radius: 6px;
  background-color: #fff;
}

.robin-wrapper {
  border-top: 1px solid #EFEFEF;
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

.robin-w-100 {
  width: 100%;
}

.robin-zoomIn,
.robin-zoomOut {
  transform-origin: top right;
}
</style>
