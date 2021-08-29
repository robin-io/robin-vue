import Vue from 'vue'
import VueViewer from 'v-viewer'
import axios from 'axios'
import VueAxios from 'vue-axios'
import RobinChat from './App.vue'
import store from './utils/index'
import '../types/index.d.ts'
import './styles/main.css'

Vue.use(VueAxios, axios)
Vue.use(VueViewer)

const robinChat = new Vue({
  store,
  render: (h) => h(RobinChat)
})

robinChat.$mount('#app')

export { RobinChat }
