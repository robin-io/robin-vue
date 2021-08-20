<template>
  <div v-if="count > 0 && count <= 100" class="robin-unread-messages">
    {{ count }}
  </div>
  <div v-else-if="count > 100" class="robin-unread-messages">100+</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'

const ComponentProps = Vue.extend({
  props: {
    count: {
      type: Number as PropType<number>,
      default: 0
    },
    backgroundColor: {
      type: String as PropType<string>,
      default: '#15AE73'
    }
  }
})

// eslint-disable-next-line
@Component<RUnreadMessageCount>({
  name: 'RUnreadMessageCount',
  watch: {
    backgroundColor(): void {
      this.setRootVariables()
    }
  }
})
export default class RUnreadMessageCount extends ComponentProps {
  root = null as any

  mounted(): void {
    this.root = document.documentElement
    this.setRootVariables()
  }

  setRootVariables(): void {
    this.root.style.setProperty('--bg-color', this.backgroundColor)
  }
}
</script>

<style scoped>
.robin-unread-messages {
  background-color: var(--bg-color);
  font-size: 0.875rem;
  border-radius: 20px;
  font-weight: 100;
  white-space: nowrap;
  padding: 0.2rem 0.25rem;
  min-width: 1.4rem;
  max-width: max-content;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  overflow: hidden;
}
</style>
