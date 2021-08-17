<template>
  <div class="robin-container">
    <RSideContainer :user_token="user_token" />
    <RGroupMessageContainer />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RSideContainer from './components/ChatList/RSideContainer/RSideContainer.vue'
import RGroupMessageContainer from './components/Message/RGroupMessageContainer/RGroupMessageContainer.vue'
import './styles/main.css'
import { Robin } from 'robin.io-js'
export const EventBus = new Vue()

export default Vue.extend({
  name: 'RobinChatContainer',
  components: {
    RSideContainer,
    RGroupMessageContainer
  },
  created () {
    this.robin = new Robin(this.api_key, true)
    this.connect()
    console.log(this.robin)
    // eslint-disable-next-line camelcase
    Vue.prototype.$robin = this.robin
    Vue.prototype.$user_token = this.user_token
    Vue.prototype.$channel = this.channel
  },
  methods: {
    connect () {
      this.conn = this.robin.connect(this.user_token)

      this.conn.onopen = () => {
        this.robin.subscribe(this.channel, this.conn)
      }

      this.conn.onmessage = (evt: any) => {
        const message = JSON.parse(evt.data)
        console.log(message)
        if (message.is_event !== true) {
          EventBus.$emit('new-message', message)
        } else {
          // move new conversation to the top
          EventBus.$emit('new-conversation', message)
        }
      }

      this.conn.onclosed = () => {
        this.connect()
      }
      Vue.prototype.$conn = this.conn
    }
  },
  data: () => {
    return {
      robin: null as any,
      conn: null as any
    }
  },
  props: {
    user_token: {
      type: String,
      default: () => 'XVgQSLEhOFAXnIKiuXQbtdYY'
    },
    api_key: {
      type: String,
      default: () => 'NT-LSTTNiKdEQyAagVBdhKtoqqTEhbXGGZxaQbp'
    },
    channel: {
      type: String,
      default: () => 'robin-chat'
    }
  }
})
</script>

<style>
.robin-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100000;
  overflow: hidden;
}
</style>
