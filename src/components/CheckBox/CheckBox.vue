<template>
  <label class="robin-checkbox-container" id="checkbox">
    <input
      type="checkbox"
      name="checkbox"
      class="robin-checkbox-button"
      v-model="checked"
      @click="$emit('clicked', checked)"
      data-testid="checkbox"
    />
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
@Component<CheckBox>({
  name: 'CheckBox',
  watch: {
    color (): void {
      this.setRootVariables()
    }
  }
})
export default class CheckBox extends ComponentProps {
  root = null as any
  checked = false as boolean

  mounted (): void {
    this.root = document.documentElement
    this.setRootVariables()
  }

  setRootVariables (): void {
    this.root.style.setProperty('--checkbox-color', this.color)
  }
}
</script>
