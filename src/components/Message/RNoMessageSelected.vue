<template>
  <div class="robin-no-message-container"></div>
</template>

<script lang="ts">
import Vue from 'vue'

export default class RNoMessageSelected extends Vue {}
</script>

<style scoped>
.robin-no-message-container {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  /* box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.07); */
}
</style>
