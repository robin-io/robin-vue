<template>
  <div class="robin-shim">
    <div class="robin-inner-shim">
      <div class="robin-loader-ctn">
        <div class="robin-loader" />
        <img src="@/assets/robin_icon.png" alt="logo" />
      </div>
      <div class="robin-come-up robin-mt-18">
        <RText as="h2" color="#fff" font-weight="'bold'" :font-size="24"> Getting messages... </RText>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RText from './ChatList/RText/RText.vue'

export default Vue.extend({
  name: 'RPageLoader',
  components: {
    RText
  }
})
</script>

<style scoped>
.robin-shim {
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  overflow-y: auto;
}

.robin-inner-shim {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.6);
}

.robin-loader-ctn {
  position: relative;
}

.robin-loader {
  border: 5px solid #f3f3f3;
  position: relative;
  border-radius: 50%;
  border-top: 5px solid #000;
  width: 100px;
  height: 100px;
  -webkit-animation: spin 1s linear infinite;
  animation: spin 1s linear infinite;
}

.robin-inner-shim img {
  width: 50px;
  position: absolute;
  top: 25px;
  right: 25px;
  animation: pulse 1s infinite;
}
</style>
