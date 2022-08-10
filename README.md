<h1 align="start">
  robin-vue
</h1>

<p align="start">
<a href="https://npmjs.com/package/robin-vue">
    <img alt="" src="https://img.shields.io/npm/v/robin-vue.svg">
</a>
<a href="https://npmjs.com/package/robin-vue">
    <img alt="" src="https://img.shields.io/npm/dt/robin-vue.svg">
</a>
<a href="https://npmjs.com/package/robin-vue">
    <img alt="" src="https://img.shields.io/npm/l/robin-vue.svg">
</a>
</p>

<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about">About</a>
    </li>
    <li>
      <a href="#getting-started">Installation</a>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#available-options">Available options</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

## About

robin-vue is a Vue SDK built to communicate with the [Robin API](https://robinapp.co/). Now you can integrate [Robin](https://robinapp.co/) with minimal effort and quickly setup an real-time messaging platform in your Vue.js web application.

## Installation

```bash
## npm
npm install robin-vue

## yarn
yarn add robin-vue
```

## Usage

```
import Vue from 'vue'
import App from './App.vue'
import RobinChat from 'robin-vue'
import 'robin-vue-sdk/dist/style.css'

Vue.config.productionTip = false

Vue.use(RobinChat)

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
```

```
<template>
  <div id="app">
    <RobinChat :api-key="apiKey" :user-token="userToken" :user-name="userName" :users="users" :keys="keys" :page-loader="pageLoader" />
  </div>
</template>

<script>

export default {
  name: 'ChatApp',
  components: {
    RobinChat
  },
  data () {
    return {
      apiKey: '...'
      userToken: '...
      pageLoader: true,
      userName: '...',
      keys: {
        userToken: 'user_token',
        profileImage: 'profile_image',
        userName: 'fullname'
      },
      users: [{
        userToken: '...',
        profileImage: '...',
        userName: '...'
      }]
    }
  }
}
</script>
```

## Available options

| Attribute   |  Type   | Default | Description                                                 |
| :---------- | :-----: | :-----: | :---------------------------------------------------------- |
| api-key     | String  |   ''    | SDK Authorization. (required)                               |
| user-token  | String  |   ''    | User Authorization. (required)                              |
| user-name   | String  |   ''    | Name of the current user using Robin. (required)            |
| users       |  Array  |   []    | User list - Data should model the keys option (required)    |
| keys        | Object  |   {}    | User data structure you want Robin to pull from. (required) |
| page-loader | Boolean |  True   | Shows a loader when first mounting <RobinChat /> Component. |

## License

Distributed under the MIT License. See `LICENSE` for more information.
