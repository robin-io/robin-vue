<template>
  <header>
    <div class="robin-card robin-flex robin-flex-align-center" v-show="!selectMessagesOpen">
      <div class="robin-card-info robin-mr-16">
        <RGroupAvatar v-if="conversation.is_group" />
        <RAvatar v-else />
      </div>
      <div class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-flex-1">
        <div class="robin-mt-6">
          <RText font-weight="normal" color="#000000" :font-size="16" :line-height="20" v-if="!conversation.is_group">
            {{ conversation.senderToken == $user_token ? conversation.sender_name : conversation.receiver_name }}
          </RText>
          <RText font-weight="normal" color="#000000" :font-size="16" :line-height="20" v-else>
            {{ conversation.name }}
          </RText>
        </div>
        <div class="robin-mt-6">
          <!-- <RText v-show="conversation.is_group" as="p" font-weight="normal" color="#7A7A7A" :font-size="14" :line-height="18">53 Members</RText> -->
          <RText v-show="!conversation.is_group" as="p" font-weight="normal" color="#7A7A7A" :font-size="14" :line-height="18">{{ conversation.status }}</RText>
        </div>
      </div>
    </div>
    <RButton v-show="selectMessagesOpen" color="#7A7A7A" class="robin-pulse" emit="clicked" @clicked="cancelSelect()">Cancel</RButton>
    <div class="robin-ml-auto" @click="handleOpenPopUp(conversation.is_group ? 'popup-1' : 'popup-2')" v-show="!selectMessagesOpen">
      <ROptionButton @clickoutside="handleClosePopUp(conversation.is_group ? 'popup-1' : 'popup-2')" />
    </div>
    <div class="robin-ml-auto robin-pulse" v-show="selectMessagesOpen && selectedMessages.length > 0" @click="$emit('forward-message')">
      <RButton>Forward</RButton>
    </div>
    <div class="robin-popup-container" v-show="popUpState.opened && !selectMessagesOpen">
      <RGroupMessagePopOver ref="popup-1" v-show="conversation.is_group" :conversation="conversation" />
      <RPersonalMessagePopOver ref="popup-2" v-show="!conversation.is_group" />
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { State, Mutation } from 'vuex-class'
import { RootState } from '@/utils/types'
import RGroupAvatar from '@/components/ChatList/RGroupAvatar/RGroupAvatar.vue'
import RAvatar from '@/components/ChatList/RAvatar/RAvatar.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import RButton from '@/components/ChatList/RButton/RButton.vue'
import ROptionButton from '../ROptionButton/ROptionButton.vue'
import RGroupMessagePopOver from '../RGroupMessagePopOver/RGroupMessagePopOver.vue'
import RPersonalMessagePopOver from '../RPersonalMessagePopOver/RPersonalMessagePopOver.vue'
import EventBus from '@/event-bus'

interface PopUpState {
  opened: boolean
}

const ComponentProps = Vue.extend({
  props: {
    conversation: {
      type: Object,
      default: () => ({})
    },
    selectedMessages: {
      type: Array,
      default: () => []
    }
  }
})

@Component({
  name: 'RGroupChatHeader',
  components: {
    RGroupAvatar,
    RText,
    RButton,
    ROptionButton,
    RAvatar,
    RGroupMessagePopOver,
    RPersonalMessagePopOver
  }
})
export default class RGroupChatHeader extends ComponentProps {
  @State('selectMessagesOpen') selectMessagesOpen?: RootState
  @Mutation('setSelectMessagesOpen') setSelectMessagesOpen: any

  popUpState: PopUpState = {
    opened: false
  }

  created() {
    this.handleUserConnect()
    this.handleUserDisconnect()
  }

  handleOpenPopUp(refKey: string): void {
    const popup = this.$refs[refKey] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomOut')

    this.popUpState.opened = true
  }

  handleClosePopUp(refKey: string): void {
    const popup = this.$refs[refKey] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomIn')
    popup.$refs['popup-body'].classList.add('robin-zoomOut')

    window.setTimeout(() => {
      const popup = this.$refs[refKey] as any
      popup.$refs['popup-body'].classList.add('robin-zoomIn')
      popup.$refs['popup-body'].classList.remove('robin-zoomOut')

      this.popUpState.opened = false
    }, 300)
  }

  handleUserConnect() {
    EventBus.$on('user.connect', (conversation: string) => {
      console.log(conversation, '<--')
      if (conversation !== this.$user_token) {
        this.conversation.status = 'online'
      }
    })
  }

  handleUserDisconnect() {
    EventBus.$on('user.disconnect', (conversation: string) => {
      if (conversation !== this.$user_token) {
        this.conversation.status = 'offline'
      }
    })
  }

  cancelSelect(): void {
    this.setSelectMessagesOpen(false)
  }
}
</script>

<style scoped>
header {
  width: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 1.938rem 2.688rem 1.375rem 3.125rem;
  position: relative;
  z-index: 3;
  min-height: 100px;
}

.robin-card-container {
  width: 100%;
}

.robin-popup-container {
  position: absolute;
  top: 70px;
  right: 45px;
  z-index: 100;
}
</style>
