<template>
  <div class="robin-side-container" ref="popup-body">
    <header class="robin-header">
      <IconButton name="remove" emit="close" :to-emit="true" :to-click-away="false" @close="openPreviousModal()" />

      <Content font-weight="400" :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'" :font-size="16" class="robin-ml-12">New Group Chat</Content>

      <div class="robin-ml-auto">
        <Button emit="done" @done="openGroupChatList()" v-show="name.length > 0" class="robin-pulse-2">Done</Button>
      </div>
    </header>

    <Content as="label" for-ref="group-icon-upload" class="robin-clickable">
      <div class="robin-group-image robin-mb-7" v-show="!icon.name">
        <input type="file" :style="{ display: 'none' }" :accept="acceptedVisualFiles" @change="handleFileChange($event.target.files)" @click="resetFileTarget($event)" id="group-icon-upload" data-testid="group-icon-upload" />
        <Content :color="currentTheme === 'light' ? '#fff' : '#1E1E1E'"  :fontSize="24">RG</Content>
      </div>

      <img class="robin-group-image robin-mb-7" :src="icon.localUrl" :alt="icon.name" v-show="icon.name" data-testid="image">

      <Content fontWeight="400" :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'" :fontSize="14" class="robin-mb-32">Tap To Add Group Image</Content>
    </Content>

    <div class="robin-wrapper robin-w-100">
      <Content fontWeight="400" :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'" :fontSize="14" class="robin-mb-8">Group Name</Content>

      <Input @user-typing="userTyping" :text="groupName" :reset="resetInput" placeholder="Robin Group" />
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
    Content,
    Input,
    Button,
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
      reader.onerror = error => reject(error)
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
  background-color: inherit;
}

header {
  width: 100%;
  display: flex;
  align-items: center;
  padding: clamp(2%, 4vh, 1rem) clamp(2%, 4vw, 1rem) 1rem;
  margin: 1.688rem 0 3.313rem;
  background-color: var(--rb-color2);
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
  background-color: var(--rb-color8);
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
  background-color: var(--rb-color8);
  object-fit: cover;
}

.robin-wrapper {
  padding: 0 clamp(2%, 4vw, 1.5rem);
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
