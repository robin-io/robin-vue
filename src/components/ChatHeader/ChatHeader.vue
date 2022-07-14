<template>
  <header>
    <div class="robin-card-container robin-flex robin-flex-align-center" v-show="!selectMessagesOpen">
      <IconButton name="back" :to-emit="true" :to-click-away="false" emit="clicked" v-show="screenWidth <= 1200" @clicked="back()" />

      <div class="robin-flex robin-flex-align-center robin-clickable" @click="openProfile()">
        <div class="robin-card-info robin-mr-8">
          <GroupAvatar v-if="conversation.is_group" :img-url="conversation.group_icon" />

          <Avatar :key="avatarKey" :robin-users="$robin_users" v-else :status="conversation.status" :sender-token="conversation.sender_token === $user_token ? conversation.receiver_token : conversation.sender_token" />
        </div>

        <div class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-flex-1">
          <div class="robin-mt-6">
            <Content font-weight="normal" color="#000000" :font-size="14" :line-height="24" v-if="!conversation.is_group">
              {{ conversation.sender_token != $user_token ? conversation.sender_name : conversation.receiver_name }}
            </Content>

            <Content font-weight="normal" color="#000000" :font-size="14" :line-height="24" v-else>
              {{ conversation.name }}
            </Content>
          </div>

          <div class="robin-mt-6">
            <!-- <Content v-show="!conversation.is_group" as="p" font-weight="normal" color="#8D9091" :font-size="12" :line-height="14">{{ conversation.status == 'online' ? 'Online' : 'Offline' }}</Content> -->
          </div>
        </div>
      </div>
    </div>

    <div class="robin-flex robin-robin-flex-align-center" v-show="(selectMessagesOpen && isForwardMessagesEnabled) || (selectMessagesOpen && isDeleteMessagesEnabled) || (isForwardMessagesEnabled && isDeleteMessagesEnabled && selectMessagesOpen)">
      <IconButton name="remove" :to-emit="true" :to-click-away="false" emit="close" @close="cancelSelect()" />

      <Button color="#000" class="robin-ml-5" emit="clicked" @clicked="cancelSelect()">Select Messages</Button>
    </div>

    <IconButton name="trash" :to-emit="true" :to-click-away="false" emit="delete" @delete="deleteSelectedMessages()" class="robin-ml-auto" data-testid="delete-button" v-if="(selectMessagesOpen && isDeleteMessagesEnabled) && selectedMessages.length > 0" />

    <div class="robin-options robin-ml-auto" @click="handleOpenPopUp($event, conversation.is_group ? 'popup-1' : 'popup-2')" v-show="!selectMessagesOpen">
      <IconButton @clickoutside="handleClosePopUp(conversation.is_group ? 'popup-1' : 'popup-2')" :to-click-away="true" :to-emit="false" name="openModalDot" />

      <div class="robin-popup-container" ref="popup-container" v-show="popUpState.opened && !selectMessagesOpen">
        <GroupMessagePopOver ref="popup-1" v-show="conversation.is_group" @view-group-profile="openProfile()" />

        <PersonalMessagePopOver ref="popup-2" v-show="!conversation.is_group" @view-profile="openProfile()" />
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import IconButton from '@/components/IconButton/IconButton.vue'
import GroupAvatar from '@/components/GroupAvatar/GroupAvatar.vue'
import Avatar from '@/components/Avatar/Avatar.vue'
import Content from '@/components/Content/Content.vue'
import Button from '@/components/Button/Button.vue'
import OptionButton from '../OptionButton/OptionButton.vue'
import GroupMessagePopOver from '../GroupMessagePopOver/GroupMessagePopOver.vue'
import PersonalMessagePopOver from '../PersonalMessagePopOver/PersonalMessagePopOver.vue'
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

// eslint-disable-next-line
@Component<ChatHeader>({
  name: 'ChatHeader',
  components: {
    IconButton,
    GroupAvatar,
    Content,
    Button,
    OptionButton,
    Avatar,
    GroupMessagePopOver,
    PersonalMessagePopOver
  },
  watch: {
    $robin_users: {
      handler (val) {
        this.avatarKey += 1
      }
    }
  }
})
export default class ChatHeader extends ComponentProps {
  screenWidth = 0 as number
  avatarKey = 0 as number
  // messageViewProfileCloseCount = 0

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

  get profileOpen () {
    return store.state.profileOpen
  }

  get selectMessagesOpen () {
    return store.state.selectMessagesOpen
  }

  get isDeleteMessagesEnabled () {
    return store.state.deleteMessagesEnabled
  }

  get isForwardMessagesEnabled () {
    return store.state.forwardMessagesEnabled
  }

  handleOpenPopUp (event: any, refKey: string): void {
    const popupContainer = this.$refs['popup-container'] as any
    const popup = this.$refs[refKey] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomOut')

    if (!this.profileOpen) {
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

  openProfile () {
    store.setState('profileOpen', true)
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
  padding: 1rem clamp(3%, 5vw, 2.688rem) 1rem clamp(3%, 5vw, 3.125rem);
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
