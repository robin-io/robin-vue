<template>
  <div v-if="unread > 0 && unread <= 9" class="robin-unread-messages" :style="{ 'background-color': backgroundColor }" data-testid="unread-count">
    {{ unread }}
  </div>
  <div v-else-if="unread > 9" class="robin-unread-messages" :style="{ 'background-color': backgroundColor }" data-testid="unread-count">9+</div>
  <div v-else class="robin-unread-messages" :style="{ 'background-color': backgroundColor }" data-testid="unread-count"></div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'

const ComponentProps = Vue.extend({
  props: {
    unread: {
      type: [Number, String],
      default: 0
    },
    backgroundColor: {
      type: String as PropType<string>,
      default: '#15AE73'
    }
  }
})

// eslint-disable-next-line
@Component<UnreadMessageCount>({
  name: 'UnreadMessageCount'
})
export default class UnreadMessageCount extends ComponentProps {}
</script>

<style scoped>
.robin-unread-messages {
  font-size: 0.875rem;
  border-radius: 20px;
  font-weight: 100;
  white-space: nowrap;
  width: 22px;
  height: 22px;
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
