<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100" @click="$emit('view-group-profile')" data-testid="view-group-profile">
      <Content :font-size="14" as="span" color="#51545C">Group Info</Content>

      <SvgIcon name="user-circle" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="handleSelectMessages()">
      <Content :font-size="14" as="span" color="#51545C">Select Messages</Content>

      <SvgIcon name="check-circle" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="handleLeaveGroup()">
      <Content :font-size="14" as="span" color="#51545C">Leave Group</Content>

      <SvgIcon name="times-square" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import store from '@/store/index'
import Content from '@/components/Content/Content.vue'

@Component({
  name: 'GroupMessagePopOver',
  components: {
    Content,
    SvgIcon
  }
})
export default class GroupMessagePopOver extends Vue {
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
