<template>
  <div class="robin-encryption-details robin-shim robin-fadeIn" @click.self="closeModal()">
    <div class="robin-card">
      <div class="robin-head">
        <icon-button
          name="remove"
          @close="closeModal()"
          emit="close"
          :to-emit="true"
          :to-click-away="false"
        />
        <message-content class="robin-ml-12"> Encryption Details</message-content>
      </div>

      <div class="robin-details">
        <svg-icon name="largeEncryption" />
        <message-content class="robin-mt-27" text-align="center" as="span">
          Your chat is fully encrypted
        </message-content>
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
    'message-content': Content,
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
