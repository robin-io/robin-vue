<template>
  <div class="robin-side-container">
    <header class="robin-header">
      <RText font-weight="400" color="rgba(83, 95, 137, 1)" :font-size="17">New Chat</RText>
      <RTextButton text="Done" emit="done" @done="modalOpen = true" />
    </header>
    <div class="robin-wrapper robin-w-100">
      <RSearchBar />
    </div>
    <div class="robin-w-100 robin-mt-38">
      <RAlphabetBlock />
    </div>
    <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-grey-200">
      <div class="robin-card robin-flex robin-flex-align-center">
        <div class="robin-card-info robin-mr-12">
          <RAvatar />
        </div>
        <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1">
          <div class="robin-flex">
            <RText :font-size="14" :line-height="18">Temi Obadofin</RText>
          </div>
          <div class="robin-ml-auto">
            <RCheckBox />
          </div>
        </div>
      </div>
    </div>
    <RAlphabetBlock text="B" />
    <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-grey-200">
      <div class="robin-card robin-flex robin-flex-align-center">
        <div class="robin-card-info robin-mr-12">
          <RAvatar />
        </div>
        <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1">
          <div class="robin-flex">
            <RText :font-size="14" :line-Height="18">Temi Obadofin</RText>
          </div>
          <div class="robin-ml-auto">
            <RCheckBox />
          </div>
        </div>
      </div>
    </div>
    <CreateGroup v-show="modalOpen" @closemodal="closeModal()" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RText from './RText/RText.vue'
import RSearchBar from './RSearchBar/RSearchBar.vue'
import RTextButton from './RTextButton/RTextButton.vue'
import RAvatar from './RAvatar/RAvatar.vue'
import RCheckBox from './RCheckBox/RCheckBox.vue'
import CreateGroup from './CreateGroup.vue'
import RAlphabetBlock from './RAlphabetBlock/RAlphabetBlock.vue'

export default Vue.extend({
  name: 'RSideContainer',
  components: {
    RText,
    RSearchBar,
    RTextButton,
    RAvatar,
    RCheckBox,
    CreateGroup,
    RAlphabetBlock
  },
  data: () => ({
    modalOpen: false
  }),
  methods: {
    closeModal(): void {
      this.$emit('changesidebartype', 'primary')
      this.modalOpen = false
    }
  }
})
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
  padding: 0 1.5rem;
}

.robin-card-container {
  width: 100%;
}

.robin-card-container .robin-card {
  border-bottom: 1px solid #f4f6f8;
  padding: 1rem 0 1.1rem;
  transition: all 0.15s;
}

.robin-card-container:last-child .robin-card {
  border-bottom: none;
}

.robin-alphabet-block {
  width: 100%;
  padding: 0 1.5rem;
  height: 28px;
  background-color: #f3f3f3;
}
</style>
