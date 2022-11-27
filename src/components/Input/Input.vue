<template>
  <input type="text" :placeholder="placeholder" @input="userTyping($event)" autocomplete="off" class="robin-input" ref="input" :style="getStyles" data-testid="input" />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'

const ComponentProps = Vue.extend({
  props: {
    placeholder: {
      type: String as PropType<string>,
      default: 'Choose a group chat name'
    },
    borderRadius: {
      type: Number as PropType<number>,
      default: 4
    },
    height: {
      type: Number as PropType<number>,
      default: 44
    },
    width: {
      type: [String, Number] as PropType<string | number>,
      default: 'fullWidth',
      validator: (value: string) => {
        const regex = /^\d+$/
        return regex.test(value) || value.includes('fullWidth')
      }
    },
    text: {
      type: String as PropType<string>,
      default: ''
    },
    reset: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  }
})

// eslint-disable-next-line
@Component<Input>({
  name: 'Input',
  watch: {
    text (val) {
      if (val === '') {
        // ('reset')
        this.resetTyping()
      }
    },
    reset (val) {
      if (val) {
        this.resetTyping()
      }
    }
  }
})
export default class Input extends ComponentProps {
  get getStyles (): ObjectType {
    return {
      'border-radius': this.borderRadius + 'px',
      'min-height': this.height + 'px',
      width: this.width === 'fullWidth' ? '100%' : this.width + 'px'
    }
  }

  userTyping (event: Event): void {
    const val = (event.target as HTMLInputElement).value
    this.$emit('user-typing', val)
  }

  resetTyping (): void {
    const input = this.$refs.input as any
    input.value = ''
  }
}
</script>

<style scoped>
/* Input styles */
.robin-input {
  background-color: var(--rb-color6);
  caret-color: var(--rb-color7);
  color: var(--rb-color7);
  border: none;
  font-size: 0.875rem;
  padding-left: 1rem;
  transition: all 0.1s;
}

.robin-input:focus {
  outline: none;
}

/* Input placeholder */
::placeholder {
  color: #8d9091;
}

::-moz-placeholder {
  color: #8d9091;
}

:-ms-input-placeholder {
  color: #8d9091;
}

::-ms-input-placeholder {
  color: #8d9091;
}
</style>
