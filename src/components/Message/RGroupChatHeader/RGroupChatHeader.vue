<template>
  <header>
    <div class="robin-card robin-flex robin-flex-align-center">
      <div class="robin-card-info robin-mr-16">
        <RGroupAvatar v-if="conversation.isGroup" />
        <RAvatar v-else />
      </div>
      <div
        class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-flex-1"
      >
        <div class="robin-mt-6">
          <RText
            :text="
              conversation.senderToken == $user_token
                ? conversation.sender_name
                : conversation.receiver_name
            "
            fontWeight="normal"
            color="#000000"
            :fontSize="16"
            :lineHeight="20"
          />
        </div>
        <div class="robin-mt-6">
          <RText
            v-if="conversation.isGroup"
            as="p"
            text="53 Members"
            fontWeight="normal"
            color="#7A7A7A"
            :fontSize="14"
            :lineHeight="18"
          />
        </div>
      </div>
    </div>
    <div class="robin-ml-auto" @click="handleOpenPopUp()">
      <ROptionButton @clickoutside="handleClosePopUp()" />
    </div>
    <div class="robin-popup-container" v-show="popUpState.opened">
      <RGroupMessagePopOver ref="popup-1" v-if="conversation.isGroup" />
      <RPersonalMessagePopOver ref="popup-1" v-else />
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import RGroupAvatar from '@/components/ChatList/RGroupAvatar/RGroupAvatar.vue'
import RAvatar from '@/components/ChatList/RAvatar/RAvatar.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import ROptionButton from '../ROptionButton/ROptionButton.vue'
import RGroupMessagePopOver from '../RGroupMessagePopOver/RGroupMessagePopOver.vue'
import RPersonalMessagePopOver from '../RPersonalMessagePopOver/RPersonalMessagePopOver.vue'

interface PopUpState {
  opened: boolean
}

const ComponentProps = Vue.extend({
  props: {
    conversation: {
      type: Object,
      default: () => ({})
    }
  }
})

@Component({
  name: 'RGroupChatHeader',
  components: {
    RGroupAvatar,
    RText,
    ROptionButton,
    RAvatar,
    RGroupMessagePopOver,
    RPersonalMessagePopOver
  }
})
export default class RGroupChatHeader extends ComponentProps {
  popUpState: PopUpState = {
    opened: false
  }

  handleOpenPopUp (): void {
    const popup = this.$refs['popup-1'] as any
    popup.$refs['popup-body'].classList.remove('robin-zoomOut')

    this.popUpState.opened = true
  }

  handleClosePopUp (): void {
    const popup = this.$refs['popup-1'] as any
    popup.$refs['popup-body'].classList.add('robin-zoomOut')

    window.setTimeout(() => {
      const popup = this.$refs['popup-1'] as any
      popup.$refs['popup-body'].classList.remove('robin-zoomOut')

      this.popUpState.opened = false
    }, 300)
  }
}
</script>

<style scoped>
header {
  width: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 1.938rem 2.688rem 1.375rem 3.125rem;
  position: relative;
  z-index: 2;
}

.robin-card-container {
  width: 100%;
}

.robin-popup-container {
  position: absolute;
  top: 70px;
  right: 45px;
  z-index: 100;
}
</style>
