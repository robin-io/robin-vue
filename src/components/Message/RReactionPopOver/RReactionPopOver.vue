<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-reaction-container">
      <IconButton name="like" :to-emit="false" :to-click-away="false" />
      <IconButton name="thumbsUp" :to-emit="false" :to-click-away="false" />
      <IconButton name="thumbsDown" :to-emit="false" :to-click-away="false" />
      <IconButton name="lol" :to-emit="false" :to-click-away="false" />
      <IconButton name="exclamation" :to-emit="false" :to-click-away="false" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import IconButton from '../../IconButton.vue'

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
  name: 'RReactionPopOver',
  components: {
    IconButton
  }
})
export default class RReactionPopOver extends ComponentProps {
}
</script>

<style scoped>
.robin-popup {
  width: 200px;
  max-width: 220px;
  padding: 0.349rem 0.925rem 0.349rem 0.649rem;
  border-radius: 24px;
  background-color: #fff;
  position: relative;
}

.robin-popup::before {
  content: '';
  position: absolute;
  bottom: -3px;
  right: 100px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #fff;
}

.robin-popup::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 85px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #fff;
}

.robin-reaction-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem 0 0;
}

.robin-reaction-container >>> .robin-button:hover {
  transform: scale(1.2);
}
</style>
