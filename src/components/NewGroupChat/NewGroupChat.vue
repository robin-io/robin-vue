<template>
  <div class="robin-new-group-chat-container" ref="popup-body">
    <header class="robin-header">
      <icon-button
        name="remove"
        emit="close"
        :to-emit="true"
        :to-click-away="false"
        @close="openPreviousModal()"
      />

      <message-content
        font-weight="400"
        :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'"
        :font-size="16"
        class="robin-ml-12"
        >New Group Chat</message-content
      >

      <div class="robin-ml-auto">
        <custom-button
          emit="done"
          @done="openGroupChatList()"
          v-show="name.length > 0"
          class="robin-pulse-2"
          >Done</custom-button
        >
      </div>
    </header>

    <message-content as="label" for-ref="group-icon-upload" class="robin-clickable">
      <div class="robin-group-image robin-m-auto robin-mb-7" v-show="!icon.name">
        <input
          type="file"
          :style="{ display: 'none' }"
          :accept="acceptedVisualFiles"
          @change="handleFileChange($event.target.files)"
          @click="resetFileTarget($event)"
          id="group-icon-upload"
          data-testid="group-icon-upload"
        />
        <message-content :color="currentTheme === 'light' ? '#fff' : '#1E1E1E'" :fontSize="24">RG</message-content>
      </div>

      <img
        class="robin-group-image robin-m-auto robin-mb-7"
        :src="icon.localUrl"
        :alt="icon.name"
        v-show="icon.name"
        data-testid="image"
      />

      <message-content
        fontWeight="400"
        :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'"
        :fontSize="14"
        class="robin-mb-32"
        >Tap To Add Group Image</message-content
      >
    </message-content>

    <div class="robin-wrapper robin-w-100">
      <message-content
        fontWeight="400"
        :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'"
        :fontSize="14"
        class="robin-mb-8"
        >Group Name</message-content
      >

      <custom-input
        @user-typing="userTyping"
        :text="groupName"
        :reset="resetInput"
        placeholder="Robin Group"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import IconButton from '../IconButton/IconButton.vue'
import Content from '../Content/Content.vue'
import Input from '../Input/Input.vue'
import Button from '../Button/Button.vue'
import GroupAvatar from '../GroupAvatar/GroupAvatar.vue'

const ComponentProps = Vue.extend({
  props: {
    groupName: {
      type: String as PropType<string>,
      default: ''
    }
  }
})

@Component({
  name: 'NewGroupChat',
  components: {
    'message-content': Content,
    'custom-input': Input,
    'custom-button': Button,
    GroupAvatar,
    IconButton
  }
})
export default class NewGroupChatList extends ComponentProps {
  name = ''
  icon = {} as any
  resetInput = false
  acceptedVisualFiles = 'image/png, image/jpg, image/jpeg' as string

  get currentTheme () {
    return store.state.currentTheme
  }

  userTyping (val: string): void {
    this.name = val
  }

  openPreviousModal (): void {
    this.$emit('closemodal', 'newchat')
    this.icon = {}
    this.name = ''
    this.resetInput = true
  }

  openGroupChatList (): void {
    this.$emit('openmodal', 'newgroupchat')
    this.$emit('set-groupicon', this.icon)
    this.$emit('set-groupname', this.name)
  }

  resetFileTarget (event: any): void {
    event.target.value = ''
  }

  toBase64 (file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result?.toString() || '')
      reader.onerror = (error) => reject(error)
    })
  }

  async handleFileChange (file: any): Promise<void> {
    let fileURL

    try {
      fileURL = await this.toBase64(file[0])
    } catch (e) {
      console.warn(e)
    }

    const typeIndex = file[0].name.lastIndexOf('.')

    if (file[0].size < 5000001) {
      this.icon = {
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
