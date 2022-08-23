<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100" @click="$emit('view-profile')">
      <Content :font-size="14" color="#51545C">Contact Info</Content>

      <SvgIcon name="user-circle" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="handleSelectMessages()" v-if="isForwardMessagesEnabled || isDeleteMessagesEnabled || (isForwardMessagesEnabled && isDeleteMessagesEnabled)">
      <Content :font-size="14" color="#51545C">Select Messages</Content>

      <SvgIcon name="check-circle" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="handleClearMessages()" v-if="isDeleteMessagesEnabled">
      <Content :font-size="14" color="#51545C">Delete Chat</Content>

      <SvgIcon name="trash" />
    </div>
    <!-- <div class="robin-wrapper robin-w-100">
      <Content :font-size="14" color="#51545C">Delete Chat</Content>
    </div> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import Content from '@/components/Content/Content.vue'

@Component({
  name: 'PersonalMessagePopOver',
  components: {
    Content,
    SvgIcon
  }
})
export default class PersonalMessagePopOver extends Vue {
  get isDeleteMessagesEnabled () {
    return store.state.deleteMessagesEnabled
  }

  get isForwardMessagesEnabled () {
    return store.state.forwardMessagesEnabled
  }

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

.robin-w-100 {
  width: 100%;
}

.robin-zoomIn,
.robin-zoomOut {
  transform-origin: top right;
}
</style>
