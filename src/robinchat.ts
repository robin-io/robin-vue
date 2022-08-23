import App from './App.vue'

export default {
  install(app: { component: (arg0: string, arg1: any) => void }, options: any) {
    /*
     * Before using Vue component, Check if Vue2 or Vue3 and Install necessary packages accordingly.
    */

    app.component('RobinChat', App)
  },
}
