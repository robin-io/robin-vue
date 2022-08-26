<template>
  <div class="robin-container">
    <transition name="robin-fadeIn">
      <SideContainer v-show="(!conversationOpened && screenWidth <= 1200) || (conversationOpened && screenWidth > 1200) || (!conversationOpened && screenWidth > 1200)" :key="key">
        <template #chat-list-header>
          <slot name="chat-list-header"></slot>
        </template>
      </SideContainer>
    </transition>
    <transition name="robin-fadeIn">
      <MessageContainer v-show="(!isPageLoading && conversationOpened && screenWidth > 1200 && !profileOpen) || (!isPageLoading && conversationOpened && screenWidth <= 1200 && !profileOpen) || (!isPageLoading && conversationOpened && screenWidth > 1200 && profileOpen)" :key="key + 1" />
    </transition>
    <NoMessageSelected v-if="!isPageLoading && !conversationOpened" />
    <PageLoader v-if="isPageLoading && pageLoader" />
    <MessageImagePreviewer ref="popup-1" :conversation="currentConversation" v-show="imagePreviewOpen" @close="closeImagePreview()" :images-to-preview="imagesToPreview" />
    <ViewProfile ref="popup-2" v-show="profileOpen && showDefaultProfileDetails" @close="closeMessageViewProfile()" />
    <slot name="profile-details" v-if="!showDefaultProfileDetails" :current-conversation="currentConversation"></slot>
    <GroupPrompt v-if="groupPromptOpen" />
    <EncryptionDetails v-if="encryptionDetailsOpen" />
    <audio :src="assets['notification']" ref="notification" @click="playAudio($event)">Your browser does not support the audio feature</audio>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import SideContainer from './components/SideContainer/SideContainer.vue'
import MessageContainer from './components/MessageContainer/MessageContainer.vue'
import NoMessageSelected from './components/NoMessageSelected/NoMessageSelected.vue'
import PageLoader from './components/PageLoader/PageLoader.vue'
import MessageImagePreviewer from './components/MessageImagePreviewer/MessageImagePreviewer.vue'
import ViewProfile from './components/ViewProfile/ViewProfile.vue'
import GroupPrompt from './components/GroupPrompt/GroupPrompt.vue'
import EncryptionDetails from './components/EncrytionDetails/EncryptionDetails.vue'
import Component from 'vue-class-component'
import store from './store/index'
import { Robin } from 'robin.io-js'
import EventBus from './event-bus'
import assets from '@/utils/assets.json'

const ComponentProps = Vue.extend({
  props: {
    userToken: {
      type: String as PropType<string>,
      default: '' // 'clpYwBMnDGdynSarEBZOuPWZ'
    },
    apiKey: {
      type: String as PropType<string>,
      default: '' // 'NT-XmIzEmWUlsrQYypZOFRlogDFvQUsaEuxMfZf'
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
      default: '' // 'Enoch Chejieh'
    },
    users: {
      type: Array as PropType<Array<any>>,
      default: (): Array<any> => [
        // {
        //   _id: '621436282dc9a4e040d741bb',
        //   created_at: '2022-02-22T01:02:32.517Z',
        //   updated_at: '2022-02-22T01:02:32.517Z',
        //   fullname: 'Testing Tester',
        //   user_token: 'GmStKZeaAzsYzxsdIlFvoJSa',
        //   password: '$2a$14$ynUAMEo0StZa7FnbipS6l.qgAObpZJL.SkvXXVKjRalPKTK0Y51ce',
        //   profile_image: '',
        //   email: 'testingtester@gmail.com'
        // }
      ]
    },
    logo: {
      type: String as PropType<string>,
      default: ''
    },
    features: {
      type: Array as PropType<Array<string>>,
      default: () => ['create-chat', 'voice-recorder']
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
    NoMessageSelected,
    MessageImagePreviewer,
    ViewProfile,
    GroupPrompt,
    EncryptionDetails
  },
  watch: {
    users: {
      handler (val) {
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
      handler (val) {
        if (this.time === 9) {
          this.connect()
          this.resetStopWatch()
        }
      }
    }
  }
})
export default class App extends ComponentProps {
  robin = null as Robin | null
  conn = null as any
  key = 0 as number
  screenWidth = 0 as number
  messageEvent = null as any
  time = 0 as number
  notification = null as HTMLElement | null

  created (): void {
    this.filterUsers()
    this.initiateRobin()

    this.openConversation()
    this.onGroupConversationCreated()
    this.onExitGroup()
    this.onExitMessage()
    this.onConversationDelete()
    this.openProfile()
    store.setState('forwardMessagesEnabled', this.features.includes('forward-messages'))
    store.setState('deleteMessagesEnabled', this.features.includes('delete-messages'))
    store.setState('archiveChatEnabled', this.features.includes('archive-chat'))
    store.setState('createChatEnabled', this.features.includes('create-chat'))
    store.setState('replyMessagesEnabled', this.features.includes('reply-messages'))
    store.setState('voiceRecorderEnabled', this.features.includes('voice-recorder'))
    store.setState('messageReactionViewEnabled', this.features.includes('message-reaction.view'))
    store.setState('messageReactionDeleteEnabled', this.features.includes('message-reaction.delete'))
    store.setState('useDefaultProfileDetails', this.useDefaultProfileDetails)
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
  }

  get conversationOpened () {
    return store.state.conversationOpened
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

  initiateRobin () {
    this.robin = new Robin(this.apiKey, true)
    this.connect()
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
  }

  setPrototypes () {
    Vue.prototype.$robin = this.robin
    Vue.prototype.$apiKey = this.apiKey
    Vue.prototype.$user_token = this.userToken
    Vue.prototype.$channel = this.channel
    Vue.prototype.$conversations = []
    Vue.prototype.$regularConversations = []
    Vue.prototype.$archivedConversations = []
    Vue.prototype.$senderName = this.userName
    Vue.prototype.$logo = this.logo
  }

  connect () {
    this.conn = this.robin?.connect(this.userToken)

    this.conn.onopen = () => {
      this.robin?.subscribe(this.channel, this.conn)
    }

    this.conn.onclose = () => {
      setTimeout(() => {
        this.connect()
      }, 2000)
    }

    this.conn.onmessage = (evt: any) => {
      this.conn.onclose = () => {
        setTimeout(() => {
          this.connect()
        }, 2000)
      }

      const message = JSON.parse(evt.data)
      console.log(message, evt)

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
      store.setState('conversationOpened', true)
    })
  }

  onGroupConversationCreated (): void {
    EventBus.$on('new-group.conversation', (conversation: object) => {
      // this.conversationOpened = true
    })
  }

  handleEvents (message: any): void {
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
        // loop through message.value
        // check if current conversation._id is equal to message.conversation_id
        // if it is, push message to message array
        // else update last_message and unshift
        EventBus.$emit('message.forward', message.value)
        // ('forwarded message', message.value)
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
      this.key += 1
      store.setState('conversationOpened', false)
      store.setState('profileOpen', false)
    })
  }

  onConversationDelete () {
    EventBus.$on('close-conversation', () => {
      store.setState('conversationOpened', false)
      store.setState('profileOpen', false)
    })
  }

  onExitMessage () {
    EventBus.$on('left.message', () => {
      store.setState('conversationOpened', false)
      store.setState('profileOpen', false)
    })
  }

  onResize () {
    this.screenWidth = window.innerWidth
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

  resetStopWatch (): void {
    this.time = 0
  }

  checkCredentialAvailability () {
    let centralPoint = ''

    if (this.userName === '' && this.userToken !== '' && this.apiKey !== '') {
      centralPoint = 'username'
    } else if (this.userName === '' && this.userToken === '' && this.apiKey !== '') {
      centralPoint = 'username and usertoken'
    } else if (this.userName === '' && this.userToken !== '' && this.apiKey === '') {
      centralPoint = 'api key and username'
    } else if (this.userName !== '' && this.userToken === '' && this.apiKey !== '') {
      centralPoint = 'usertoken'
    } else if (this.userName !== '' && this.userToken === '' && this.apiKey === '') {
      centralPoint = 'api key and usertoken'
    } else if (this.userName !== '' && this.userToken !== '' && this.apiKey === '') {
      centralPoint = 'api key'
    } else if (this.userName === '' && this.userToken === '' && this.apiKey === '') {
      centralPoint = 'api key, usertoken and username'
    }

    if (centralPoint !== '') {
      const message = `Please make sure your ${centralPoint} is set.`
      this.$toast.open({ message, type: 'error', position: 'bottom-left' })
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
  /* scroll-behavior: smooth !important; */
}
</style>
