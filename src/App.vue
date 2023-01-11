<template>
  <div class="robin-container">
    <transition name="robin-fadeIn">
      <side-container v-show="isSideContainerOpen" :key="key">
        <template #chat-list-header>
          <slot name="chat-list-header"></slot>
        </template>
      </side-container>
    </transition>
    <transition name="robin-fadeIn">
      <message-container v-show="isMessageContainerOpen" :key="key + 1" />
    </transition>
    <PageLoader v-if="isPageLoading && pageLoader" />
    <photo-previewer
      ref="popup-1"
      :conversation="currentConversation"
      v-show="imagePreviewOpen"
      @close="closeImagePreview()"
      :images-to-preview="imagesToPreview"
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
import SideContainer from './components/SideContainer/SideContainer.vue'
import MessageContainer from './components/MessageContainer/MessageContainer.vue'
import PageLoader from './components/PageLoader/PageLoader.vue'
import PhotoPreviewer from './components/PhotoPreviewer/PhotoPreviewer.vue'
import ViewProfile from './components/ViewProfile/ViewProfile.vue'
import GroupPrompt from './components/GroupPrompt/GroupPrompt.vue'
import EncryptionDetails from './components/EncrytionDetails/EncryptionDetails.vue'
import debounce from 'lodash.debounce'
import Component from 'vue-class-component'
import store from './store/index'
import { Robin } from './utils/robin'
import EventBus from './event-bus'
import assets from '@/utils/assets.json'

const ComponentProps = Vue.extend({
  props: {
    userToken: {
      type: String as PropType<string>,
      default: 'OykUCsrYJddWcJsDfHDQKKop'
    },
    apiKey: {
      type: String as PropType<string>,
      default: 'NT-XmIzEmWUlsrQYypZOFRlogDFvQUsaEuxMfZf'
    },
    pageLoader: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    channel: {
      type: String as PropType<string>,
      default: 'private_chat'
    },
    userName: {
      type: String as PropType<string>,
      default: 'Enoch Chejieh'
    },
    users: {
      type: Array as PropType<Array<ObjectType>>,
      default: (): Array<ObjectType> => [{
        _id: '621436282dc9a4e040d741bb',
        created_at: '2022-02-22T01:02:32.517Z',
        updated_at: '2022-02-22T01:02:32.517Z',
        fullname: 'Testing Tester',
        user_token: 'dhkogzyIxbAQwFnKDNTfAKOU',
        password: '$2a$14$ynUAMEo0StZa7FnbipS6l.qgAObpZJL.SkvXXVKjRalPKTK0Y51ce',
        profile_image: '',
        email: 'testingtester@gmail.com'
      }]
    },
    logo: {
      type: String as PropType<string>,
      default: ''
    },
    features: {
      type: Array as PropType<Array<string>>,
      default: () => ['create-chat', 'voice-recorder', 'reply-messages', 'delete-messages', 'forward-messages', 'message-reaction.view', 'message-reaction.delete', 'archive-chat']
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
    },
    time: {
      handler () {
        if (this.time === 9) {
          this.resetStopWatch()
        }
      }
    },
    conversationOpen: {
      handler () {
        // console.log(this.conversationOpen)
      }
    }
  }
})
export default class App extends ComponentProps {
  robin = null as Robin | null
  conn = null as any
  key = 0 as number
  messageEvent = null as any
  time = 0 as number
  notification = null as HTMLElement | null
  debouncedConnect = null as null | (() => void)

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

    setInterval(() => {
      this.time += 1
    }, 60000)

    this.checkCredentialAvailability()

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

  get sideBarType () {
    return store.state.sideBarType
  }

  get screenWidth () {
    return store.state.screenWidth
  }

  get conversationOpen () {
    return store.state.conversationOpen
  }

  get isPageLoading () {
    return store.state.isPageLoading
  }

  get assets (): any {
    return assets
  }

  get currentConversation () {
    return store.state.currentConversation
  }

  get encryptionDetailsOpen () {
    return store.state.encryptionDetailsOpen
  }

  get imagesToPreview () {
    return store.state.imagesToPreview
  }

  get imagePreviewOpen () {
    return store.state.imagePreviewOpen
  }

  get profileOpen () {
    return store.state.profileOpen
  }

  get groupPromptOpen () {
    return store.state.groupPromptOpen
  }

  get showDefaultProfileDetails () {
    return store.state.useDefaultProfileDetails
  }

  get currentTheme () {
    return store.state.currentTheme
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

  initiateRobin () {
    this.robin = new Robin(this.apiKey, true, 0, 'production')
    this.debouncedConnect = debounce(() => this.connect(), 5000)
    this.debouncedConnect?.()
    this.setPrototypes()
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

    Vue.prototype.$robin_users = [...filteredUsers]
    this.refresh()
  }

  setPrototypes () {
    Vue.prototype.$robin = this.robin
    Vue.prototype.$apiKey = this.apiKey
    Vue.prototype.$user_token = this.userToken
    Vue.prototype.$channel = this.channel
    Vue.prototype.$senderName = this.userName
    Vue.prototype.$logo = this.logo
  }

  connect () {
    this.conn = this.robin?.connect(this.userToken)

    this.conn.onopen = (event: ObjectType) => {
      if (event.target.readyState > 1) {
        this.$toast.open({ message: 'Connecting...', type: 'info', position: 'bottom-left' })
        store.setState('connected', false)
      } else {
        this.$toast.open({ message: 'Connected', type: 'success', position: 'bottom-left' })
        store.setState('connected', true)
      }

      this.robin?.subscribe(this.channel, this.conn)
    }

    this.conn.onclose = (event: ObjectType) => {
      if (event.code === 1000) this.debouncedConnect?.()
    }

    this.conn.onmessage = (evt: any) => {
      const message = JSON.parse(evt.data)

      if (message.is_event !== true) {
        EventBus.$emit('new-message', message)
        this.messageEvent = message

        if (this.notification) {
          this.notification.click()
        }
      } else {
        this.handleEvents(message)
      }

      this.resetStopWatch()
    }

    const WebSocket: WebSocket = this.conn

    window.onbeforeunload = function () {
      WebSocket.close()
    }

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

  handleEvents (message: any): void {
    console.log(message)
    switch (message.name) {
      case 'user.connect':
        // set user status to online
        // check conversations(dms)
        // if this.$userToken != message.value
        // check if reciever_token or sender_token == message.value
        // set the conversation.status as online
        EventBus.$emit('user.connect', message.value)
        break
      case 'user.disconnect':
        // set user status to offline

        // check conversations(dms)
        // if this.$userToken != message.value
        // check if reciever_token or sender_token == message.value
        // set the conversation.status as offline
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
      this.refresh()
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

  refresh () {
    this.key += 1
  }

  resetStopWatch (): void {
    this.time = 0
  }

  checkCredentialAvailability (): void {
    const missingProperties = []
    if (!this.userName) missingProperties.push('Username')
    if (!this.userToken) missingProperties.push('UserToken')
    if (!this.apiKey) missingProperties.push('ApiKey')

    if (missingProperties.length) {
      const message = `Please make sure your ${missingProperties.join(', ')} ${missingProperties.length > 1 ? 'are' : 'is'} set.`
      this.$toast.open({ message, type: 'error', position: 'bottom-left' })
    }
  }

  handleConnectionStatus () {
    window.addEventListener('offline', this.handleConnectionChange)
    window.addEventListener('online', this.handleConnectionChange)
  }

  handleConnectionChange (event: Event) {
    console.log(event)
    if (event.type === 'offline') {
      this.$toast.open({ message: 'Connecting...', type: 'info', position: 'bottom-left' })
      store.setState('connected', false)
    } else {
      this.$toast.open({
        message: 'Connected',
        type: 'success',
        position: 'bottom-left',
        duration: 6000
      })
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
