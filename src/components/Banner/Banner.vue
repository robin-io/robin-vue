<template>
  <div class="robin-banner">
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
      default: 'Your account has been disabled. Contact Admin'
    },
    error: {
      type: Boolean as PropType<boolean>,
      default: true
    }
  }
})

@Component({
  name: 'Banner'
})
export default class Banner extends ComponentProps {}
</script>
