import Vue from 'vue'
// import RobinChat from './robinchat'
import App from './App.vue'
import { ClickAwayDirective } from './utils/clickaway'
import 'lazysizes'
import 'lazysizes/plugins/blur-up/ls.blur-up'
import './types/index.d.ts'
import './styles/main.css'
import 'viewerjs/dist/viewer.css'

Vue.directive('clickaway', ClickAwayDirective)

const robinChat = new Vue({
  render: (h) => h(App)
})

robinChat.$mount('#app')

// export default RobinChat
