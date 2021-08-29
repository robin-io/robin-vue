<template>
  <header>
    <div class="robin-card robin-flex robin-flex-align-center">
      <div class="robin-card-info robin-mr-16">
        <RAvatar />
      </div>
      <div class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-flex-1">
        <div class="robin-mt-6">
          <RText font-weight="normal" color="#000000" :font-size="16" :line-height="20">Adunoluwa Adeyemi</RText>
        </div>
        <div class="robin-mt-6">
          <RText as="p" font-weight="normal" color="#7A7A7A" :font-size="14" :line-height="18">Online</RText>
        </div>
      </div>
    </div>
    <div class="robin-ml-auto">
      <ROptionButton />
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import RAvatar from '@/components/ChatList/RAvatar/RAvatar.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import ROptionButton from '../ROptionButton/ROptionButton.vue'

export default Vue.extend({
  name: 'RHeader',
  components: {
    RAvatar,
    RText,
    ROptionButton
  }
})
</script>

<style scoped>
header {
  width: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 1.938rem 2.688rem 1.375rem 3.125rem;
}

.robin-pt-10 {
  padding-top: 0.625rem;
}

.robin-pb-11 {
  padding-bottom: 0.688rem;
}

.robin-card-container {
  width: 100%;
}

.robin-flex {
  display: flex;
}

.robin-flex-column {
  flex-direction: column;
}

.robin-flex-space-between {
  justify-content: space-between;
}

.robin-ml-auto {
  margin-left: auto;
}

.robin-mt-6 {
  margin-top: 0.375rem;
}

.robin-mr-16 {
  margin-right: 1rem;
}

.robin-ml-8 {
  margin-left: 0.5rem;
}

.robin-h-100 {
  height: 100%;
}

.robin-flex-align-center {
  align-items: center;
}

.robin-flex-1 {
  flex: 1;
}
</style>
