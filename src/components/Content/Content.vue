<template>
  <h1 v-if="as == 'h1'" class="robin-text" :style="getStyles">
    <slot></slot>
  </h1>
  <h2 v-else-if="as == 'h2'" class="robin-text" :style="getStyles">
    <slot></slot>
  </h2>
  <h3 v-else-if="as == 'h3'" class="robin-text" :style="getStyles">
    <slot></slot>
  </h3>
  <p v-else-if="as == 'p'" class="robin-text" :style="getStyles">
    <slot></slot>
  </p>
  <span v-else-if="as == 'span'" class="robin-text" :style="getStyles">
    <slot></slot>
  </span>
  <label v-else-if="as == 'label'" :for="forRef" class="robin-text" :style="getStyles">
    <slot></slot>
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
    wordBreak: {
      type: String as PropType<string>,
      default: 'initial'
    },
    maxWidth: {
      type: String as PropType<string>,
      default: 'max-content'
    },
    textAlign: {
      type: String as PropType<string>,
      default: 'left'
    },
    // only needed for labels
    forRef: {
      type: String as PropType<string>,
      default: 'document-upload'
    }
  }
})

@Component({
  name: 'Content'
})
export default class Content extends ComponentProps {
  root = null as any

  mounted (): void {
    this.root = document.documentElement
  }

  get getStyles (): Object {
    let rootFontSize = 16 // default
    let fontSize = `${(this.fontSize / rootFontSize) + 'rem'}`

    if (this.root && this.root.style.fontSize !== '') {
      rootFontSize = this.root.style.fontSize
    }

    if (this.fontSize > 16) {
      fontSize = `clamp(0.3rem, 7vw, ${this.fontSize / rootFontSize + 'rem'})`
    } else if (this.fontSize === 16) {
      fontSize = `clamp(0.3rem, 5vw, ${this.fontSize / rootFontSize + 'rem'})`
    } else if (this.fontSize === 14) {
      fontSize = `clamp(0.3rem, 3.5vw, ${this.fontSize / rootFontSize + 'rem'})`
    } else {
      fontSize = `clamp(0.2rem, 3.5vw, ${this.fontSize / rootFontSize + 'rem'})`
    }

    return {
      'font-size': fontSize,
      color: this.color,
      'font-weight': this.fontWeight,
      'line-height': this.lineHeight === 0 ? 'initial' : this.lineHeight / rootFontSize + 'rem',
      'white-space': this.textWrap,
      'word-break': this.wordBreak,
      'text-align': this.textAlign,
      'max-width': this.maxWidth === 'max-content' || this.maxWidth === '100%' ? this.maxWidth : this.maxWidth + 'px'
    }
  }
}
</script>

<style scoped>
.robin-text {
  display: block;
  max-height: max-content;
  overflow: hidden;
  padding: 0 0.2rem;
}
</style>
