<template>
  <button
    class="robin-camera-button"
    type="button"
    @click="$emit('clicked')"
    @keyup.enter="$emit('clicked')"
    data-testid="camera-button"
  >
    <svg-icon name="camera" />
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
