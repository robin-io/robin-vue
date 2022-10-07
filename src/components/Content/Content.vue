<template>
  <h1 v-if="as == 'h1'" class="robin-text" :style="styles">
    <slot></slot>
  </h1>
  <h2 v-else-if="as == 'h2'" class="robin-text" :style="styles">
    <slot></slot>
  </h2>
  <h3 v-else-if="as == 'h3'" class="robin-text" :style="styles">
    <slot></slot>
  </h3>
  <p v-else-if="as == 'p'" class="robin-text" :style="styles">
    <slot></slot>
  </p>
  <span v-else-if="as == 'span'" class="robin-text" :style="styles">
    <slot></slot>
  </span>
  <label data-testid="label" v-else-if="as == 'label'" :for="forRef" class="robin-text" :style="styles">
    <slot></slot>
  </label>
</template>

<script lang="ts">
import store from '@/store'
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
      default: ''
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

// eslint-disable-next-line
@Component<Content>({
  name: 'Content',
  watch: {
    currentTheme (): void {
      this.setStyles()
    }
  }
})
export default class Content extends ComponentProps {
  root = null as any
  styles = {} as Record<string, any>

  mounted (): void {
    this.root = document.documentElement
    this.setStyles()
  }

  get currentTheme () {
    return store.state.currentTheme
  }

  setStyles () {
    let rootFontSize = 16
    let fontSize = `${this.fontSize / rootFontSize + 'rem'}`

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

    this.styles = {
      'font-size': fontSize,
      color: this.color !== '' ? this.color : this.currentTheme === 'light' ? '#000' : '#fff',
      'font-weight': this.fontWeight,
      'line-height': this.lineHeight === 0 ? 'initial' : this.lineHeight / rootFontSize + 'rem',
      'white-space': this.textWrap,
      'word-break': this.wordBreak,
      'text-align': this.textAlign,
      'max-width': this.maxWidth
    }
  }
}
</script>

<style scoped>
.robin-text {
  /* display: block;
  max-height: max-content; */
  overflow: hidden;
  padding: 0 0.2rem;
  color: #000;
}
</style>
