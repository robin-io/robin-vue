<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100" @click="$emit('view-group-profile')" data-testid="view-group-profile">
      <Content :font-size="14" as="span" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'">Group Info</Content>

      <SvgIcon name="user-circle" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="handleSelectMessages()">
      <Content :font-size="14" as="span" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'">Select Messages</Content>

      <SvgIcon name="check-circle" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="handleLeaveGroup()">
      <Content :font-size="14" as="span" :color="currentTheme === 'light' ? '#51545C' : '#F9F9F9'">Leave Group</Content>

      <SvgIcon name="times-square" :color="currentTheme === 'light' ? '#D53120' : '#000'" />
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
  get currentTheme () {
    return store.state.currentTheme
  }

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

.robin-wrapper:first-child {
  border: none;
}

.robin-zoomIn,
.robin-zoomOut {
  transform-origin: top right;
}
</style>
