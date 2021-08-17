<template>
  <div class="robin-alphabet-block robin-flex robin-flex-align-center">
    {{ text }}
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  name: 'RForwardMessage',
  props: {
    text: {
      type: String as PropType<string>,
      default: 'A'
    }
  }
})
</script>

<style scoped>
.robin-alphabet-block {
  width: 100%;
  padding: 0 1.5rem;
  height: 28px;
  background-color: #f3f3f3;
  font-size: 1rem;
}
</style>
