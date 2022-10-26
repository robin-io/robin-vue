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
