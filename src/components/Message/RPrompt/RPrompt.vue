<template>
  <div class="robin-shim robin-fadeIn" ref="popup-2" @click.self="closeModal()">
    <div class="robin-card">
      <div class="robin-wrapper">
        <RText :font-size="17" :font-weight="'500'" class="robin-mb-11"> {{ getHeaderDialog() }} </RText>

        <RText color="#51545C" text-wrap="normal" text-align="center"> Are you sure you want to proceed? </RText>
      </div>

      <div class="robin-button-container">
        <button class="robin-button cancel" @click="$emit('closemodal')">
          <RText color="#D53120">Cancel</RText>
        </button>

        <button class="robin-button proceed" @click="$emit('proceed')">
          <RText color="#15AE73">Proceed</RText>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import RText from '@/components/ChatList/RText/RText.vue'
import IconButton from '../../IconButton/IconButton.vue'

const ComponentProps = Vue.extend({
  props: {
    status: {
      type: String,
      default: ''
    }
  }
})

@Component({
  name: 'RPrompt',
  components: {
    RText,
    IconButton
  }
})
export default class RPrompt extends ComponentProps {
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
    } else {
      return 'Remove Participant'
    }
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
  align-items: flex-start;
  overflow-y: auto;
}

.robin-card {
  background-color: #fff;
  border-radius: 10px;
  width: 264px;
  margin-top: 13.688%;
}

.robin-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem clamp(3%, 5vw, 1.063rem) 2.375rem clamp(3%, 5vw, 0.563rem);
}

.robin-button-container {
  width: 100%;
  border-top: 1px solid #cccccc;
  display: flex;
}

.robin-button {
  width: 100%;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.robin-button-container .robin-button:first-child {
  border-right: 0.5px solid rgba(60, 60, 67, 0.36);
}
</style>
