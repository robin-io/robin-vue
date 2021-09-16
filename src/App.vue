<template>
  <div class="robin-container">
    <transition name="robin-fadeIn">
      <RSideContainer v-show="!isPageLoading" :user_token="user_token" :key="key" />
    </transition>
    <transition name="robin-fadeIn">
      <RGroupMessageContainer v-show="!isPageLoading && conversationOpened" :key="key" />
    </transition>
    <RNoMessageSelected v-show="!isPageLoading && !conversationOpened" />
    <RPageLoader v-show="isPageLoading" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import RSideContainer from './components/ChatList/RSideContainer/RSideContainer.vue'
import RGroupMessageContainer from './components/Message/RGroupMessageContainer/RGroupMessageContainer.vue'
import RNoMessageSelected from './components/Message/RNoMessageSelected.vue'
import RPageLoader from './components/RPageLoader.vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'
import { RootState } from './utils/types'
import { Robin } from 'robin.io-js'
import EventBus from './event-bus'

const ComponentProps = Vue.extend({
  props: {
    user_token: {
      type: String as PropType<string>,
      default: 'ozkCYlRarHGmYefqAVnzMPLb'
    },
    api_key: {
      type: String as PropType<string>,
      default: 'NT-npUbpwzapYoTUtHSufMWQkNNnZePbqqFycjb'
      // default: 'NT-BtBVBDkCHNXsYuqBdHskPNPnhTzarOlexmOb'
    },
    channel: {
      type: String as PropType<string>,
      default: 'robin-chat'
    },
    users: {
      type: Array as PropType<Array<any>>,
      default: (): Array<any> => [
        {
          userToken: 'OOGAUYpPJZCNMAsSisiyiYjU',
          userName: 'Elvis',
          profileImage: ''
        },
        {
          userToken: 'dWvoxobuJSepnEXYOVWtvzBO',
          userName: 'Enoch',
          profileImage: ''
        },
        {
          userToken: 'TyGMUkyuEAqOqEVliBEqdCQH',
          userName: 'Bashir',
          profileImage: ''
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

@Component({
  name: 'RobinChatContainer',
  components: {
    RSideContainer,
    RGroupMessageContainer,
    RPageLoader,
    RNoMessageSelected
  }
})
export default class App extends ComponentProps {
  @State('isPageLoading') isPageLoading?: RootState

  robin = null as any
  conn = null as any
  conversationOpened = false as boolean
  key = 0 as number

  created (): void {
    this.filterUsers()
    this.initiateRobin()

    this.openConversation()
    this.onGroupConversationCreated()
    this.onExitGroup()
  }

  initiateRobin () {
    this.robin = new Robin(this.api_key, true)
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

    Vue.prototype.$robin_users = filteredUsers
  }

  setPrototypes () {
    Vue.prototype.$robin = this.robin
    Vue.prototype.$user_token = this.user_token
    Vue.prototype.$channel = this.channel
    Vue.prototype.$conversations = []
    Vue.prototype.$regularConversations = []
    Vue.prototype.$archivedConversations = []

    // console.log(this.robin, this.$robin, this.conn)
  }

  connect () {
    this.conn = this.robin.connect(this.user_token)

    this.conn.onopen = () => {
      // console.log('connected')
      this.robin.subscribe(this.channel, this.conn)
    }

    this.conn.onmessage = (evt: any) => {
      // console.log('new message', evt.data)
      const message = JSON.parse(evt.data)
      // console.log(message)
      if (message.is_event !== true) {
        EventBus.$emit('new-message', message)
      } else {
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
    EventBus.$on('group-conversation-created', (conversation: object) => {
      this.conversationOpened = true
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
        // console.log('new conversation')
        break
      case 'message.forward':
        // loop through message.value
        // check if current conversation._id is equal to message.conversation_id
        // if it is, push message to message array
        // else update last_message and unshift
        EventBus.$emit('message.forward', message.value)
        // console.log('forwarded message', message.value)
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
}
</script>

<style>
*,
*::before,
*::after {
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

.robin-container {
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
</style>
