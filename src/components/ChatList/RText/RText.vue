<template>
  <h1 v-if="as == 'h1'" class="robin-text" :style="getStyles">
    {{ text }}
  </h1>
  <h2 v-else-if="as == 'h2'" class="robin-text" :style="getStyles">
    {{ text }}
  </h2>
  <h3 v-else-if="as == 'h3'" class="robin-text" :style="getStyles">
    {{ text }}
  </h3>
  <p v-else-if="as == 'p'" class="robin-text" :style="getStyles">
    {{ text }}
  </p>
  <span v-else-if="as == 'span'" class="robin-text" :style="getStyles">
    {{ text }}
  </span>
  <label v-else-if="as == 'label'" class="robin-text" :style="getStyles">
    {{ text }}
  </label>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'

const ComponentProps = Vue.extend({
  props: {
    as: {
      type: String as PropType<string>,
      default: 'h1',
      validator: (value: string) => {
        return ['h1', 'h2', 'h3', 'p', 'span', 'label'].includes(value)
      }
    },
    text: {
      type: String as PropType<string>,
      default: 'This is a text'
    },
    color: {
      type: String as PropType<string>,
      default: '#000000'
    },
    fontSize: {
      type: Number as PropType<number>,
      default: 16
    },
    fontWeight: {
      type: String as PropType<string>,
      default: 'normal'
    },
    lineHeight: {
      type: Number as PropType<number>,
      default: 0
    },
    textWrap: {
      type: String as PropType<string>,
      default: 'nowrap'
    },
    maxWidth: {
      type: String as PropType<string>,
      default: 'max-content'
    }
  }
})

@Component({
  name: 'RText'
})
export default class RText extends ComponentProps {
  root = null as any

  mounted (): void {
    this.root = document.documentElement
  }

  get getStyles (): Object {
    let rootFontSize = 16 // default

    if (this.root && this.root.style.fontSize !== '') {
      rootFontSize = this.root.style.fontSize
    }

    return {
      'font-size': this.fontSize / rootFontSize + 'rem',
      color: this.color,
      'font-weight': this.fontWeight,
      'line-height':
        this.lineHeight === 0
          ? 'initial'
          : this.lineHeight / rootFontSize + 'rem',
      'white-space': this.textWrap,
      'max-width':
        this.maxWidth === 'max-content' ? this.maxWidth : this.maxWidth + 'px'
    }
  }
}
</script>

<style scoped>
.robin-text {
  display: block;
  max-height: max-content;
  overflow: hidden;
}
</style>
