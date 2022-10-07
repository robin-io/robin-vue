<template>
  <div class="robin-shim robin-fadeIn" @click.self="closeModal()">
    <div class="robin-card">
      <div class="robin-head">
        <IconButton name="remove" @close="closeModal()" emit="close" :to-emit="true" :to-click-away="false" />
        <Content class="robin-ml-12"> Encryption Details</Content>
      </div>

      <div class="robin-details">
        <SvgIcon name="largeEncryption" />
        <Content class="robin-mt-27" text-align="center" as="span"> Your chat is fully encrypted </Content>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/store/index'
import Component from 'vue-class-component'
import IconButton from '@/components/IconButton/IconButton.vue'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import Content from '@/components/Content/Content.vue'

@Component({
  name: 'EncryptionDetails',
  components: {
    Content,
    IconButton,
    SvgIcon
  }
})
export default class GroupPrompt extends Vue {
  closeModal () {
    store.setState('encryptionDetailsOpen', false)
  }
}
</script>

<style scoped>
.robin-shim {
  width: 100%;
  height: 100vh;
  background-color: rgba(81, 84, 92, 0.4);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3;
  display: flex;
  justify-content: center;
  overflow-y: auto;
}

.robin-card {
  background-color: var(--rb-bg-color);
  border-radius: 10px;
  width: min(426px, 90%);
  height: 358px;
  padding: 1.063rem min(1.563rem, 2%) 1.063rem min(1.625rem, 2.1%);
  position: relative;
  margin-top: 4.063rem;
}

.robin-head {
  display: flex;
  align-items: center;
  padding: 1rem min(1.188rem, 1.188%) 1rem;
}

.robin-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
