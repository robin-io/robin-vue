<template>
  <div class="robin-no-message-container"></div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  name: 'NoMessageSelected'
})
export default class NoMessageSelected extends Vue {

}
</script>

<style scoped>
.robin-no-message-container {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}
</style>
