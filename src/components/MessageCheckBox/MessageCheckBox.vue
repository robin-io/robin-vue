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
@Component<MessageCheckBox>({
  name: 'MessageCheckBox',
  watch: {
    color (): void {
      this.setRootVariables()
    }
  }
})
export default class MessageCheckBox extends ComponentProps {
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

.robin-checkbox-control {
  display: grid;
  place-items: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 0.1rem solid #bbc1d6;
  cursor: pointer;
  transition: 100ms background ease-in-out;
  position: relative;
}

input[type='checkbox']:checked + .robin-checkbox-control {
  background-color: var(--checkbox-color);
  border: none;
}

input[type='checkbox']:checked + .robin-checkbox-control::after {
  content: '';
  position: absolute;
  top: 3px;
  /* left: 0; */
  width: 4px;
  height: 8px;
  border: solid #ffffff;
  border-width: 0 0.12rem 0.12rem 0;
  border-radius: 1px;
  transform: rotate(45deg);
}
</style>
