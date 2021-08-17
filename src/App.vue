<template>
  <div class="robin-container">
    <RSideContainer />
    <RGroupMessageContainer />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RSideContainer from './components/ChatList/RSideContainer/RSideContainer.vue'
import RGroupMessageContainer from './components/Message/RGroupMessageContainer/RGroupMessageContainer.vue'
import './styles/main.css'

export default Vue.extend({
  name: 'RobinChatContainer',
  components: {
    RSideContainer,
    RGroupMessageContainer
  }
})
</script>

<style>
.robin-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100000;
  overflow: hidden;
}
</style>
