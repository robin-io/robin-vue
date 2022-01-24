<template>
  <div class="robin-side-container" ref="popup-body">
    <header class="robin-header robin-mb-33">
      <IconButton name="remove" emit="close" :to-emit="true" :to-click-away="false" @close="openPreviousModal()" />

      <RText font-weight="400" :font-size="16" class="robin-ml-12">New Group Chat</RText>

      <div class="robin-ml-auto">
        <RButton emit="done" @done="openGroupChatList()" v-show="groupName.length > 0" class="robin-pulse-2">Done</RButton>
      </div>
    </header>

    <div class="robin-group-image robin-mb-7">
        <RText color="#fff" :fontSize="24">RG</RText>
    </div>

    <RText fontWeight="400" :fontSize="14" class="robin-mb-32">Tap To Add Group Image</RText>

    <div class="robin-wrapper robin-w-100">
      <RText fontWeight="400" :fontSize="14" class="robin-mb-8">Group Name</RText>

      <RInput @user-typing="userTyping" placeholder="Robin Group" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import IconButton from '../IconButton/IconButton.vue'
import RText from './RText/RText.vue'
import RInput from './RInput/RInput.vue'
import RButton from './RButton/RButton.vue'
import RGroupAvatar from './RGroupAvatar/RGroupAvatar.vue'

// eslint-disable-next-line
@Component({
  name: 'NewGroupChat',
  components: {
    RText,
    RInput,
    RButton,
    RGroupAvatar,
    IconButton
  }
})
export default class NewGroupChatList extends Vue {
  groupName = ''

  userTyping (val: string): void {
    this.groupName = val
  }

  openPreviousModal (): void {
    this.$emit('closemodal', 'newchat')
  }

  openGroupChatList (): void {
    this.$emit('openmodal', 'newgroupchat')
    this.$emit('set-groupname', this.groupName)
  }
}
</script>

<style scoped>
.robin-side-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0px 2px 20px rgba(0, 104, 255, 0.06);
  position: absolute;
  top: 0;
  z-index: 2;
  background-color: #fff;
}

header {
  width: 100%;
  display: flex;
  align-items: center;
  padding: clamp(10%, 4vh, 3.563rem) clamp(2%, 4vw, 1.5rem) 1.5rem;
}

.robin-contact-container {
  width: 100%;
}

.robin-group-image {
  background-color: #9999bc;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.robin-wrapper {
  padding: 0 clamp(2%, 4vw, 1.5rem);
}

.robin-card-container {
  width: 100%;
}

.robin-contact-container:nth-child(3) {
  margin-top: 2.375rem;
}

.robin-card-container .robin-card {
  border-bottom: 1px solid #f4f6f8;
  padding: 1rem 0 1.1rem;
  transition: all 0.15s;
}

.robin-card-container:last-child .robin-card {
  border-bottom: none;
}

.robin-alphabet-block {
  width: 100%;
  padding: 0 1.5rem;
  height: 28px;
  background-color: #f3f3f3;
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
