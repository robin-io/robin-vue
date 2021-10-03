<template>
  <button class="robin-button" type="button" @click="$emit('clicked')">
    <span class="material-icon material-icons-outlined"> photo_camera </span>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  name: 'RCameraButton'
})
export default class RCameraButton extends Vue {}
</script>

<style scoped>
.robin-button {
  cursor: pointer;
  border: none;
  background-color: transparent;
  width: max-content;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  min-height: 50px;
  background-color: var(--primary-color);
  border-radius: 50%;
  color: #fff;
  font-size: 2rem;
}
</style>
