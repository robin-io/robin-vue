<template>
  <input type="text" :placeholder="placeholder" @input="userTyping($event.target.value)" autocomplete="off" class="robin-input" v-model="text" :style="getStyles" />
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
    }
  }
})

@Component({
  name: 'RInput'
})
export default class RInput extends ComponentProps {
  text = ''

  get getStyles (): Object {
    return {
      'border-radius': this.borderRadius + 'px',
      'min-height': this.height + 'px',
      width: this.width === 'fullWidth' ? '100%' : this.width + 'px'
    }
  }

  userTyping (val: string): void {
    this.$emit('user-typing', val)
  }
}
</script>

<style scoped>
/* Input styles */
.robin-input {
  background-color: #F5F7FC;
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
  color: #8D9091;
}

::-moz-placeholder {
  color: #8D9091;
}

:-ms-input-placeholder {
  color: #8D9091;
}

::-ms-input-placeholder {
  color: #8D9091;
}
</style>
