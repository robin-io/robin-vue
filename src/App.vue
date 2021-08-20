<template>
  <div class="robin-container">
    <RSideContainer v-show="!isPageLoading" :user_token="user_token" />
    <RGroupMessageContainer v-show="!isPageLoading" />
    <RPageLoader v-show="isPageLoading" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import RSideContainer from './components/ChatList/RSideContainer/RSideContainer.vue'
import RGroupMessageContainer from './components/Message/RGroupMessageContainer/RGroupMessageContainer.vue'
import RPageLoader from './components/RPageLoader.vue'
import Component from 'vue-class-component'
import { State, Mutation } from 'vuex-class'
import { RootState } from './utils/types'
import { Robin } from 'robin.io-js'
import EventBus from './event-bus'
import './styles/main.css'

const ComponentProps = Vue.extend({
  props: {
    user_token: {
      type: String as PropType<string>,
      default: 'ozkCYlRarHGmYefqAVnzMPLb'
    },
    api_key: {
      type: String as PropType<string>,
      default: 'NT-BtBVBDkCHNXsYuqBdHskPNPnhTzarOlexmOb'
    },
    channel: {
      type: String as PropType<string>,
      default: 'robin-chat'
    }
  }
})

@Component({
  name: 'RobinChatContainer',
  components: {
    RSideContainer,
    RGroupMessageContainer,
    RPageLoader
  }
})
export default class App extends ComponentProps {
  @State('isPageLoading') isPageLoading?: RootState
  @Mutation('setPageLoading') setPageLoading: any

  robin = null as any
  conn = null as any

  created (): void {
    this.initiateRobin()
  }

  initiateRobin () {
    this.setPageLoading(true)
    this.robin = new Robin(this.api_key, true)
    this.connect()
    this.setPrototypes()

    if (this.robin) {
      this.setPageLoading(false)
    }
  }

  setPrototypes () {
    Vue.prototype.$conn = this.conn
    Vue.prototype.$robin = this.robin
    Vue.prototype.$user_token = this.user_token
    Vue.prototype.$channel = this.channel

    console.log(this.robin, this.$robin, this.conn)
  }

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
  }
}
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
