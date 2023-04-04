<template>
  <label class="robin-checkbox-container" id="checkbox">
    <input
      type="checkbox"
      name="checkbox"
      class="robin-checkbox-button"
      v-model="checked"
      ref="checkbox"
      @click="$emit('clicked', checked)"
    />
    <span class="robin-checkbox-control"></span>
  </label>
</template>

<script lang="ts">
import { PropType } from 'vue'
import Component, { mixins } from 'vue-class-component'
import conversationMixins from '@/mixins/conversation-mixins'

const ComponentProps = mixins(conversationMixins).extend({
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
    },
    shouldResetCheckedState: {
      handler (val) {
        if (val) {
          this.resetCheckState()
        }
      }
    }
  }
})
export default class CheckBox extends ComponentProps {
  root = null as any;
  checked = false as boolean;

  mounted (): void {
    this.root = document.documentElement
    this.setRootVariables()
    this.resetCheckState()
  }

  resetCheckState () {
    const el = this.$refs.checkbox as HTMLInputElement
    el.checked = false
    this.checked = false
  }

  setRootVariables (): void {
    this.root.style.setProperty('--checkbox-color', this.color)
  }
}
</script>
