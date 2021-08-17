<template>
  <button
    type="button"
    @click="$emit(emit)"
    class="robin-button"
    :style="getStyles"
  >
    {{ text }}
  </button>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  name: 'RTextButton',
  props: {
    text: {
      type: String as PropType<string>,
      default: 'Archived'
    },
    color: {
      type: String as PropType<string>,
      default: '#15AE73'
    },
    fontSize: {
      type: Number as PropType<number>,
      default: 16
    },
    fontWeight: {
      type: String as PropType<string>,
      default: 'normal'
    },
    emit: {
      type: String as PropType<string>,
      default: 'archived'
    }
  },
  data: () => ({
    root: null as any
  }),
  mounted(): void {
    this.root = document.documentElement
    // this.getStyles()
  },
  computed: {
    getStyles(): Object {
      let rootFontSize = 16 // default

      if (this.root && this.root.style.fontSize !== '') {
        rootFontSize = this.root.style.fontSize
      }

      return {
        'font-size': this.fontSize / rootFontSize + 'rem',
        color: this.color,
        'font-weight': this.fontWeight
      }
    }
  }
})
</script>

<style scoped>
.robin-button {
  cursor: pointer;
  border: none;
  background-color: transparent;
  width: max-content;
}
</style>
