<template>
  <div class="robin-page-loader robin-shim">
    <div class="robin-inner-shim">
      <div class="robin-loader-ctn">
        <div class="robin-loader"></div>
        <img class="robin-pulse-1" :src="assets['robin_icon']" alt="logo" />
      </div>
      <div class="robin-come-up robin-mt-18">
        <message-content as="h2" color="#fff" font-weight="'bold'" :font-size="24">
          Getting messages...
        </message-content>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import assets from '@/utils/assets.json'
import Content from '../Content/Content.vue'

@Component({
  name: 'PageLoader',
  components: {
    'message-content': Content
  }
})
export default class PageLoader extends Vue {
  get assets (): any {
    return assets
  }
}
</script>
