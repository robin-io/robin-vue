<template>
  <header>
    <div class="robin-card-container robin-flex robin-flex-align-center" v-show="!selectMessagesOpen">
      <IconButton name="back" :to-emit="true" :to-click-away="false" emit="clicked" v-show="screenWidth <= 1200" @clicked="back()" />

      <div class="robin-flex robin-flex-align-center robin-clickable" @click="openMessageProfile()">
        <div class="robin-card-info robin-mr-8">
          <RGroupAvatar v-if="conversation.is_group"  :img-url="conversation.group_icon" />

          <RAvatar :robin-users="$robin_users" v-else :status="conversation.status" :sender-token="conversation.sender_token" />
        </div>

        <div class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-flex-1">
          <div class="robin-mt-6">
            <RText font-weight="normal" color="#000000" :font-size="14" :line-height="24" v-if="!conversation.is_group">
              {{ conversation.sender_token != $user_token ? conversation.sender_name : conversation.receiver_name }}
            </RText>

            <RText font-weight="normal" color="#000000" :font-size="14" :line-height="24" v-else>
              {{ conversation.name }}
            </RText>
          </div>

          <div class="robin-mt-6">
            <RText v-show="!conversation.is_group" as="p" font-weight="normal" color="#8D9091" :font-size="12" :line-height="14">{{ conversation.status == 'online' ? 'Online' : 'Offline' }}</RText>
          </div>
        </div>
      </div>
    </div>

    <div class="robin-flex robin-robin-flex-align-center" v-show="selectMessagesOpen">
      <IconButton name="remove" :to-emit="true" :to-click-away="false" emit="close" @close="cancelSelect()" />

      <RButton color="#000" class="robin-ml-5" emit="clicked" @clicked="cancelSelect()">Select Messages</RButton>
    </div>

    <IconButton v-show="selectMessagesOpen && selectedMessages.length > 0" name="trash" :to-emit="true" :to-click-away="false" emit="delete" @delete="deleteSelectedMessages()" class="robin-ml-auto" />

    <div class="robin-options robin-ml-auto" @click="handleOpenPopUp($event, conversation.is_group ? 'popup-1' : 'popup-2')" v-show="!selectMessagesOpen">
      <IconButton @clickoutside="handleClosePopUp(conversation.is_group ? 'popup-1' : 'popup-2')" :to-click-away="true" :to-emit="false" name="openModalDot" />

      <div class="robin-popup-container" ref="popup-container" v-show="popUpState.opened && !selectMessagesOpen">
        <RGroupMessagePopOver ref="popup-1" v-show="conversation.is_group" :conversation="conversation" @view-group-profile="openMessageProfile()" />

        <RPersonalMessagePopOver ref="popup-2" v-show="!conversation.is_group" @view-profile="openMessageProfile()" />
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '../../../store/index'
import IconButton from '../../IconButton/IconButton.vue'
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
    IconButton,
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
  screenWidth = 0 as number
  // messageProfileCloseCount = 0

  popUpState: PopUpState = {
    opened: false
  }

  created () {
    this.handleUserConnect()
    this.handleUserDisconnect()
  }

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
  }

  get messageProfileOpen () {
    return store.state.messageProfileOpen
  }

  get selectMessagesOpen () {
    return store.state.selectMessagesOpen
  }

  handleOpenPopUp (event: any, refKey: string): void {
    const popupContainer = this.$refs['popup-container'] as any
    const popup = this.$refs[refKey] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomOut')

    if (!this.messageProfileOpen) {
      popupContainer.style.right = Math.floor(event.clientX / 26) + 'px'
    } else {
      popupContainer.style.right = Math.floor(event.clientX / 2.47) + 'px'
    }

    this.popUpState.opened = true
  }

  handleClosePopUp (refKey: string): void {
    const popup = this.$refs[refKey] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomIn')
    popup.$refs['popup-body'].classList.add('robin-zoomOut')

    window.setTimeout(() => {
      if (popup.$refs['popup-body']) {
        popup.$refs['popup-body'].classList.add('robin-zoomIn')
        popup.$refs['popup-body'].classList.remove('robin-zoomOut')
      }

      this.popUpState.opened = false
    }, 300)
  }

  handleUserConnect () {
    EventBus.$on('user.connect', (conversation: string) => {
      if (conversation !== this.$user_token) {
        this.conversation.status = 'online'
      }
    })
  }

  handleUserDisconnect () {
    EventBus.$on('user.disconnect', (conversation: string) => {
      if (conversation !== this.$user_token) {
        this.conversation.status = 'offline'
      }
    })
  }

  openMessageProfile () {
    store.setState('messageProfileOpen', true)
  }

  cancelSelect (): void {
    // this.setSelectMessagesOpen(false)
    store.setState('selectMessagesOpen', false)
  }

  deleteSelectedMessages () {
    this.$emit('delete-selected-messages')
  }

  onResize () {
    this.screenWidth = window.innerWidth
  }

  back () {
    EventBus.$emit('left.message')
  }
}
</script>

<style scoped>
header {
  width: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 clamp(3%, 5vw, 2.688rem) 0 clamp(3%, 5vw, 3.125rem);
  height: 79px;
  position: relative;
  z-index: 3;
  border-bottom: 1px solid #f5f7fc;
  min-height: max-content;
}

.robin-card-container >>> .robin-button {
  margin-right: 10%;
}

.robin-options {
  position: relative;
}

.robin-popup-container {
  position: fixed;
  top: 50px;
  /* right: 55px; */
  z-index: 100;
}

@media (max-width: 1200px) {
  header {
    box-shadow: 0px 2px 20px rgba(0, 104, 255, 0.06);
  }
}

@media (max-width: 768px) {
  header {
    padding: 1rem clamp(3%, 5vw, 2.688rem) 1rem clamp(3%, 5vw, 3.125rem);
  }
}
</style>
