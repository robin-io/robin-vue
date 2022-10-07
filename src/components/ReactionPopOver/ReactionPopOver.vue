<template>
  <div class="robin-popup robin-zoomIn" ref="popup-body">
    <div class="robin-reaction-container">
      <Button :font-size="18" emit="click" @click="$emit('reaction', '❤️')" data-testid="heart">❤️</Button>
      <Button :font-size="18" emit="click" @click="$emit('reaction', '👍')" data-testid="thumbs-up">👍</Button>
      <Button :font-size="18" emit="click" @click="$emit('reaction', '👎')" data-testid="thumbs-down">👎</Button>
      <Button :font-size="18" emit="click" @click="$emit('reaction', '😂')" data-testid="laughter">😂</Button>
      <Button :font-size="18" color="initial" emit="click" @click="$emit('reaction', '⁉️')" data-testid="question">⁉️</Button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import Button from '@/components/Button/Button.vue'

const ComponentProps = Vue.extend({
  props: {
    id: {
      type: String as PropType<string>,
      default: ''
    },
    message: {
      type: [Object, Array],
      default: () => {}
    }
  }
})

@Component({
  name: 'ReactionPopOver',
  components: {
    Button
  }
})
export default class ReactionPopOver extends ComponentProps {
}
</script>

<style scoped>
.robin-popup {
  width: 200px;
  max-width: 220px;
  padding: 0.349rem 0.925rem 0.349rem 0.649rem;
  border-radius: 24px;
  background-color: var(--rb-color14);
  position: relative;
}

.robin-popup::before {
  content: '';
  position: absolute;
  bottom: -3px;
  right: 100px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--rb-color14);
}

.robin-popup::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 85px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--rb-color14);
}

.robin-reaction-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem 0 0;
}

.robin-reaction-container >>> .robin-button:hover {
  transform: scale(1.2);
}
</style>
