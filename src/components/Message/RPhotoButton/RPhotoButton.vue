<template>
  <button type="button" class="robin-button">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0)">
        <path d="M19.1663 15.8333C19.1663 16.2754 18.9907 16.6993 18.6782 17.0118C18.3656 17.3244 17.9417 17.5 17.4997 17.5H2.49967C2.05765 17.5 1.63372 17.3244 1.32116 17.0118C1.0086 16.6993 0.833008 16.2754 0.833008 15.8333V6.66667C0.833008 6.22464 1.0086 5.80072 1.32116 5.48816C1.63372 5.17559 2.05765 5 2.49967 5H5.83301L7.49967 2.5H12.4997L14.1663 5H17.4997C17.9417 5 18.3656 5.17559 18.6782 5.48816C18.9907 5.80072 19.1663 6.22464 19.1663 6.66667V15.8333Z" stroke="#476BD2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M10.0003 14.1667C11.8413 14.1667 13.3337 12.6743 13.3337 10.8333C13.3337 8.99238 11.8413 7.5 10.0003 7.5C8.15938 7.5 6.66699 8.99238 6.66699 10.8333C6.66699 12.6743 8.15938 14.1667 10.0003 14.1667Z" stroke="#476BD2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'RGalleryButton'
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
