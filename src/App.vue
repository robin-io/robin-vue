<template>
  <div class="robin-container">
    <transition name="robin-fadeIn">
      <RSideContainer v-show="(!isPageLoading && !conversationOpened && screenWidth <= 1200) || (conversationOpened && screenWidth > 1200) || (!conversationOpened && screenWidth > 1200)" :user_token="userToken" :key="key" />
    </transition>
    <transition name="robin-fadeIn">
      <RGroupMessageContainer v-show="!isPageLoading && conversationOpened" :key="key" />
    </transition>
    <RNoMessageSelected v-show="!isPageLoading && !conversationOpened" />
    <RPageLoader v-show="isPageLoading && pageLoader" />
    <MessageImagePreviewer ref="popup-1" :conversation="currentConversation" v-show="imagePreviewOpen" @close="closeImagePreview()" :images-to-preview="imagesToPreview" />
    <ViewMessageProfile ref="popup-2" v-show="viewMessageProfileOpen" @close="closeMessageProfile()" />
    <audio src="@/assets/notification.wav" ref="notification">Your browser does not support the</audio>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import RSideContainer from './components/ChatList/RSideContainer/RSideContainer.vue'
import RGroupMessageContainer from './components/Message/RGroupMessageContainer/RGroupMessageContainer.vue'
import RNoMessageSelected from './components/Message/RNoMessageSelected.vue'
import RPageLoader from './components/RPageLoader.vue'
import MessageImagePreviewer from './components/Message/MessageImagePreviewer/MessageImagePreviewer.vue'
import ViewMessageProfile from './components/Message/ViewMessageProfile/ViewMessageProfile.vue'
import Component from 'vue-class-component'
import store from './store/index'
import { Robin } from 'robin.io-js'
import EventBus from './event-bus'

const ComponentProps = Vue.extend({
  props: {
    userToken: {
      type: String as PropType<string>,
      default: 'JUevyXRRpyLNwzyGAStMSrXR'
    },
    apiKey: {
      type: String as PropType<string>,
      default: 'NT-npUbpwzapYoTUtHSufMWQkNNnZePbqqFycjb'
    },
    pageLoader: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    channel: {
      type: String as PropType<string>,
      default: 'robin-chat'
    },
    userName: {
      type: String as PropType<string>,
      default: ''
    },
    users: {
      type: Array as PropType<Array<any>>,
      default: (): Array<any> => [
        {
          userToken: 'BLAaUGurGvTewxIGKKrVANhn',
          profileImage: '',
          userName: 'Enoch Chejieh'
        },
        {
          userToken: 'yfqjnGHHdAvWKuhCPlOnNkVb',
          profileImage: '',
          userName: 'bashir raji'
        },
        {
          userToken: 'dphuBiRIetIJdYAoLWRiboKG',
          profileImage: '',
          userName: 'Michael Scoffield'
        },
        {
          userToken: 'aHsvPTEBBZBKFIjojMTlEAUL',
          profileImage: '',
          userName: 'Temitope Akinlabi'
        },
        {
          userToken: 'xfnAYadpvypqBlvrOoHVKAfK',
          profileImage: '',
          userName: 'Ayo O'
        },
        {
          userToken: 'vSeEXsbjrxxBkzFdJxwtojoI',
          profileImage: '',
          userName: 'Precious Ogar'
        },
        {
          userToken: 'UOjTEiQIKLZyhYVjzUtVVOfO',
          profileImage: '',
          userName: 'Precious Ogar'
        },
        {
          userToken: 'lxDWlFTOQejJDxtITnhRIEKb',
          profileImage: '',
          userName: 'UBONG JIMMY'
        },
        {
          userToken: 'urPBzlbXneOmjKEGgozhAVNg',
          profileImage: '',
          userName: 'chidinma'
        },
        {
          userToken: 'BRLEgGMRtuluSwhKQkMUSixn',
          profileImage: '',
          userName: 'Dungke'
        },
        {
          userToken: 'yiOLmoqOPkRkhLihuQRofblp',
          profileImage: '',
          userName: 'Raji Al-Ameen'
        },
        {
          userToken: 'ATiDrRJFfXiEDHpSoHVXMAbJ',
          profileImage: '',
          userName: 'chidinma'
        },
        {
          userToken: 'RbtLYpmHGTYQtEUQSnJkDveD',
          profileImage: '',
          userName: 'Okeke Chidinma'
        },
        {
          userToken: 'ebDJHwYJeSCrMOOqowNxqyCC',
          profileImage: '',
          userName: 'd'
        },
        {
          userToken: 'sxVLqqTHfxQsOrVaIFOjbyFN',
          profileImage: '',
          userName: 'Jimmy'
        },
        {
          userToken: 'LqWCScOTHweNqOHZLlQUkhYg',
          profileImage: '',
          userName: 'Lekan Raji'
        },
        {
          userToken: 'owaJCBPCCQwYchlRrIozVBuA',
          profileImage: '',
          userName: 'Gee'
        },
        {
          userToken: 'dLtIoYbnvpJAggUYjqRUNXDs',
          profileImage: '',
          userName: 'Jimmy'
        },
        {
          userToken: 'LjrFtzkvBGhtMfYfuPndkksF',
          profileImage: '',
          userName: 'jhvgcyvg'
        },
        {
          userToken: 'KMjlQobcLHQdwBJlsdoDYoWM',
          profileImage: '',
          userName: 'jhvgcyvg'
        },
        {
          userToken: 'YtEcPNBoXTfaRBQiSGBXrJyh',
          profileImage: '',
          userName: 'Victor'
        },
        {
          userToken: 'OpcCyXVcSQxNFnjlGyvfjcYr',
          profileImage: '',
          userName: ''
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
    ViewMessageProfile
  },
  watch: {
    users: {
      handler (val) {
        this.filterUsers()
      },
      immediate: true
    }
  }
})
export default class App extends ComponentProps {
  robin = null as any
  conn = null as any
  conversationOpened = false as boolean
  key = 0 as number
  screenWidth = 0 as number

  created (): void {
    this.filterUsers()
    this.initiateRobin()

    this.openConversation()
    this.onGroupConversationCreated()
    this.onExitGroup()
    this.onExitMessage()
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

  get currentConversation () {
    return store.state.currentConversation
  }

  get imagesToPreview () {
    return store.state.imagesToPreview
  }

  get imagePreviewOpen () {
    return store.state.imagePreviewOpen
  }

  get viewMessageProfileOpen () {
    return store.state.viewMessageProfileOpen
  }

  initiateRobin () {
    this.robin = new Robin(this.apiKey, true)
    // console.log(this.robin)
    this.connect()
    this.setPrototypes()
  }

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

    store.setState('users', filteredUsers)
  }

  setPrototypes () {
    Vue.prototype.$robin = this.robin
    Vue.prototype.$user_token = this.userToken
    Vue.prototype.$channel = this.channel
    Vue.prototype.$conversations = []
    Vue.prototype.$regularConversations = []
    Vue.prototype.$archivedConversations = []
    Vue.prototype.$senderName = this.userName
  }

  connect () {
    this.conn = this.robin.connect(this.userToken)

    this.conn.onopen = () => {
      this.robin.subscribe(this.channel, this.conn)
    }

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

    this.conn.onclosed = () => {
      this.connect()
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
    // console.log('event->', message)
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

      store.setState('viewMessageProfileOpen', false)
    }, 100)
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
}

.robin-container *,
.robin-container *::before,
.robin-container *::after {
  -webkit-tap-highlight-color: transparent;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Google Sans', sans-serif;
  font-kerning: normal;
  -moz-font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  -ms-font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  -webkit-font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}
</style>
