<template>
  <div class="robin-moderated-word robin-shim robin-fadeIn" @click.self="closeModal()">
    <div class="robin-card">
      <div class="robin-head">
        <message-content :font-size="20">Moderated Word</message-content>
      </div>

      <div class="robin-details">
        <svg-icon name="largeEncryption" />
        <message-content :font-size="18" class="robin-mt-24" text-align="center" text-wrap="normal" as="span">
          You’ve used a blocked word in your conversation, which won’t be sent.
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
  components: {
    name: 'ModeratedWord',
    'message-content': Content,
    IconButton,
    SvgIcon
  }
})
export default class ModeratedWord extends Vue {
  closeModal () {
    store.setState('moderatedWordFound', false)
  }
}
</script>
