<template>
  <div class="robin-shim robin-fadeIn" ref="popup-1" v-on-clickaway="closeModal">
    <div class="robin-modal-container robin-flex">
      <div class="robin-inner-container robin-flex robin-flex-column">
        <header class="robin-wrapper robin-mt-26 robin-mb-10">
          <RText>Forward Message</RText>
          <RButton color="#15ae73" emit="clicked" @clicked="handleForwardMessages()" v-show="!isSending">Send</RButton>
          <div class="robin-spinner" v-show="isSending"></div>
        </header>

        <div class="robin-wrapper robin-mb-10">
          <RSearchBar placeholder="Search people or group..." @user-typing="searchConversation($event)" :loading="isLoading" />
        </div>
        <div class="robin-conversation-container">
          <div class="robin-contact-container" v-for="(conversation, key, index) in conversations" :key="`conversation-${index}`">
            <div class="robin-w-100">
              <RAlphabetBlock :text="key" />
            </div>

            <div class="robin-card-container robin-flex robin-flex-column robin-grey-200">
              <div class="robin-card robin-flex robin-flex-align-center" v-for="(item, conversationIndex) in conversation" :key="item._id">
                <div class="robin-card-info robin-mr-12">
                  <RGroupAvatar v-if="item.is_group" />
                  <RAvatar v-else />
                </div>
                <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1">
                  <div class="robin-flex">
                    <RText :font-size="14" :line-height="18">{{ item.is_group ? item.name : item.receiver_name }}</RText>
                  </div>
                  <div class="robin-ml-auto">
                    <RCheckBox :key="addIndexToCheckBoxState(conversationIndex, checkBoxKeyState)" @clicked="toggleCheckAction($event, item)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="robin-ml-16">
        <RCloseButton @close="closeModal()" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import { mixin as clickaway } from 'vue-clickaway'
import RText from '@/components/ChatList/RText/RText.vue'
import RGroupAvatar from '@/components/ChatList/RGroupAvatar/RGroupAvatar.vue'
import RAvatar from '@/components/ChatList/RAvatar/RAvatar.vue'
import RCloseButton from '@/components/ChatList/RCloseButton/RCloseButton.vue'
import RSearchBar from '@/components/ChatList/RSearchBar/RSearchBar.vue'
import RAlphabetBlock from '@/components/ChatList/RAlphabetBlock/RAlphabetBlock.vue'
import RCheckBox from '@/components/ChatList/RCheckBox/RCheckBox.vue'
import RButton from '@/components/ChatList/RButton/RButton.vue'

const ComponentProps = Vue.extend({
  props: {
    selectedMessages: {
      type: Array as PropType<Array<any>>,
      default: () => []
    }
  }
})

@Component({
  name: 'RForwardMessage',
  components: {
    RText,
    RCloseButton,
    RAvatar,
    RGroupAvatar,
    RAlphabetBlock,
    RSearchBar,
    RCheckBox,
    RButton
  },
  mixins: [clickaway]
})
export default class RForwardMessage extends ComponentProps {
  conversations = {} as any
  isLoading = false as boolean
  isSending = false as boolean
  selectedConversations = [] as Array<any>
  checkBoxKeyState = 0 as number
  searchData = [] as Array<any>

  created () {
    this.getConversations('')
  }

  getConversations (searchText: string): void {
    this.conversations = {}

    if (searchText.trim() === '') {
      // console.log(this.getRegularConversations(this.$conversations))
      for (const conversation of this.getRegularConversations(this.$conversations)) {
        this.conversations[conversation.name[0] ? conversation.name[0].toUpperCase() : conversation.receiver_name[0].toUpperCase()] = this.getRegularConversations(this.$conversations).filter((item) => {
          if (item.name[0] && conversation.name[0]) return item.name[0].toUpperCase() === conversation.name[0].toUpperCase()
          if (item.receiver_name[0] && conversation.receiver_name[0]) return item.receiver_name[0].toUpperCase() === conversation.receiver_name[0].toUpperCase()
          if (item.receiver_name[0] && conversation.name[0]) return item.receiver_name[0].toUpperCase() === conversation.name[0].toUpperCase()
          if (item.name[0] && conversation.receiver_name[0]) return item.name[0].toUpperCase() === conversation.receiver_name[0].toUpperCase()

          return false
        })
      }
    } else {
      for (const conversation of this.searchData) {
        this.conversations[conversation.name[0] ? conversation.name[0].toUpperCase() : conversation.receiver_name[0].toUpperCase()] = this.searchData.filter((item) => {
          if (item.name[0] && conversation.name[0]) return item.name[0].toUpperCase() === conversation.name[0].toUpperCase()
          if (item.receiver_name[0] && conversation.receiver_name[0]) return item.receiver_name[0].toUpperCase() === conversation.receiver_name[0].toUpperCase()
          if (item.receiver_name[0] && conversation.name[0]) return item.receiver_name[0].toUpperCase() === conversation.name[0].toUpperCase()
          if (item.name[0] && conversation.receiver_name[0]) return item.name[0].toUpperCase() === conversation.receiver_name[0].toUpperCase()

          return false
        })
      }
    }
  }

  getRegularConversations (data: any): Array<any> {
    return data.filter((user: any) => {
      if (!user.archived_for) return true
      return false
    })
  }

  searchConversation (searchText: string): void {
    this.isLoading = true
    // eslint-disable-next-line array-callback-return
    const data = this.getRegularConversations(this.$conversations).filter((obj) => {
      let stopSearch = false
      Object.values(obj).forEach((val) => {
        const filter = String(val).toLowerCase().includes(searchText.toLowerCase())
        if (filter) {
          stopSearch = true
        }
      })
      if (stopSearch) {
        return obj
      }
    })

    this.searchData = [...data]
    this.getConversations(searchText)
    // console.log(this.searchData)
    setTimeout(() => {
      this.isLoading = false
    }, 300)
  }

  toggleCheckAction (val: boolean, item: Object): void {
    if (!val) {
      this.addConversation(item)
    } else {
      this.removeConversation(item)
    }
  }

  addConversation (item: Object): void {
    this.selectedConversations.push(item)
  }

  removeConversation (item: any): void {
    const index = this.selectedConversations.findIndex((conversation) => conversation._id === item._id)
    this.selectedConversations.splice(index, 1)
  }

  addIndexToCheckBoxState (index: any, checkBoxKeyState: number): number {
    return parseInt(index) + checkBoxKeyState
  }

  handleForwardMessages () {
    const messageIds = []
    const conversationIds = []

    for (const message of this.selectedMessages) {
      messageIds.push(message._id)
    }

    for (const conversation of this.selectedConversations) {
      conversationIds.push(conversation._id)
    }

    this.forwardMessages(messageIds, conversationIds)
  }

  async forwardMessages (messageIds: Array<string>, conversationIds: Array<string>): Promise<void> {
    this.isSending = true
    const res = await this.$robin.forwardMessages(this.$user_token, messageIds, conversationIds)

    if (res && !res.error) {
      // console.log(res)
      this.isSending = false
      this.$toasted.global.custom_success('Forwarded messages.')
      this.closeModal()
      return new Promise((resolve) => resolve)
    } else {
      this.isSending = false
      this.$toasted.global.custom_error('Check your connection.')
      return new Promise((resolve, reject) => reject)
    }
  }

  closeModal () {
    const popup = this.$refs['popup-1'] as any
    popup.classList.remove('robin-fadeIn')
    popup.classList.add('robin-fadeOut')

    window.setTimeout(() => {
      const popup = this.$refs['popup-1'] as any
      popup.classList.remove('robin-fadeOut')
      popup.classList.add('robin-fadeIn')

      this.$emit('closemodal')
    }, 100)
  }

  // async sendFileMessage (): Promise<any> {
  //   return await Promise.all(
  //     this.files.map(async (file) => {
  //       await this.$robin.sendMessageAttachment(this.$user_token, this.conversation._id, file.file)
  //     })
  //   )
  // }
}
</script>

<style scoped>
.robin-shim {
  width: 100%;
  height: 100vh;
  background-color: rgba(107, 116, 145, 0.1);
  backdrop-filter: blur(3.8731px);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}

header {
  display: flex;
  justify-content: space-between;
}

.robin-modal-container {
  width: max-content;
  /* margin: 6rem 0 0; */
}

.robin-inner-container {
  display: flex;
  flex-direction: column;
  width: 375px;
  max-height: 462px;
  background-color: #fff;
  box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.06);
}

.robin-wrapper {
  padding: 0 1rem;
}

.robin-conversation-container {
  flex: 1;
  height: 100%;
  overflow-y: auto;
}

.robin-card-container {
  overflow-y: auto;
}

.robin-card-container .robin-card {
  border-bottom: 1px solid #f4f6f8;
  padding: 1rem 0 1.1rem;
  transition: all 0.15s;
  padding: 1rem 1.3rem;
}

.robin-card-container .robin-card:last-child {
  border-bottom: none;
}

.robin-spinner {
  width: 16px;
  height: 16px;
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
