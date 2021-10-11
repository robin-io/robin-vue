import Vue, { VueConstructor } from 'vue'
import App from './App.vue'

export default {
  install (Vue: { component: (arg0: string, arg1: VueConstructor<Vue>) => void }, options: any) {
    Vue.component('RobinChat', App)
  }
}
