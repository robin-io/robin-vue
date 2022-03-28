<template>
  <div class="robin-alphabet-block robin-flex robin-flex-align-center">
    {{ text }}
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'

const ComponentProps = Vue.extend({
  props: {
    text: {
      type: String as PropType<string>,
      default: 'A'
    }
  }
})

@Component({
  name: 'AlphabetBlock'
})
export default class AlphabetBlock extends ComponentProps {}
</script>

<style scoped>
.robin-alphabet-block {
  width: 100%;
  padding: 0 1rem;
  min-height: 42px;
  background-color: #fff;
  font-size: clamp(0.3rem, 5vw, 1rem);
  text-transform: uppercase;
}
</style>