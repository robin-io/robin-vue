<template>
  <button class="robin-button" type="button" @click="$emit('clicked')" @keyup.enter="$emit('clicked')">
    <SvgIcon name="camera" />
  </button>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'

@Component({
  name: 'RCameraButton',
  components: {
    SvgIcon
  }
})
export default class RCameraButton extends Vue {

}
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
