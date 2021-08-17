/* eslint-disable camelcase */
import Vue from 'vue'
// import Vue from 'vue/types/umd'
import { Robin } from 'robin.io-js'
import App from './App.vue'
// import { Robin } from 'robin.io-js'
// Vue.use(Robin)

const app = new Vue({
  render: (h) => h(App)
})

app.$mount('#app')

declare module 'vue/types/vue' {
  // eslint-disable-next-line no-unused-vars
  interface Vue {
    // eslint-disable-next-line camelcase
    $robin: Robin
    $conn: WebSocket
    $user_token: string
    $channel: string
  }
}
export default App
