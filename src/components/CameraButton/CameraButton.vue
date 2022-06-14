<template>
  <button class="robin-button" type="button" @click="$emit('clicked')" @keyup.enter="$emit('clicked')" data-testid="camera-button">
    <SvgIcon name="camera" />
  </button>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'

const ComponentProps = Vue.extend({
  props: {
    cameraOpened: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  }
})

@Component({
  name: 'CameraButton',
  components: {
    SvgIcon
  }
})
export default class CameraButton extends ComponentProps {
  created () {
    document.addEventListener('keyup', (event: any) => {
      // (event)
      if (event.keyCode === 13 && this.cameraOpened) {
        this.$emit('clicked')
      }
    })
  }
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
