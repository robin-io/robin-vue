<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-reaction-container">

    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'

const ComponentProps = Vue.extend({
  props: {
    id: {
      type: String as PropType<string>,
      default: ''
    },
    message: {
      type: [Object, Array],
      default: () => {}
    }
  }
})

@Component({
  name: 'RReactionPopOver'
})
export default class RReactionPopOver extends ComponentProps {
}
</script>

<style scoped>
.robin-popup {
  width: 200px;
  max-width: 220px;
  padding: 0.649rem 0.925rem 0.649rem 0.649rem;
  border-radius: 16px;
  background-color: #fff;
  position: relative;
}

.robin-popup::before {
  content: '';
  position: absolute;
  bottom: -35%;
  right: 10px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: #fff;
}

.robin-popup::after {
  content: '';
  position: absolute;
  bottom: -80%;
  right: 17px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #fff;
}

.robin-reaction-container {

}
</style>
