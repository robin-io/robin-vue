<template>
  <button class="robin-button" type="button" @click="$emit('clicked')">
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.08334 6.66667L5.83334 11.3333C6.16668 11.6667 6.66668 11.6667 7.00001 11.3333C7.33334 11 7.33334 10.5 7.00001 10.1667L2.91668 6L7.00001 1.83334C7.33334 1.5 7.33334 1 7.00001 0.666671C6.83334 0.500005 6.66668 0.416672 6.41668 0.416672C6.16668 0.416672 6.00001 0.500005 5.83334 0.666671L1.08334 5.33334C0.75001 5.75 0.75001 6.25 1.08334 6.66667C1.08334 6.58334 1.08334 6.58334 1.08334 6.66667Z" fill="#535F89" />
    </svg>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  name: 'RBackButton'
})
export default class RBackButton extends Vue {}
</script>

<style scoped>
.robin-button {
  cursor: pointer;
  border: none;
  background-color: transparent;
  width: max-content;
}
</style>
