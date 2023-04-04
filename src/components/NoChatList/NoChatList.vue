<template>
  <div class="robin-no-chat-list-container">
    <header class="robin-header robin-flex robin-flex-align-center">
      <img
        v-if="$logo === ''"
        :data-src="assets[currentTheme === 'light' ? 'logo' : 'logo_dark']"
        alt="logo"
        class="lazyload blur-up"
      />
      <img v-else class="custom lazyload blur-up" :data-src="$logo" alt="logo" />

      <div class="robin-buttons robin-flex robin-flex-align-center">
        <icon-button
          name="edit"
          @edit="openEdit()"
          emit="edit"
          :to-emit="true"
          :to-click-away="false"
          :color="'#fff'"
          data-testid="edit"
          v-if="isCreateChatEnabled"
        />
        <slot name="chat-list-header"></slot>
      </div>
    </header>

    <div class="robin-wrapper robin-pl-16 robin-pr-16 robin-w-100">
      <search-bar :key="key" />
    </div>

    <div
      class="robin-wrapper robin-pl-16 robin-pr-16 robin-flex robin-flex-column robin-flex-align-center robin-h-100 robin-w-100 robin-flex-1 robin-pt-100"
    >
      <svg-icon name="nochat" />

      <div class="robin-mb-13 robin-mt-33">
        <message-content fontWeight="normal" color="#535F89">No Messages Yet</message-content>
      </div>

      <custom-button emit="newchat" @newchat="openEdit()" v-if="isCreateChatEnabled"
        >Start a chat</custom-button
      >
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import Content from '../Content/Content.vue'
import IconButton from '../IconButton/IconButton.vue'
import SearchBar from '../SearchBar/SearchBar.vue'
import Button from '../Button/Button.vue'
import SvgIcon from '../SvgIcon/SvgIcon.vue'
import assets from '@/utils/assets.json'

@Component({
  name: 'NoChatList',
  components: {
    'message-content': Content,
    IconButton,
    SearchBar,
    'custom-button': Button,
    SvgIcon
  }
})
export default class NoChatList extends Vue {
  key = 0 as number;

  get assets (): any {
    return assets
  }

  get isCreateChatEnabled () {
    return store.state.createChatEnabled
  }

  get currentTheme () {
    return store.state.currentTheme
  }

  openEdit (): void {
    this.$emit('opennewchatmodal', 'newchat')
    setTimeout(() => {
      this.refresh()
    }, 300)
  }

  refresh (): void {
    this.key += 1
  }
}
</script>
