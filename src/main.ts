import Vue from 'vue'
import RobinChat from './App.vue'
import store from './utils/index'

const robinChat = new Vue({
  store,
  render: (h) => h(RobinChat)
})

robinChat.$mount('#app')

export { RobinChat }
