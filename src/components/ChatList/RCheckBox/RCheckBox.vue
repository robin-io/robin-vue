<template>
  <label class="robin-checkbox-container">
    <input type="checkbox" name="checkbox" class="robin-checkbox-button" />
    <span class="robin-checkbox-control"></span>
  </label>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'

const ComponentProps = Vue.extend({
  props: {
    color: {
      type: String as PropType<string>,
      default: '#15AE73'
    }
  }
})

// eslint-disable-next-line
@Component<RCheckBox>({
  name: 'RCheckBox',
  watch: {
    color (): void {
      this.setRootVariables()
    }
  }
})
export default class RCheckBox extends ComponentProps {
  root = null as any

  mounted (): void {
    this.root = document.documentElement
    this.setRootVariables()
  }

  setRootVariables (): void {
    this.root.style.setProperty('--checkbox-color', this.color)
  }
}
</script>

<style scoped>
.robin-checkbox-container {
  display: flex;
}

input[type='checkbox'] {
  opacity: 0;
  width: 0;
  height: 0;
}

/* .robin-checkbox-control {
  display: grid;
  place-items: center;
} */

.robin-checkbox-control {
  display: grid;
  place-items: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 0.1rem solid #bbc1d6;
  cursor: pointer;
}

input[type='checkbox'] + .robin-checkbox-control::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  box-shadow: inset 0.5em 0.5em var(--checkbox-color);
  border-radius: 50%;
  transition: 180ms transform ease-in-out;
  transform: scale(0);
}

input[type='checkbox']:checked + .robin-checkbox-control {
  border: 0.1rem solid var(--checkbox-color);
}

input[type='checkbox']:checked + .robin-checkbox-control::before {
  transform: scale(1);
}
</style>
