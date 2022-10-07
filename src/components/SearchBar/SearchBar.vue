<template>
  <div class="robin-box-search">
    <IconButton name="search" :to-click-away="false" :to-emit="false" />

    <input type="search" :placeholder="placeholder" autocomplete="off" class="robin-input" v-model="text" @input="userTyping()" @keyup.enter="userTyping()" />

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
  text = ''

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

<style scoped>
/* Input styles */
.robin-box-search {
  width: 100%;
  height: 44px;
  background-color: var(--rb-color6);
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 0.2rem 0 1rem;
  transition: all 0.1s;
}

.robin-input {
  width: 86%;
  height: 100%;
  background-color: transparent;
  caret-color: var(--rb-color7);
  color: var(--rb-color7);
  border: none;
  font-size: 0.875rem;
  padding-left: 1rem;
}

/* Input focus */
.robin-input:focus {
  outline: none;
}

.robin-spinner {
  width: 17px;
  height: 17px;
  margin-left: auto;
}

/* Input placeholder */
::placeholder {
  color: #8D9091;
}

::-moz-placeholder {
  color: #8D9091;
}

:-ms-input-placeholder {
  color: #8D9091;
}

::-ms-input-placeholder {
  color: #8D9091;
}

::-webkit-search-cancel-button {
  appearance: none;
  -webkit-appearance: none;
}
</style>
