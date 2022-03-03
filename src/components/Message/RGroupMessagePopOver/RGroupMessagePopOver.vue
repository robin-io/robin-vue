<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100" @click="$emit('view-group-profile')">
      <RText :font-size="14" as="span" color="#51545C">Group Info</RText>

      <SvgIcon name="user-circle" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="handleSelectMessages()">
      <RText :font-size="14" as="span" color="#51545C">Select Messages</RText>

      <SvgIcon name="check-circle" />
    </div>
    <!-- <div class="robin-wrapper robin-w-100">
      <RText :font-size="14" as="span" color="#51545C">Mute Group</RText>
    </div> -->
    <div class="robin-wrapper robin-w-100" @click="handleLeaveGroup()">
      <RText :font-size="14" as="span" color="#51545C">Leave Group</RText>

      <SvgIcon name="times-square" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import SvgIcon from '../../SvgIcon/SvgIcon.vue'
import store from '../../../store/index'
import RText from '@/components/ChatList/RText/RText.vue'

const ComponentProps = Vue.extend({
  props: {
    conversation: {
      type: Object,
      default: () => {}
    }
  }
})

@Component({
  name: 'RGroupMessagePopOver',
  components: {
    RText,
    SvgIcon
  }
})
export default class RGroupMessagePopOver extends ComponentProps {
  handleSelectMessages () {
    store.setState('selectMessagesOpen', true)
  }

  async handleLeaveGroup () {
    store.setState('exitGroup', true)
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

.robin-zoomIn,
.robin-zoomOut {
  transform-origin: top right;
}
</style>
