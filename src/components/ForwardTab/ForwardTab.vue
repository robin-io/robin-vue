<template>
  <div class="robin-forward-tab">
      <content color="#51545C"> {{ selectedMessages.length }} Messages Selected </content>
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
import Component from 'vue-class-component'
import Content from '@/components/Content/Content.vue'
import Button from '@/components/Button/Button.vue'

const ComponentProps = Vue.extend({
  props: {
    selectedMessages: {
      type: Object as PropType<ObjectType>,
      default: () => ({})
    }
  }
})

@Component({
  name: 'ForwardTab',
  components: {
    Content,
    'custom-button': Button
  }
})
export default class ForwardTab extends ComponentProps {
}
</script>
