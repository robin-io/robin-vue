<template>
  <div class="robin-container">
    <transition name="robin-fadeIn">
      <side-container v-show="isSideContainerOpen">
        <template #chat-list-header>
          <slot name="chat-list-header"></slot>
        </template>
      </side-container>
    </transition>
    <transition name="robin-fadeIn">
      <message-container v-show="isMessageContainerOpen" />
    </transition>
    <PageLoader v-if="isPageLoading && pageLoader" />
    <photo-previewer
      ref="popup-1"
      :conversation="currentConversation"
      v-show="imagePreviewOpen"
      @close="closeImagePreview()"
    />
    <view-profile
      ref="popup-2"
      v-show="isProfileOpen && showDefaultProfileDetails"
      @close="closeMessageViewProfile()"
    />
    <slot
      name="profile-details"
      v-if="!showDefaultProfileDetails"
      :current-conversation="currentConversation"
    ></slot>
    <group-prompt v-if="groupPromptOpen" />
    <encryption-details v-if="encryptionDetailsOpen" />
    <audio :src="assets['notification']" ref="notification" @click="playAudio($event)">
      Your browser does not support the audio feature
    </audio>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component, { mixins } from 'vue-class-component'
import store from './store/index'
import { Robin } from 'robin.io-js'
import EventBus from './event-bus'
import SideContainer from './components/SideContainer/SideContainer.vue'
import MessageContainer from './components/MessageContainer/MessageContainer.vue'
import PageLoader from './components/PageLoader/PageLoader.vue'
import PhotoPreviewer from './components/PhotoPreviewer/PhotoPreviewer.vue'
import ViewProfile from './components/ViewProfile/ViewProfile.vue'
import GroupPrompt from './components/GroupPrompt/GroupPrompt.vue'
import EncryptionDetails from './components/EncrytionDetails/EncryptionDetails.vue'
import debounce from 'lodash.debounce'
import assets from '@/utils/assets.json'
import ConversationMixin from './mixins/conversation-mixins'

const ComponentProps = mixins(ConversationMixin).extend({
  props: {
    userToken: {
      type: String as PropType<string>,
      default: ''
    },
    apiKey: {
      type: String as PropType<string>,
      default: ''
    },
    pageLoader: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    channel: {
      type: String as PropType<string>,
      default: ''
    },
    userName: {
      type: String as PropType<string>,
      default: ''
    },
    secretKey: {
      type: String as PropType<string>,
      default: ''
    },
    users: {
      type: Array as PropType<Array<ObjectType>>,
      default: (): Array<ObjectType> => []
    },
    logo: {
      type: String as PropType<string>,
      default: ''
    },
    features: {
      type: Array as PropType<Array<string>>,
      default: () => [
        'create-chat',
        'voice-recorder',
        'reply-messages',
        'delete-messages',
        'forward-messages',
        'message-reaction.view',
        'message-reaction.delete',
        'archive-chat'
      ]
    },
    useDefaultProfileDetails: {
      type: Boolean,
      default: true
    },
    keys: {
      type: Object as PropType<any>,
      default: (): any => {
        return {
          userToken: 'user_token',
          userName: 'fullname',
          profileImage: 'profile_image'
        }
      }
    },
    imageUrl: {
      type: String as PropType<string>,
      default: ''
    }
  }
})

// eslint-disable-next-line
@Component<App>({
  name: 'RobinChatContainer',
  components: {
    SideContainer,
    MessageContainer,
    PageLoader,
    PhotoPreviewer,
    ViewProfile,
    GroupPrompt,
    EncryptionDetails
  },
  watch: {
    users: {
      handler () {
        this.filterUsers()
      },
      immediate: true
    },
    currentConversation: {
      handler () {
        this.closeMessageViewProfile()
      }
    }
  }
})
export default class App extends ComponentProps {
  robin = null as Robin | null
  conn = null as any
  messageEvent = null as any
  notification = null as HTMLElement | null
  debouncedConnect = null as null | (() => void)
  sideBarType!: string
  screenWidth!: number
  conversationOpen!: boolean
  profileOpen!: boolean
  currentTheme!: string
  showDefaultProfileDetails!: boolean
  groupPromptOpen!: boolean
  isMessageReactionDeleteEnabled!: boolean
  currentConversation!: ObjectType
  groupnameColors!: Array<string>
  imagePreviewOpen!: boolean
  showToast!: (message: string, info: string) => void
  isPageLoading!: boolean
  encryptionDetailsOpen!: boolean
  encryptionKey: string | undefined
  iv!: string
  encrypt!: (message: ObjectType) => string
  decrypt!: (message: string) => string

  created (): void {
    this.initiateRobin()
    this.filterUsers()
    this.openConversation()
    this.onGroupConversationCreated()
    this.onExitGroup()
    this.onExitMessage()
    this.onConversationDelete()
    this.openProfile()
    this.handleConnectionStatus()
  }

  beforeDestroy () {
    EventBus.$off()
    window.removeEventListener('offline', this.handleConnectionChange)
    window.removeEventListener('online', this.handleConnectionChange)
    window.removeEventListener('resize', this.onResize)
  }

  mounted () {
    this.notification = this.$refs.notification as HTMLElement

    this.$nextTick(function () {
      this.onResize()
    })

    window.addEventListener('resize', this.onResize)

    this.checkCredentialAvailability()

    this.handleVisibilityChange()

    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)')

    matchMedia.addEventListener('change', this.getCurrentTheme)

    this.getCurrentTheme(matchMedia)
  }

  beforeUnmount () {
    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)')

    matchMedia.removeEventListener('change', this.getCurrentTheme)
  }

  get isProfileOpen () {
    if (this.screenWidth > 1200) {
      if (this.profileOpen) return true
    } else {
      if (this.profileOpen && this.sideBarType === 'newgroupchat') return false
    }

    return this.profileOpen
  }

  get isSideContainerOpen () {
    if (this.screenWidth > 1200) {
      return true
    } else {
      if (!this.conversationOpen) {
        return true
      }

      if (this.sideBarType === 'newgroupchat') {
        return true
      }
    }

    return false
  }

  get isMessageContainerOpen () {
    if (this.screenWidth > 1200) {
      if (this.conversationOpen) {
        return true
      }
    } else {
      if (!this.profileOpen) {
        if (this.conversationOpen) {
          return true
        }
      }
    }

    return false
  }

  get assets (): any {
    return assets
  }

  getCurrentTheme (event: Record<string, any>) {
    store.setState('currentTheme', event.matches ? 'dark' : 'light')

    const root = document.documentElement

    if (this.currentTheme === 'dark') {
      root.className = 'robin-dark'
    } else {
      root.className = 'robin-light'
    }
  }

  filterUsers (): void {
    const filteredUsers: Array<any> = []
    this.users.forEach((user) => {
      const newUser = {
        userToken: user[this.keys?.userToken],
        profileImage: user[this.keys?.profileImage],
        userName: user[this.keys?.userName]
      }
      filteredUsers.push(newUser)
    })

    this.$robin_users = [...filteredUsers]
  }

  setPrototypes () {
    Vue.prototype.$robin = this.robin
    Vue.prototype.$apiKey = this.apiKey
    Vue.prototype.$user_token = this.userToken
    Vue.prototype.$channel = this.channel
    Vue.prototype.$senderName = this.userName
    Vue.prototype.$logo = this.logo
    store.setState('forwardMessagesEnabled', this.features.includes('forward-messages'))
    store.setState('deleteMessagesEnabled', this.features.includes('delete-messages'))
    store.setState('archiveChatEnabled', this.features.includes('archive-chat'))
    store.setState('createChatEnabled', this.features.includes('create-chat'))
    store.setState('replyMessagesEnabled', this.features.includes('reply-messages'))
    store.setState('voiceRecorderEnabled', this.features.includes('voice-recorder'))
    store.setState('messageReactionViewEnabled', this.features.includes('message-reaction.view'))
    store.setState(
      'messageReactionDeleteEnabled',
      this.features.includes('message-reaction.delete')
    )
    store.setState('useDefaultProfileDetails', this.useDefaultProfileDetails)
    store.setState('secretKey', this.secretKey)
  }

  initiateRobin () {
    this.robin = new Robin(this.apiKey, true, 0, 'production')
    this.debouncedConnect = debounce(() => this.connect(), 3000)
    this.debouncedConnect?.()
    this.setPrototypes()
  }

  handleVisibilityChange () {
    let hidden = 'hidden'
    let visibilityChange = 'visibilitychange'
    const documentElement = document as any

    if (typeof documentElement.msHidden !== 'undefined') {
      hidden = 'msHidden'
      visibilityChange = 'msvisibilitychange'
    } else if (typeof documentElement.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden'
      visibilityChange = 'webkitvisibilitychange'
    }

    documentElement.addEventListener(
      visibilityChange,
      () => {
        if (!documentElement[hidden]) {
          if (this.conn.readyState === WebSocket.OPEN) {
            this.conn.close(1000, 'Client closed connection')
          }
        }
      },
      false
    )
  }

  connect () {
    this.conn = this.robin?.connect(this.userToken)

    this.conn.onopen = (event: ObjectType) => {
      if (event.target.readyState > 1) {
        this.showToast('Reconnecting', 'info')
        store.setState('connected', false)
      } else {
        this.showToast('Connected', 'success')
        store.setState('connected', true)
      }

      const msg = this.encrypt({
        type: 0,
        channel: this.channel,
        content: {},
        conversation_id: ''
      })

      this.robin?.subscribe(msg, this.conn)
    }

    this.conn.onclose = (event: ObjectType) => {
      // this.showToast('Disconnected', 'error')
      // Websocket closed abnormally.
      if (event.code !== 1000) {
        // this.showToast('Reconnecting', 'info')
        this.debouncedConnect?.()
      } else {
        this.connect()
      }
    }

    this.conn.onmessage = (evt: any) => {
      const message = JSON.parse(this.decrypt(evt.data))

      if (message.is_event !== true) {
        EventBus.$emit('new-message', message)
        this.messageEvent = message

        if (this.notification) {
          this.notification.click()
        }
      } else {
        this.handleEvents(message)
      }
    }

    const WebSocket: WebSocket = this.conn

    window.addEventListener('beforeunload', () => {
      if (this.conn.readyState === WebSocket.OPEN) {
        this.conn.close(1000, 'Client closed connection')
      }
    })

    Vue.prototype.$conn = this.conn
  }

  openConversation (): void {
    EventBus.$on('open-conversation', () => {
      store.setState('conversationOpen', true)
    })
  }

  onGroupConversationCreated (): void {
    EventBus.$on('new-group.conversation', () => {
      // this.conversationOpen = true
    })
  }

  handleEvents (message: ObjectType): void {
    switch (message.name) {
      case 'user.connect':
        EventBus.$emit('user.connect', message.value)
        break
      case 'user.disconnect':
        EventBus.$emit('user.disconnect', message.value)
        break
      case 'new.conversation':
        if (message.value.is_group) {
          EventBus.$emit('new-group.conversation', message.value)
        } else {
          EventBus.$emit('new.conversation', message.value)
        }
        break
      case 'message.forward':
        EventBus.$emit('message.forward', message.value)
        break
      case 'message.reaction':
        EventBus.$emit('message.reaction', message.value)
        break
      case 'message.remove.reaction':
        EventBus.$emit('message.remove.reaction', message.value)
        break
      case 'remove.group.participant':
        EventBus.$emit('remove.group.participant', message.value)
        break
      case 'read.reciept':
        EventBus.$emit('read.reciept', message.value)
        break
      case 'group.icon.update':
        EventBus.$emit('group.icon.update', message.value)
        break
      default:
        break
    }
  }

  onExitGroup () {
    EventBus.$on('left.group', () => {
      store.setState('conversationOpen', false)
      store.setState('profileOpen', false)
    })
  }

  onConversationDelete () {
    EventBus.$on('close-conversation', () => {
      store.setState('conversationOpen', false)
      store.setState('profileOpen', false)
    })
  }

  onExitMessage () {
    EventBus.$on('left.message', () => {
      store.setState('conversationOpen', false)
      store.setState('profileOpen', false)
      store.setState('currentConversation', {})
    })
  }

  onResize () {
    store.setState('screenWidth', window.innerWidth)
  }

  openProfile () {
    EventBus.$on('open-profile', () => {
      this.$emit('open-profile')
    })
  }

  closeImagePreview (): void {
    const popup = this.$refs['popup-1'] as any
    popup.$refs['popup-body'].classList.remove('robin-squeezeOut')
    popup.$refs['popup-body'].classList.add('robin-squeezeIn')

    window.setTimeout(() => {
      popup.$refs['popup-body'].classList.remove('robin-squeezeIn')
      popup.$refs['popup-body'].classList.add('robin-squeezeOut')

      store.setState('imagePreviewOpen', false)
      store.setState('imagesToPreview', [])
    }, 100)
  }

  closeMessageViewProfile (): void {
    const popup = this.$refs['popup-2'] as any
    popup.$refs['popup-body'].classList.remove('robin-slideInRight')
    popup.$refs['popup-body'].classList.add('robin-slideOutRight')

    window.setTimeout(() => {
      popup.$refs['popup-body'].classList.remove('robin-slideOutRight')
      popup.$refs['popup-body'].classList.add('robin-slideInRight')

      store.setState('profileOpen', false)
    }, 100)
  }

  playAudio (event: any): void {
    if (this.messageEvent) {
      if (this.messageEvent.content.receiver_token === this.$user_token) {
        event.target.play()
      }
    }
  }

  checkCredentialAvailability (): void {
    const missingProperties = []
    if (this.userName === '') missingProperties.push('Username')
    if (this.userToken === '') missingProperties.push('UserToken')
    if (this.apiKey === '') missingProperties.push('ApiKey')
    if (this.secretKey === '') missingProperties.push('SecretKey')

    if (missingProperties.length) {
      const message = `Please make sure your ${missingProperties.join(', ')} ${
        missingProperties.length > 1 ? 'are' : 'is'
      } set.`
      this.showToast(message, 'error')
    }
  }

  handleConnectionStatus () {
    window.addEventListener('offline', this.handleConnectionChange)
    window.addEventListener('online', this.handleConnectionChange)
  }

  handleConnectionChange (event: Event) {
    if (event.type === 'offline') {
      this.showToast('Reconnecting', 'info')
      store.setState('connected', false)
    } else {
      this.showToast('Connected', 'success')
    }
  }
}
</script>

<style>
.robin-container {
  margin: 0;
  padding: 0;
  width: 100vw;
  /* height: 100vh; */
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  overflow: hidden;
  transition: 100ms;
  background-color: var(--rb-bg-color);
}

.robin-container img {
  max-width: 100%;
}

.robin-container *,
.robin-container *::before,
.robin-container *::after {
  -webkit-tap-highlight-color: transparent;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Hanken Sans', sans-serif;
  font-kerning: normal;
  -moz-font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  -ms-font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  -webkit-font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media (min-width: 768px) {
  .robin-container ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  .robin-container ::-webkit-scrollbar-track {
    border-radius: 24px;
  }

  .robin-container ::-webkit-scrollbar-thumb {
    width: 2px;
    background-color: #d6d6d6;
    border-radius: 24px;
    -webkit-border-radius: 24px;
    -moz-border-radius: 24px;
    -ms-border-radius: 24px;
    -o-border-radius: 24px;
  }
}
</style>
