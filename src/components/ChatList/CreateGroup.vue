<template>
  <div class="robin-shim robin-flex-justify-end">
    <div class="robin-modal-container robin-flex">
      <div class="robin-inner-container robin-flex robin-flex-column">
        <header class="robin-flex robin-flex-justify-end">
          <RTextButton text="Create Group" />
        </header>

        <div
          class="robin-wrapper robin-flex robin-flex-column robin-flex-align-center robin-mt-21"
        >
          <RGroupAvatar />
          <div class="robin-mt-10">
            <RTextButton text="Add Group Image" :fontSize="14" />
          </div>
        </div>

        <div
          class="robin-wrapper robin-border-top robin-mt-21 robin-pb-52 robin-pt-15"
        >
          <div class="robin-pb-10">
            <RText as="label" text="Group Name" color="#000" :fontSize="14" />
          </div>
          <RInput />
        </div>

        <div class="robin-wrapper robin-mb-5">
          <RText text="5 Members" color="#7A7A7A" :fontSize="12" as="span" />
        </div>

        <div
          class="robin-wrapper robin-card-container robin-h-100 robin-flex robin-flex-1 robin-flex-column"
        >
          <div class="robin-card robin-flex robin-flex-align-center">
            <div class="robin-card-info robin-mr-12">
              <RAvatar />
            </div>
            <div
              class="robin-card-info robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1"
            >
              <div class="robin-flex">
                <RText text="Temi Obadofin" :fontSize="14" :lineHeight="18" />
              </div>
              <div class="robin-ml-auto">
                <RRemoveButton />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="robin-wrapper robin-ml-16">
        <RCloseButton @close="$emit('closemodal')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RText from './RText/RText.vue'
import RTextButton from './RTextButton/RTextButton.vue'
import RAvatar from './RAvatar/RAvatar.vue'
import RGroupAvatar from './RGroupAvatar/RGroupAvatar.vue'
import RCloseButton from './RCloseButton/RCloseButton.vue'
import RInput from './RInput/RInput.vue'
import RRemoveButton from './RRemoveButton/RRemoveButton.vue'

export default Vue.extend({
  name: 'RobinChatContainer',
  components: {
    RText,
    RTextButton,
    RCloseButton,
    RAvatar,
    RGroupAvatar,
    RInput,
    RRemoveButton
  }
})
</script>

<style scoped>
.robin-shim {
  width: 100vw;
  height: 100vh;
  background-color: rgba(107, 116, 145, 0.1);
  backdrop-filter: blur(3.8731px);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  display: flex;
  padding: 8vh 20vw 3rem 0;
  align-items: flex-start;
  overflow-y: auto;
}

.robin-modal-container {
  width: max-content;
}

.robin-inner-container {
  width: 420px;
  height: 674px;
  background-color: #fff;
  box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.06);
  padding: 1.625rem 1rem;
}

.robin-card-container {
  overflow-y: auto;
}

.robin-card-container .robin-card {
  border-bottom: 1px solid #f4f6f8;
  padding: 1rem 0 1.1rem;
  transition: all 0.15s;
}

.robin-card-container .robin-card:last-child {
  border-bottom: none;
}
</style>
