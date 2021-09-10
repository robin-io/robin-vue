<template>
  <div class="robin-box-search">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#566BA0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M17.5 17.5L13.875 13.875" stroke="#566BA0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <input type="search" :placeholder="placeholder" autocomplete="off" class="robin-input" v-model="text" @keyup.enter="userTyping()" />
    <div class="robin-spinner" v-show="loading"></div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'

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
  name: 'RSearchBar'
})
export default class RSeachBar extends ComponentProps {
  text = ''

  userTyping(): void {
    this.$emit('user-typing', this.text)
  }
}
</script>

<style scoped>
/* Input styles */
.robin-box-search {
  width: 100%;
  height: 44px;
  background-color: #f4f6f8;
  border: 1px solid rgba(35, 107, 248, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 0.2rem 0 1rem;
  transition: all 0.1s;
}

.robin-box-search:focus-within {
  background-color: #fff;
  box-shadow: 0px 0px 0px 1px rgba(35, 107, 248, 0.2);
}

.robin-input {
  width: 86%;
  height: 100%;
  background-color: transparent;
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
}

/* Input placeholder */
::placeholder {
  color: #bbc1d6;
}

::-moz-placeholder {
  color: #bbc1d6;
}

:-ms-input-placeholder {
  color: #bbc1d6;
}

::-ms-input-placeholder {
  color: #bbc1d6;
}

::-webkit-search-cancel-button {
  -webkit-appearance: none;
}
</style>
