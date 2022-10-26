<template>
  <div class="robin-prompt robin-shim robin-fadeIn" ref="popup-2" @click.self="closeModal()">
    <div class="robin-card">
      <div class="robin-wrapper">
        <message-content :font-size="17" :font-weight="'500'" class="robin-mb-11">
          {{ getHeaderDialog() }}
        </message-content>

        <message-content
          :color="currentTheme === 'light' ? '#51545C' : '#B6B6B6'"
          text-wrap="normal"
          text-align="center"
        >
          Are you sure you want to proceed?
        </message-content>
      </div>

      <div class="robin-button-container">
        <button
          class="robin-button cancel"
          @click="$emit('closemodal')"
          data-testid="cancel-button"
        >
          <message-content color="#D53120">Cancel</message-content>
        </button>

        <button class="robin-button proceed" @click="$emit('proceed')" data-testid="proceed-button">
          <message-content color="#15AE73">Proceed</message-content>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import Content from '@/components/Content/Content.vue'

const ComponentProps = Vue.extend({
  props: {
    status: {
      type: String,
      default: ''
    }
  }
})

@Component({
  name: 'Prompt',
  components: {
    'message-content': Content
  }
})
export default class Prompt extends ComponentProps {
  get currentTheme () {
    return store.state.currentTheme
  }

  closeModal () {
    const popup = this.$refs['popup-2'] as any
    popup.classList.remove('robin-fadeIn')
    popup.classList.add('robin-fadeOut')

    window.setTimeout(() => {
      const popup = this.$refs['popup-2'] as any
      popup.classList.remove('robin-fadeOut')
      popup.classList.add('robin-fadeIn')

      this.$emit('closemodal')
    }, 100)
  }

  getHeaderDialog () {
    if (this.status === 'delete message') {
      return 'Delete Message'
    } else if (this.status === 'exit group') {
      return 'Exit Group'
    } else if (this.status === 'clear messages') {
      return 'Clear Messages'
    } else if (this.status === 'delete select') {
      return 'Delete Messages'
    } else {
      return 'Remove Participant'
    }
  }
}
</script>
