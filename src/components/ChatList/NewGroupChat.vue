<template>
  <div class="robin-side-container" ref="popup-body">
    <header class="robin-header robin-mb-33">
      <IconButton name="remove" emit="close" :to-emit="true" :to-click-away="false" @close="openPreviousModal()" />

      <RText font-weight="400" :font-size="16" class="robin-ml-12">New Group Chat</RText>

      <div class="robin-ml-auto">
        <RButton emit="done" @done="openGroupChatList()" v-show="groupName.length > 0" class="robin-pulse-2">Done</RButton>
      </div>
    </header>

    <RText as="label" for-ref="group-icon-upload" class="robin-clickable">
      <div class="robin-group-image robin-mb-7" v-show="!groupIcon.name">
        <input type="file" :accept="acceptedVisualFiles" @change="handleFileChange($event.target.files)" @click="resetFileTarget($event)" id="group-icon-upload" />
        <RText color="#fff" :fontSize="24">RG</RText>
      </div>

      <img class="robin-group-image robin-mb-7" :src="groupIcon.localUrl" :alt="groupIcon.name" v-show="groupIcon.name">

      <RText fontWeight="400" :fontSize="14" class="robin-mb-32">Tap To Add Group Image</RText>
    </RText>

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
  groupIcon = {} as any
  acceptedVisualFiles = 'image/png, image/jpg, image/jpeg' as string

  userTyping (val: string): void {
    this.groupName = val
  }

  openPreviousModal (): void {
    this.$emit('closemodal', 'newchat')
  }

  openGroupChatList (): void {
    this.$emit('openmodal', 'newgroupchat')
    this.$emit('set-groupicon', this.groupIcon)
    this.$emit('set-groupname', this.groupName)
  }

  resetFileTarget (event: any): void {
    event.target.value = ''
  }

  handleFileChange (file: any): void {
    const fileURL = URL.createObjectURL(file[0])
    const typeIndex = file[0].name.lastIndexOf('.')

    if (file[0].size < 5000001) {
      this.groupIcon = {
        name: file[0].name.substring(0, typeIndex),
        size: file[0].size,
        type: file[0].type,
        extension: file[0].name.substring(typeIndex + 1),
        localUrl: fileURL,
        file: file[0]
      }
    } else {
      this.$toast.open({
        message: 'Image upload cannot be more than 5mb',
        type: 'error',
        position: 'bottom-left'
      })
    }
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

.robin-side-container >>> label {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.robin-contact-container {
  width: 100%;
}

div.robin-group-image {
  background-color: #9999bc;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

img.robin-group-image {
  width: 80px;
  min-height: 80px;
  max-height: 80px;
  border-radius: 50%;
  background-color: #9999bc;
  object-fit: cover;
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

input[type='file'] {
  display: none;
  width: 0;
  height: 0;
}

input[type='file']::file-upload-button {
  display: none;
  width: 0;
  height: 0;
}

input[type='file']::-webkit-file-upload-button {
  display: none;
  width: 0;
  height: 0;
}

input[type='file']::-moz-file-upload-button {
  display: none;
  width: 0;
  height: 0;
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
