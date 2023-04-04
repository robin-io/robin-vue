<template>
  <div class="robin-box-search">
    <IconButton name="search" :to-click-away="false" :to-emit="false" />

    <input
      type="search"
      :placeholder="placeholder"
      autocomplete="off"
      class="robin-input"
      v-model="text"
      @input="userTyping()"
      @keyup.enter="userTyping()"
    />

    <div class="robin-spinner" v-show="loading"></div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import EventBus from '@/event-bus'
import IconButton from '../IconButton/IconButton.vue'

const ComponentProps = Vue.extend({
  props: {
    placeholder: {
      type: String as PropType<string>,
      default: 'Search Messages...'
    },
    loading: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  }
})

@Component({
  name: 'SearchBar',
  components: {
    IconButton
  }
})
export default class RSeachBar extends ComponentProps {
  text = '';

  userTyping (): void {
    this.$emit('user-typing', this.text)
  }

  created () {
    this.resetSearchText()
  }

  resetSearchText (): void {
    EventBus.$on('search-text.reset', () => {
      if (this.text !== '') {
        this.text = ''
        this.userTyping()
      }
    })
  }
}
</script>
