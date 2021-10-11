<template>
  <div class="robin-no-message-container"></div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  name: 'RNoMessageSelected'
})
export default class RNoMessageSelected extends Vue {

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
