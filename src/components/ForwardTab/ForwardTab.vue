<template>
  <div class="robin-forward-tab">
    <message-content :color="currentTheme === 'light' ? '#7a7a7a' : '#B6B6B6'">
      {{ selectedMessages.length }} Messages Selected
    </message-content>
    <custom-button
      emit="clicked"
      v-show="selectedMessages.length > 0"
      @clicked="$emit('forward-message')"
    >
      Forward Messages
    </custom-button>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import store from '@/store/index'
import Component from 'vue-class-component'
import Content from '@/components/Content/Content.vue'
import Button from '@/components/Button/Button.vue'

const ComponentProps = Vue.extend({
  props: {
    selectedMessages: {
      type: Array as PropType<Array<ObjectType>>,
      default: () => []
    }
  }
})

@Component({
  name: 'ForwardTab',
  components: {
    'message-content': Content,
    'custom-button': Button
  }
})
export default class ForwardTab extends ComponentProps {
  get currentTheme () {
    return store.state.currentTheme
  }
}
</script>
