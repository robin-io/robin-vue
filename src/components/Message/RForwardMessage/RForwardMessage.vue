<template>
  <div class="robin-shim">
    <div class="robin-modal-container robin-flex">
      <div class="robin-inner-container robin-flex robin-flex-column">
        <header class="robin-wrapper robin-mt-26 robin-mb-10">
          <RText text="Forward Message" />
        </header>

        <div class="robin-wrapper robin-mb-10">
          <RSearchBar placeholder="Search people or group..." />
        </div>

        <div>
          <RAlphabetBlock />
        </div>

        <div
          class="robin-card-container robin-flex robin-flex-column robin-grey-200"
        >
          <div class="robin-card robin-flex robin-flex-align-center">
            <div class="robin-card-info robin-mr-12">
              <RAvatar />
            </div>
            <div
              class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1"
            >
              <div class="robin-flex">
                <RText text="Temi Obadofin" :fontSize="14" :lineHeight="18" />
              </div>
              <div class="robin-ml-auto">
                <RCheckBox />
              </div>
            </div>
          </div>
          <div class="robin-card robin-flex robin-flex-align-center">
            <div class="robin-card-info robin-mr-12">
              <RAvatar />
            </div>
            <div
              class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1"
            >
              <div class="robin-flex">
                <RText text="Temi Obadofin" :fontSize="14" :lineHeight="18" />
              </div>
              <div class="robin-ml-auto">
                <RCheckBox />
              </div>
            </div>
          </div>
        </div>
        <div>
          <RAlphabetBlock text="B" />
        </div>

        <div
          class="robin-card-container robin-flex robin-flex-column robin-grey-200"
        >
          <div class="robin-card robin-flex robin-flex-align-center">
            <div class="robin-card-info robin-mr-12">
              <RAvatar />
            </div>
            <div
              class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1"
            >
              <div class="robin-flex">
                <RText text="Temi Obadofin" :fontSize="14" :lineHeight="18" />
              </div>
              <div class="robin-ml-auto">
                <RCheckBox />
              </div>
            </div>
          </div>
          <div class="robin-card robin-flex robin-flex-align-center">
            <div class="robin-card-info robin-mr-12">
              <RAvatar />
            </div>
            <div
              class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1"
            >
              <div class="robin-flex">
                <RText text="Temi Obadofin" :fontSize="14" :lineHeight="18" />
              </div>
              <div class="robin-ml-auto">
                <RCheckBox />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="robin-ml-16">
        <RCloseButton @close="$emit('closemodal')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RText from '@/components/ChatList/RText/RText.vue'
import RAvatar from '@/components/ChatList/RAvatar/RAvatar.vue'
import RCloseButton from '@/components/ChatList/RCloseButton/RCloseButton.vue'
import RSearchBar from '@/components/ChatList/RSearchBar/RSearchBar.vue'
import RAlphabetBlock from '@/components/ChatList/RAlphabetBlock/RAlphabetBlock.vue'
import RCheckBox from '@/components/ChatList/RCheckBox/RCheckBox.vue'

export default Vue.extend({
  name: 'RForwardMessage',
  components: {
    RText,
    RCloseButton,
    RAvatar,
    RAlphabetBlock,
    RSearchBar,
    RCheckBox
  }
})
</script>

<style scoped>
.robin-shim {
  width: 100%;
  height: 100%;
  background-color: rgba(107, 116, 145, 0.1);
  backdrop-filter: blur(3.8731px);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}

.robin-modal-container {
  width: max-content;
  margin: 6rem 0 0;
}

.robin-inner-container {
  width: 375px;
  /* height: 574px; */
  background-color: #fff;
  box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.06);
}

.robin-wrapper {
  padding: 0 1rem;
}

.robin-card-container {
  overflow-y: auto;
}

.robin-card-container .robin-card {
  border-bottom: 1px solid #f4f6f8;
  padding: 1rem 0 1.1rem;
  transition: all 0.15s;
  padding: 1rem 1.3rem;
}

.robin-card-container .robin-card:last-child {
  border-bottom: none;
}
</style>
