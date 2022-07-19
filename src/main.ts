import Vue from 'vue'
import axios from 'axios'
import RobinChat from './robinchat'
// import App from './App.vue'
import VueToast from 'vue-toast-notification'
import VueAxios from 'vue-axios'
import 'vue-toast-notification/dist/theme-sugar.css'
import './types/index.d.ts'
import './styles/main.css'

Vue.use(VueAxios, axios)
Vue.use(VueToast)

// const robinChat = new Vue({
//   render: h => h(App)
// })

// robinChat.$mount('#app')

export default RobinChat
