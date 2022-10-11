<template>
    <header class="robin-header">
      <img
        v-if="$logo === ''"
        :src="assets[currentTheme === 'light' ? 'logo' : 'logo_dark']"
        alt="logo"
      />
      <img v-else class="custom" :src="$logo" alt="logo" />

      <div class="robin-wrapper">
        <IconButton
          name="edit"
          @edit="$emit('open-edit')"
          emit="edit"
          :to-emit="true"
          :to-click-away="false"
          :color="'#fff'"
          v-if="isCreateChatEnabled"
        />
        <slot name="chat-list-header"></slot>
      </div>
    </header>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import assets from '@/utils/assets.json'
import IconButton from '../IconButton/IconButton.vue'
import Button from '../Button/Button.vue'
import Avatar from '../Avatar/Avatar.vue'

const ComponentProps = Vue.extend({
  props: {}
})

// eslint-disable-next-line
@Component<ChatListHeader>({
  name: 'PrimaryChatList',
  components: {
    IconButton,
    Button,
    Avatar
  }
})
export default class ChatListHeader extends ComponentProps {
  get isCreateChatEnabled () {
    return store.state.createChatEnabled
  }

  get assets (): any {
    return assets
  }

  get currentTheme () {
    return store.state.currentTheme
  }
}
</script>
