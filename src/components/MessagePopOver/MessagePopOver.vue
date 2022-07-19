<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-wrapper robin-w-100" @click="$emit('reply-message')" data-testid="reply-button">
      <Content :font-size="14" color="#51545C">Reply Message</Content>
      <IconButton name="reply" :to-emit="false" :to-click-away="false" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="forwardMessage()" data-testid="forward-button" v-if="isForwardMessagesEnabled">
      <Content :font-size="14" color="#51545C">Forward</Content>
      <IconButton name="forward" :to-emit="false" :to-click-away="false" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="selectMessage()" data-testid="select-button" v-if="isForwardMessagesEnabled || isDeleteMessagesEnabled || (isForwardMessagesEnabled && isDeleteMessagesEnabled)">
      <Content :font-size="14" color="#51545C">Select Message</Content>
      <IconButton name="select" :to-emit="false" :to-click-away="false" />
    </div>
    <div class="robin-wrapper robin-w-100" @click="deleteMessage()" data-testid="delete-button" v-if="isDeleteMessagesEnabled">
      <Content :font-size="14" color="#51545C">Delete Message</Content>
      <IconButton name="delete" :to-emit="false" :to-click-away="false" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import store from '@/store/index'
import Component from 'vue-class-component'
import EventBus from '@/event-bus'
import Content from '@/components/Content/Content.vue'
import IconButton from '@/components/IconButton/IconButton.vue'

const ComponentProps = Vue.extend({
  props: {
    id: {
      type: String as PropType<string>,
      default: ''
    },
    message: {
      type: [Object, Array],
      default: () => {}
    }
  }
})

@Component({
  name: 'MessagePopOver',
  components: {
    Content,
    IconButton
  }
})
export default class MessagePopOver extends ComponentProps {
  get isDeleteMessagesEnabled () {
    return store.state.deleteMessagesEnabled
  }

  get isForwardMessagesEnabled () {
    return store.state.forwardMessagesEnabled
  }

  async deleteMessage (): Promise<void> {
    this.$emit('close-modal')

    const res = await this.$robin.deleteMessages([this.id], this.$user_token)

    if (res && !res.error) {
      EventBus.$emit('message-deleted', this.message)
      this.$toast.open({
        message: 'Message Deleted.',
        type: 'success',
        position: 'bottom-left'
      })
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  selectMessage () {
    store.setState('selectMessagesOpen', true)
    this.$emit('select-message')
  }

  forwardMessage () {
    store.setState('selectMessagesOpen', true)
    this.$emit('select-message')
    this.$emit('forward-message')
  }
}
</script>

<style scoped>
.robin-popup {
  width: 200px;
  max-width: 220px;
  border-radius: 16px;
  border: 1px solid #f5f7fc;
  border-radius: 6px;
  background-color: #fff;
}

.robin-wrapper {
  border-top: 1px solid #efefef;
  padding: 0.813rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  justify-content: space-between;
}

.robin-wrapper:first-child {
  border: none;
}

.robin-wrapper:hover {
  background-color: rgba(244, 246, 248, 0.8);
}
</style>
