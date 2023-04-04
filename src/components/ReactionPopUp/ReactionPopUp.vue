<template>
  <div class="robin-reaction-popup robin-zoomIn" id="reaction-pop-up">
    <div class="robin-wrapper">
      <Button :font-size="18" emit="click" @click="$emit('reaction', '❤️')" data-testid="heart"
        >❤️</Button
      >
      <Button :font-size="18" emit="click" @click="$emit('reaction', '👍')" data-testid="thumbs-up"
        >👍</Button
      >
      <Button
        :font-size="18"
        emit="click"
        @click="$emit('reaction', '👎')"
        data-testid="thumbs-down"
        >👎</Button
      >
      <Button :font-size="18" emit="click" @click="$emit('reaction', '😂')" data-testid="laughter"
        >😂</Button
      >
      <Button
        :font-size="18"
        color="initial"
        emit="click"
        @click="$emit('reaction', '⁉️')"
        data-testid="question"
        >⁉️</Button
      >
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Button from '@/components/Button/Button.vue'

@Component({
  name: 'ReactionPopOver',
  components: {
    Button
  }
})
export default class ReactionPopUp extends Vue {}
</script>
