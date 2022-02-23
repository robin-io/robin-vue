<template>
  <div class="robin-container">
    <transition name="robin-fadeIn">
      <RSideContainer v-show="(!isPageLoading && !conversationOpened && screenWidth <= 1200) || (conversationOpened && screenWidth > 1200) || (!conversationOpened && screenWidth > 1200)" :user_token="userToken" :key="key" />
    </transition>
    <transition name="robin-fadeIn">
      <RGroupMessageContainer v-show="(!isPageLoading && conversationOpened && screenWidth > 1200 && !messageProfileOpen) || (!isPageLoading && conversationOpened && screenWidth <= 1200 && !messageProfileOpen) || (!isPageLoading && conversationOpened && screenWidth > 1200 && messageProfileOpen)" :key="key" />
    </transition>
    <RNoMessageSelected v-show="!isPageLoading && !conversationOpened" />
    <RPageLoader v-show="isPageLoading && pageLoader" />
    <MessageImagePreviewer ref="popup-1" :conversation="currentConversation" v-show="imagePreviewOpen" @close="closeImagePreview()" :images-to-preview="imagesToPreview" />
    <Profile ref="popup-2" v-show="messageProfileOpen" @close="closeMessageProfile()" :key="profileKey" />
    <GroupPrompt v-show="groupPromptOpen" @close="closeGroupPrompt()" />
    <EncryptionDetails v-show="encryptionDetailsOpen" @close="closeEncryptionDetails()" />
    <audio :src="assets['notification']" ref="notification">Your browser does not support the</audio>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import RSideContainer from './components/ChatList/RSideContainer/RSideContainer.vue'
import RGroupMessageContainer from './components/Message/RGroupMessageContainer/RGroupMessageContainer.vue'
import RNoMessageSelected from './components/Message/RNoMessageSelected.vue'
import RPageLoader from './components/RPageLoader.vue'
import MessageImagePreviewer from './components/Message/MessageImagePreviewer/MessageImagePreviewer.vue'
import Profile from './components/Message/ViewMessageProfile/Profile.vue'
import GroupPrompt from './components/Message/ViewMessageProfile/GroupPrompt.vue'
import EncryptionDetails from './components/Message/ViewMessageProfile/EncryptionDetails.vue'
import Component from 'vue-class-component'
import store from './store/index'
import { Robin } from 'robin.io-js'
import EventBus from './event-bus'
import assets from '@/utils/assets.json'

const ComponentProps = Vue.extend({
  props: {
    userToken: {
      type: String as PropType<string>,
      default: 'lYcofFsZtJOZWgHtpgjvhHhR'
    },
    apiKey: {
      type: String as PropType<string>,
      default: 'NT-XmIzEmWUlsrQYypZOFRlogDFvQUsaEuxMfZf'
    },
    pageLoader: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    channel: {
      type: String as PropType<string>,
      default: 'private_chat'
    },
    userName: {
      type: String as PropType<string>,
      default: 'Elvis Chuks'
    },
    users: {
      type: Array as PropType<Array<any>>,
      default: (): Array<any> => [
        {
          userToken: 'lYcofFsZtJOZWgHtpgjvhHhR',
          profileImage: '',
          userName: 'Elvis Chuks'
        },
        {
          userToken: 'jnEyRcqxrILegQPDsEflVTcZ',
          profileImage: '',
          userName: 'Enoch Chejieh'
        }
      ]
    },
    keys: {
      type: Object as PropType<any>,
      default: (): any => {
        return {
          userToken: 'userToken',
          userName: 'userName',
          profileImage: 'profileImage'
        }
      }
    }
  }
})

// eslint-disable-next-line
@Component<App>({
  name: 'RobinChatContainer',
  components: {
    RSideContainer,
    RGroupMessageContainer,
    RPageLoader,
    RNoMessageSelected,
    MessageImagePreviewer,
    Profile,
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
      handler (val) {
        this.profileKey += 1
      }
    }
  }
})
export default class App extends ComponentProps {
  robin = null as any
  conn = null as any
  conversationOpened = false as boolean
  key = 0 as number
  profileKey = 0 as number
  screenWidth = 0 as number

  created (): void {
    this.filterUsers()
    this.initiateRobin()

    this.openConversation()
    this.onGroupConversationCreated()
    this.onExitGroup()
    this.onExitMessage()

    if (this.conn) {
      this.conn.onopen = () => {
        console.log('opened')
        this.robin.subscribe(this.channel, this.conn)
      }

      this.conn.onclosed = () => {
        console.log('closed')
        this.connect()
      }
    }
  }

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
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

  get messageProfileOpen () {
    return store.state.messageProfileOpen
  }

  get groupPromptOpen () {
    return store.state.groupPromptOpen
  }

  initiateRobin () {
    this.robin = new Robin(this.apiKey, true)
    this.connect()
    this.setPrototypes()
  }

  // async createUserToken () {
  //   const userToken = {
  //     user_token: '',
  //     meta_data: {
  //       userToken: 'BLAaUGurGvTewxIGKKrVANhn',
  //       userName: 'Enoch Chejieh',
  //       profileImage: ''
  //     },
  //     support_name: '',
  //     support_id: ''
  //   }
  //   const response = await this.$robin.createUserToken(userToken)

  //   console.log(response)
  // }

  filterUsers (): void {
    const filteredUsers: Array<any> = []
    this.users.forEach((user) => {
      if (user.user_token !== this.userToken) {
        const newUser = {
          userToken: user[this.keys?.userToken],
          profileImage: user[this.keys?.profileImage],
          userName: user[this.keys?.userName]
        }
        filteredUsers.push(newUser)
      }
    })

    Vue.prototype.$robin_users = filteredUsers
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
  }

  connect () {
    this.conn = this.robin.connect(this.userToken)

    this.conn.onmessage = (evt: any) => {
      const notification = this.$refs.notification as any

      const message = JSON.parse(evt.data)
      // console.log(message)
      if (message.is_event !== true) {
        EventBus.$emit('new-message', message)
        if (message.content.receiver_token === this.$user_token) notification.play()
      } else {
        // console.log(message)
        // move new conversation to the top
        // console.log('new conversation')
        // EventBus.$emit('new-conversation', message)

        // check event type

        // if (message.name == "new.conversation") {
        //   EventBus.$emit('new.conversation', message.value)
        // }
        this.handleEvents(message)
      }
    }

    const WebSocket: WebSocket = this.conn

    window.onbeforeunload = function () {
      WebSocket.close()
    }

    Vue.prototype.$conn = this.conn
  }

  openConversation (): void {
    EventBus.$on('open-conversation', () => {
      this.conversationOpened = true
    })
  }

  onGroupConversationCreated (): void {
    EventBus.$on('new-group.conversation', (conversation: object) => {
      // this.conversationOpened = true
    })
  }

  handleEvents (message: any): void {
    console.log('event->', message)
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
        // console.log('forwarded message', message.value)
        break
      case 'message.reaction':
        EventBus.$emit('message.reaction', message.value)
        break
      case 'message.remove.reaction':
        EventBus.$emit('message.remove.reaction', message.value)
        break
      case 'read.reciept':
        EventBus.$emit('read.reciept', message.value)
        break
      case 'group.icon.update':
        EventBus.$emit('group.icon.update', message.value)
        break
      default:
        // console.log('cannot handle event')
        break
    }
  }

  onExitGroup () {
    EventBus.$on('left.group', () => {
      this.key += 1
      this.conversationOpened = false
    })
  }

  onExitMessage () {
    EventBus.$on('left.message', () => {
      this.conversationOpened = false
    })
  }

  onResize () {
    this.screenWidth = window.innerWidth
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

  closeMessageProfile (): void {
    const popup = this.$refs['popup-2'] as any
    popup.$refs['popup-body'].classList.remove('robin-slideInRight')
    popup.$refs['popup-body'].classList.add('robin-slideOutRight')

    window.setTimeout(() => {
      popup.$refs['popup-body'].classList.remove('robin-slideOutRight')
      popup.$refs['popup-body'].classList.add('robin-slideInRight')

      store.setState('messageProfileOpen', false)
    }, 100)
  }

  closeGroupPrompt (): void {
    store.setState('groupPromptOpen', false)
  }

  closeEncryptionDetails (): void {
    store.setState('encryptionDetailsOpen', false)
  }
}
</script>

<style>
.robin-container {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
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
  scroll-behavior: smooth !important;
}
</style>
