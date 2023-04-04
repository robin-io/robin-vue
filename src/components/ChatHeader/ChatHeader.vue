<template>
  <header class="robin-chat-header">
    <div
      class="robin-card-container robin-flex robin-flex-align-center"
      v-show="!selectMessagesOpen"
    >
      <icon-button
        name="back"
        :to-emit="true"
        :to-click-away="false"
        emit="clicked"
        v-show="screenWidth <= 1200"
        @clicked="back()"
      />

      <div class="robin-flex robin-flex-align-center robin-clickable" @click="openProfile()">
        <div class="robin-card-info robin-mr-8">
          <group-avatar
            v-if="currentConversation.is_group"
            :img-url="currentConversation.group_icon"
          />

          <avatar
            :key="avatarKey"
            :img-url="getProfileImage(currentConversation) || currentConversation.display_photo"
            v-else
            :sender-token="
              currentConversation.sender_token === $user_token
                ? currentConversation.receiver_token
                : currentConversation.sender_token
            "
          />
        </div>

        <div
          class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-flex-1"
        >
          <div class="robin-mt-6">
            <message-content
              font-weight="normal"
              :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'"
              :font-size="14"
              :line-height="24"
              v-if="!currentConversation.is_group"
            >
              {{
                currentConversation.sender_token != $user_token
                  ? currentConversation.sender_name
                  : currentConversation.receiver_name
              }}
            </message-content>

            <message-content
              font-weight="normal"
              :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'"
              :font-size="14"
              :line-height="24"
              v-else
            >
              {{ currentConversation.name }}
            </message-content>
          </div>
        </div>
      </div>
    </div>

    <div
      class="robin-flex robin-robin-flex-align-center"
      v-show="
        (selectMessagesOpen && isForwardMessagesEnabled) ||
        (selectMessagesOpen && isDeleteMessagesEnabled) ||
        (isForwardMessagesEnabled && isDeleteMessagesEnabled && selectMessagesOpen)
      "
    >
      <icon-button
        name="remove"
        :to-emit="true"
        :to-click-away="false"
        emit="close"
        @close="cancelSelect()"
      />

      <message-content class="robin-ml-5" emit="clicked" @clicked="cancelSelect()"
        >Select Messages</message-content
      >
    </div>

    <icon-button
      name="trash"
      :to-emit="true"
      :to-click-away="false"
      emit="delete"
      @delete="deleteSelectedMessages()"
      class="robin-ml-auto"
      data-testid="delete-button"
      v-if="selectMessagesOpen && isDeleteMessagesEnabled && selectedMessages.length > 0"
    />

    <div
      class="robin-options robin-ml-auto"
      @click="handleOpenPopUp($event)"
      v-show="!selectMessagesOpen"
    >
      <icon-button
        @clickoutside="handleClosePopUp()"
        :to-click-away="true"
        :to-emit="false"
        name="openModalDot"
      />

      <div
        class="robin-popup-container"
        ref="popup-container"
        v-show="popUpState.opened && !selectMessagesOpen"
      >
        <chat-header-pop-up
          :is-group="currentConversation.is_group"
          @view-profile="openProfile()"
        />
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import store from '@/store/index'
import IconButton from '@/components/IconButton/IconButton.vue'
import GroupAvatar from '@/components/GroupAvatar/GroupAvatar.vue'
import Avatar from '@/components/Avatar/Avatar.vue'
import Content from '@/components/Content/Content.vue'
import Button from '@/components/Button/Button.vue'
import ChatHeaderPopUp from '../ChatHeaderPopUp/ChatHeaderPopUp.vue'
import EventBus from '@/event-bus'
import ConversationMixin from '@/mixins/conversation-mixins'

interface PopUpState {
  opened: boolean;
}

const ComponentProps = mixins(ConversationMixin).extend({
  props: {
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
    'message-content': Content,
    'custom-button': Button,
    Avatar,
    ChatHeaderPopUp
  },
  watch: {
    robinUsers: {
      handler () {
        this.avatarKey += 1
      }
    }
  }
})
export default class ChatHeader extends ComponentProps {
  avatarKey = 0 as number;
  screenWidth!: number;
  profileOpen!: boolean;
  showDefaultProfileDetails!: boolean;
  selectMessagesOpen!: boolean;
  isForwardMessagesEnabled!: boolean;
  isDeleteMessagesEnabled!: boolean;
  currentConversation!: ObjectType;
  currentTheme!: string;

  popUpState: PopUpState = {
    opened: false
  };

  created () {
    this.handleUserConnect()
    this.handleUserDisconnect()
  }

  handleOpenPopUp (event: ObjectType): void {
    const popupContainer = this.$refs['popup-container'] as HTMLElement
    const popup = document.getElementById('chat-header-popup') as HTMLElement
    popup.classList.remove('robin-zoomOut')

    if (!this.profileOpen) {
      popupContainer.style.right = Math.floor(event.clientX / 26) + 'px'
    } else {
      popupContainer.style.right = Math.floor(event.clientX / 2.47) + 'px'
    }

    this.popUpState.opened = true
  }

  handleClosePopUp (): void {
    const popup = document.getElementById('chat-header-popup') as HTMLElement
    popup.classList.remove('robin-zoomIn')
    popup.classList.add('robin-zoomOut')

    window.setTimeout(() => {
      popup.classList.add('robin-zoomIn')
      popup.classList.remove('robin-zoomOut')

      this.popUpState.opened = false
    }, 300)
  }

  handleUserConnect () {
    EventBus.$on('user.connect', (conversation: string) => {
      if (conversation !== this.$user_token) {
        this.currentConversation.status = 'online'
      }
    })
  }

  handleUserDisconnect () {
    EventBus.$on('user.disconnect', (conversation: string) => {
      if (conversation !== this.$user_token) {
        this.currentConversation.status = 'offline'
      }
    })
  }

  getProfileImage (conversation: ObjectType) {
    const index = this.$robin_users.findIndex(
      (user: any) => user.userToken === conversation.sender_token
    )

    return this.$robin_users[index] ? this.$robin_users[index].profileImage : null
  }

  openProfile () {
    if (this.showDefaultProfileDetails) {
      store.setState('profileOpen', true)
    } else {
      EventBus.$emit('open-profile')
    }
  }

  cancelSelect (): void {
    // this.setSelectMessagesOpen(false)
    store.setState('selectMessagesOpen', false)
  }

  deleteSelectedMessages () {
    this.$emit('delete-selected-messages')
  }

  back () {
    EventBus.$emit('left.message')
  }
}
</script>
