<template>
  <label class="robin-checkbox-container">
    <input type="checkbox" name="checkbox" class="robin-checkbox-button" v-model="checked" @click="$emit('clicked', checked)" />
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
    color(): void {
      this.setRootVariables()
    }
  }
})
export default class RCheckBox extends ComponentProps {
  root = null as any
  checked = false as boolean

  mounted(): void {
    this.root = document.documentElement
    this.setRootVariables()
  }

  setRootVariables(): void {
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
  position: relative;
}

input[type='checkbox'] + .robin-checkbox-control::before {
  content: '';
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--checkbox-color);
  transform: scale(0);
  transform-origin: center;
  transition: transform 0.2s;
}

input[type='checkbox'] + .robin-checkbox-control::after {
  content: '';
  width: 0px;
  height: 0px;
  border: solid #fff;
  border-width: 0;
  border-radius: 0px 1px 1px 1px;
  transform: rotate(0) scale(0);
  transition: transform 0.3s;
  transform-origin: center;
  position: absolute;
  top: 3px;
}

input[type='checkbox']:checked + .robin-checkbox-control {
  /* border: 0.1px solid var(--checkbox-color); */
  border: 0px solid var(--checkbox-color);
}

input[type='checkbox']:checked + .robin-checkbox-control::before {
  transform: scale(1);
}

input[type='checkbox']:checked + .robin-checkbox-control::after {
  width: 3.5px;
  height: 7px;
  border-width: 0 1px 1px 0;
  transform: rotate(45deg) scale(1);
}
</style>
