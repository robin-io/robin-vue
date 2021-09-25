<template>
  <div class="robin-side-container">
    <header class="robin-header">
      <RText font-weight="400" color="rgba(83, 95, 137, 1)" :font-size="17"> Settings </RText>
      <REditButton @edit="$emit('openmodal', 'newchat')" />
    </header>
    <div class="robin-wrapper robin-w-100">
      <RSearchBar />
    </div>
    <div class="robin-wrapper robin-flex robin-flex-column robin-flex-align-center robin-h-100 robin-w-100 robin-flex-1 robin-pt-100">
      <RNoChatIcon />
      <div class="robin-mb-13 robin-mt-33">
        <RText fontWeight="normal" color="#535F89">No Messages Yet</RText>
      </div>
      <RButton emit="newchat" @newchat="$emit('openmodal', 'newchat')">Start a chat</RButton>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import RText from './RText/RText.vue'
import REditButton from './REditButton/REditButton.vue'
import RSearchBar from './RSearchBar/RSearchBar.vue'
import RButton from './RButton/RButton.vue'
import RNoChatIcon from './RNoChatIcon/RNoChatIcon.vue'

@Component({
  name: 'NoChatList',
  components: {
    RText,
    REditButton,
    RSearchBar,
    RButton,
    RNoChatIcon
  }
})

export default class NoChatList extends Vue {
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
}

header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 3.563rem 1.5rem 1.5rem;
}

.robin-wrapper {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
</style>
