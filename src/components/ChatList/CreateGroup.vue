<template>
  <div class="robin-shim robin-flex-justify-end">
    <div class="robin-modal-container robin-flex robin-fadeIn" ref="popup-1">
      <div class="robin-inner-container robin-flex robin-flex-column">
        <header class="robin-flex robin-flex-justify-end" :class="groupName.trim().length > 0 ? 'robin-pulse' : 'robin-invisible'">
            <RTextButton text="Create Group" :emit="'clicked'" @clicked="createGroupConversation()" v-show="!isLoading" />
            <div class="robin-spinner" v-show="isLoading"></div>
        </header>

        <!-- <div class="robin-wrapper robin-flex robin-flex-column robin-flex-align-center robin-mt-21">
          <RGroupAvatar />
          <div class="robin-mt-10">
            <RTextButton text="Add Group Image" :font-size="14" />
          </div>
        </div> -->

        <div class="robin-wrapper robin-border-top robin-mt-21 robin-pb-52 robin-pt-15">
          <div class="robin-pb-10">
            <RText as="label" color="#000" :font-size="14">Group Name</RText>
          </div>
          <RInput @user-typing="userTyping" />
        </div>

        <div class="robin-wrapper robin-mb-5">
          <RText color="#7A7A7A" :font-size="12" as="span">{{ users.length }} {{ users.length > 1 ? 'Members' : 'Member' }}</RText>
        </div>

        <div class="robin-wrapper robin-card-container robin-h-100 robin-flex robin-flex-1 robin-flex-column">
          <div v-for="user in users" :key="user.userToken" class="robin-card robin-flex robin-flex-align-center">
            <div class="robin-card-info robin-mr-12">
              <RAvatar />
            </div>
            <div class="robin-card-info robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1">
              <div class="robin-flex">
                <RText :font-size="14" :line-height="18">{{ user.userName }}</RText>
              </div>
              <div class="robin-ml-auto">
                <RRemoveButton @clicked="$emit('remove-user', user)" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="robin-wrapper robin-ml-16">
        <RCloseButton @close="closeModal()" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import RText from './RText/RText.vue'
import RTextButton from './RTextButton/RTextButton.vue'
import RAvatar from './RAvatar/RAvatar.vue'
import EventBus from '@/event-bus'
// import RGroupAvatar from './RGroupAvatar/RGroupAvatar.vue'
import RCloseButton from './RCloseButton/RCloseButton.vue'
import RInput from './RInput/RInput.vue'
import RRemoveButton from './RRemoveButton/RRemoveButton.vue'

const ComponentProps = Vue.extend({
  props: {
    users: {
      type: Array as PropType<Array<any>>,
      default: () => []
    }
  }
})

@Component({
  name: 'RobinChatContainer',
  components: {
    RText,
    RTextButton,
    RCloseButton,
    RAvatar,
    // RGroupAvatar,
    RInput,
    RRemoveButton
  }
})
export default class CreateGroup extends ComponentProps {
  groupName = '' as string
  isLoading = false as boolean

  userTyping (val: string): void {
    this.groupName = val
  }

  async createGroupConversation (): Promise<void> {
    this.isLoading = true
    const res = await this.$robin.createGroupConversation(this.groupName, { user_token: this.$user_token }, this.users)
    if (!res.error) {
      EventBus.$emit('group-conversation-created', res.data)
      this.$emit('changesidebartype', 'primary')
      this.$emit('closemodal')
      this.isLoading = false
    }
  }

  closeModal () {
    console.log(this.$refs)
    const popup = this.$refs['popup-1'] as any
    popup.classList.remove('robin-fadeIn')
    popup.classList.add('robin-fadeOut')

    window.setTimeout(() => {
      const popup = this.$refs['popup-1'] as any
      popup.classList.remove('robin-fadeOut')
      popup.classList.add('robin-fadeIn')

      this.groupName = ''
      this.$emit('closemodal')
    }, 100)
  }
}
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

header {
  width: 100px;
  display: flex;
  justify-content: center;
  align-self: flex-end;
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

.robin-spinner {
  width: 19px;
  height: 19px;
}

@media (min-width: 768px) {
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-track {
    /* border: 1px solid #00000017; */
    border-radius: 24px;
  }

  ::-webkit-scrollbar-thumb {
    width: 2px;
    background-color: #d6d6d6;
    border-radius: 24px;
    -webkit-border-radius: 24px;
    -moz-border-radius: 24px;
    -ms-border-radius: 24px;
    -o-border-radius: 24px;
  }
}
</style>
