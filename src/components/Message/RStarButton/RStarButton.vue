<template>
  <button type="button" class="robin-button">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.0003 1.66669L12.5753 6.88335L18.3337 7.72502L14.167 11.7834L15.1503 17.5167L10.0003 14.8084L4.85033 17.5167L5.83366 11.7834L1.66699 7.72502L7.42533 6.88335L10.0003 1.66669Z" stroke="#6B7491" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'RStarButton'
})
</script>

<style scoped>
.robin-button {
  cursor: pointer;
  border: none;
  background-color: transparent;
  width: max-content;
}
</style>
