import Vue from 'vue'
import RobinChat from './App.vue'
import store from './utils/index'
import '../types/index.d.ts'

const robinChat = new Vue({
  store,
  render: (h) => h(RobinChat)
})

robinChat.$mount('#app')

export { RobinChat }
