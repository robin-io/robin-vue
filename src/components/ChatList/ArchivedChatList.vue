<template>
  <div class="robin-side-container">
    <header class="robin-header">
      <RText fontWeight="400" color="rgba(83, 95, 137, 1)" :fontSize="17"> Archived Chats </RText>
      <RCloseButton @close="$emit('changesidebartype', 'primary')" />
    </header>
    <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-mt-75">
      <div class="robin-card robin-flex robin-flex-align-center">
        <div class="robin-card-info robin-mr-12">
          <RAvatar />
        </div>
        <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-pt-4 robin-pb-4˝ robin-flex-1">
          <div class="robin-flex robin-flex-space-between">
            <RText fontWeight="normal" color="#000000" :fontSize="16" :lineHeight="20"> Users Name </RText>

            <RText as="p" fontWeight="normal" color="#566BA0" :fontSize="8" :lineHeight="18"> Yesterday </RText>
          </div>
          <div class="robin-flex robin-flex-space-between">
            <RText as="p" fontWeight="normal" color="#7A7A7A" :fontSize="12" :lineHeight="18"> We believe life is vast, and... </RText>

            <RText as="p" fontWeight="normal" color="#15AE73" :fontSize="8"> Archived </RText>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RText from './RText/RText.vue'
import RCloseButton from './RCloseButton/RCloseButton.vue'
import RAvatar from './RAvatar/RAvatar.vue'

export default Vue.extend({
  name: 'RSideContainer',
  components: {
    RText,
    RCloseButton,
    RAvatar
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

.robin-card:hover {
  background-color: #f0f3f5;
  border-radius: 4px;
  cursor: pointer;
  /* padding: 1rem 0.75rem 1.1rem; */
}

@media (min-width: 768px) {
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-track {
    /* border: 1px solid #00000017; */
    border-radius: 24px;
  }

  ::-webkit-scrollbar-thumb {
    width: 2px;
    background-color: #d6d6d6;
    border-radius: 24px;
    -webkit-border-radius: 24px;
    -moz-border-radius: 24px;
    -ms-border-radius: 24px;
    -o-border-radius: 24px;
  }
}
</style>
