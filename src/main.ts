import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
// import RobinChat from './robinchat'
import App from './App.vue'
import Toasted from 'vue-toasted'
import '../types/index.d.ts'
import './styles/main.css'

Vue.use(VueAxios, axios)
Vue.use(Toasted)

Vue.toasted.register('custom_success', (message) => message, {
  type: 'success',
  theme: 'toasted-primary',
  duration: 3000,
  containerClass: 'robin-toasted',
  className: 'robin-toasted-container',
  action: [
    {
      text: '',
      icon: 'close',
      onClick: (e, toastObject) => {
        toastObject.goAway(0)
      }
    }
  ]
})

Vue.toasted.register('custom_error', (message) => message, {
  type: 'error',
  theme: 'toasted-primary',
  duration: 3000,
  containerClass: 'robin-toasted',
  className: 'robin-toasted-container',
  action: [
    {
      text: '',
      icon: 'close',
      onClick: (e, toastObject) => {
        toastObject.goAway(0)
      }
    }
  ]
})

const robinChat = new Vue({
  render: h => h(App)
})

robinChat.$mount('#app')

// export default RobinChat

// export { RobinChat }
