<template>
  <div class="robin-side-container">
    <header class="robin-header robin-flex robin-flex-align-center">
      <img v-if="$logo === ''" :src="assets['logo']" alt="logo" />
      <img v-else class="custom" :src="$logo" alt="logo" />

      <div class="robin-buttons robin-flex robin-flex-align-center">
        <IconButton name="edit" @edit="openEdit()" emit="edit" :to-emit="true" :to-click-away="false" :color="'#fff'" data-testid="edit" v-if="isCreateChatEnabled" />
        <slot name="chat-list-header"></slot>
      </div>
    </header>

    <div class="robin-wrapper robin-pl-16 robin-pr-16 robin-w-100">
      <SearchBar :key="key" />
    </div>

    <div class="robin-wrapper robin-pl-16 robin-pr-16 robin-flex robin-flex-column robin-flex-align-center robin-h-100 robin-w-100 robin-flex-1 robin-pt-100">
      <SvgIcon name="nochat" />

      <div class="robin-mb-13 robin-mt-33">
        <Content fontWeight="normal" color="#535F89">No Messages Yet</Content>
      </div>

      <Button emit="newchat" @newchat="openEdit()" v-if="isCreateChatEnabled">Start a chat</Button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import Content from '../Content/Content.vue'
import IconButton from '../IconButton/IconButton.vue'
// import REditButton from './REditButton/REditButton.vue'
import SearchBar from '../SearchBar/SearchBar.vue'
import Button from '../Button/Button.vue'
import SvgIcon from '../SvgIcon/SvgIcon.vue'
import assets from '@/utils/assets.json'

@Component({
  name: 'NoChatList',
  components: {
    Content,
    IconButton,
    // REditButton,
    SearchBar,
    Button,
    SvgIcon
  }
})

export default class NoChatList extends Vue {
  key = 0 as number

  get assets (): any {
    return assets
  }

  get isCreateChatEnabled () {
    return store.state.createChatEnabled
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

<style scoped>
.robin-side-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  box-shadow: 0px 2px 20px rgba(0, 104, 255, 0.06);
  overflow-y: auto;
}

.robin-header {
  width: 100%;
  justify-content: space-between;
  padding: clamp(6%, 2vh, 3.563rem) clamp(2%, 4vw, 1.563rem) 1.763rem;
}

.robin-header img.custom:first-child {
  width: 36px;
  height: 36px;
}

.robin-wrapper:last-child {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}
</style>
