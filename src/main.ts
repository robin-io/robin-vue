import Vue from 'vue'
import axios from 'axios'
// import RobinChat from './robinchat'
import App from './App.vue'
import VueAxios from 'vue-axios'
import VueToast from 'vue-toast-notification'
import { ClickAwayDirective } from './utils/clickaway'
import 'vue-toast-notification/dist/theme-sugar.css'
import './types/index.d.ts'
import './styles/main.css'

Vue.use(VueAxios, axios)
Vue.use(VueToast)
Vue.directive('clickaway', ClickAwayDirective)

const robinChat = new Vue({
  render: h => h(App)
})

robinChat.$mount('#app')

// export default RobinChat
