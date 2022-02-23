<template>
  <div class="robin-shim robin-fadeIn" ref="popup-1" @click.self="closeModal">
    <div class="robin-modal-container robin-flex">
      <div class="robin-inner-container robin-flex robin-flex-column">
        <header class="robin-wrapper robin-mb-7">
          <IconButton name="remove" @close="closeModal()" emit="close" :to-emit="true" :to-click-away="false" />

          <RText class="robin-ml-8">Forward Message</RText>
        </header>

        <div class="robin-search">
          <RSearchBar placeholder="Search people..." @user-typing="searchConversation($event)" :loading="isLoading" />
        </div>

        <div class="robin-select robin-flex robin-flex-align-center robin-flex-justify-end robin-w-100 robin-pl-16 robin-pr-16 robin-pt-17 robin-pb-17">
          <RText color="#9999BC"> Select All </RText>

          <RCheckBox class="robin-ml-8" @clicked="toggleSelectAllCheckAction($event)" />
        </div>

        <div class="robin-conversation-container">
          <div class="robin-contact-container" v-for="(conversation, key, index) in conversations" :key="`conversation-${index}`">
            <div class="robin-w-100 robin-alphabet-block" v-show="key.toString() != '*'">
              <RAlphabetBlock :text="key" />
            </div>

            <div class="robin-card-container robin-flex robin-flex-column">
              <div class="robin-card robin-flex robin-flex-align-center" v-for="(item, conversationIndex) in conversation" :key="item._id">
                <div class="robin-card-info robin-mr-12">
                  <RGroupAvatar v-if="item.is_group" />

                  <RAvatar :robin-users="$robin_users" :sender-token="item.sender_token" v-else />
                </div>

                <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1">
                  <div class="robin-flex">
                    <RText :font-size="14" :line-height="18" v-if="!item.is_group">{{ item.sender_token != $user_token ? item.sender_name : item.receiver_name }}</RText>

                    <RText :font-size="14" :line-height="18" v-else>{{ item.name }}</RText>
                  </div>

                  <div class="robin-ml-auto">
                    <RCheckBox :key="addIndexToCheckBoxState(conversationIndex, checkBoxKeyState)" @clicked="toggleCheckAction($event, item)" ref="checkbox-comp" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button class="robin-primary-button robin-come-up" v-show="selectedConversations.length > 0 && !isSending" @click="handleForwardMessages()">Forward</button>
        <button class="robin-primary-button"  v-show="isSending"><div class="robin-spinner2"></div></button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import RText from '@/components/ChatList/RText/RText.vue'
import RGroupAvatar from '@/components/ChatList/RGroupAvatar/RGroupAvatar.vue'
import RAvatar from '@/components/ChatList/RAvatar/RAvatar.vue'
import IconButton from '../../IconButton/IconButton.vue'
import RSearchBar from '@/components/ChatList/RSearchBar/RSearchBar.vue'
import RAlphabetBlock from '@/components/ChatList/RAlphabetBlock/RAlphabetBlock.vue'
import RCheckBox from '@/components/ChatList/RCheckBox/RCheckBox.vue'
import RButton from '@/components/ChatList/RButton/RButton.vue'
import EventBus from '@/event-bus'

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
    IconButton,
    RAvatar,
    RGroupAvatar,
    RAlphabetBlock,
    RSearchBar,
    RCheckBox,
    RButton
  }
})
export default class RForwardMessage extends ComponentProps {
  conversations = {} as any
  isLoading = false as boolean
  isSending = false as boolean
  selectedConversations = [] as Array<any>
  checkBoxKeyState = 0 as number
  searchData = [] as Array<any>
  screenWidth = 0 as number

  created () {
    this.getConversations('')
  }

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
  }

  getConversations (searchText: string): void {
    this.conversations = {}

    if (searchText.trim() === '') {
      console.log(this.$conversations)
      for (const conversation of this.getRegularConversations(this.$conversations)) {
        this.conversations[conversation.name[0] ? this.getContactKey(conversation.name) : this.getContactKey(conversation.sender_token !== this.$user_token ? conversation.sender_name : conversation.receiver_name)] = this.getRegularConversations(this.$conversations).filter((item) => {
          const conversationName = conversation.is_group ? conversation.name : conversation.sender_token !== this.$user_token ? conversation.sender_name : conversation.receiver_name
          const itemName = item.is_group ? item.name : item.sender_token !== this.$user_token ? item.sender_name : item.receiver_name

          return this.validateContact(itemName, conversationName)
        })
      }

      this.sortConversations()
    } else {
      for (const conversation of this.searchData) {
        this.conversations[conversation.name[0] ? this.getContactKey(conversation.name) : this.getContactKey(conversation.sender_token !== this.$user_token ? conversation.sender_name : conversation.receiver_name)] = this.searchData.filter((item) => {
          const conversationName = conversation.is_group ? conversation.name : conversation.sender_token !== this.$user_token ? conversation.sender_name : conversation.receiver_name
          const itemName = item.is_group ? item.name : item.sender_token !== this.$user_token ? item.sender_name : item.receiver_name

          return this.validateContact(itemName, conversationName)
        })
      }

      this.sortConversations()
    }
  }

  getRegularConversations (data: any): Array<any> {
    return data.filter((user: any) => {
      if (!user.archived_for || user.archived_for.length === 0) return true
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
    setTimeout(() => {
      this.isLoading = false
    }, 300)
  }

  toggleSelectAllCheckAction (val: boolean) {
    const checkboxComponents = this.$refs['checkbox-comp'] as any

    if (!val) {
      this.selectedConversations = [...this.getRegularConversations(this.$conversations)]

      for (let i = 0; i < checkboxComponents.length; i += 1) {
        checkboxComponents[i].checked = true
      }
    } else {
      this.selectedConversations = []

      for (let i = 0; i < checkboxComponents.length; i += 1) {
        checkboxComponents[i].checked = false
      }
    }
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
      message.is_read = false
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
      const conversation = this.$conversations.find((conversation: any) => conversation._id === conversationIds[0])

      this.isSending = false
      this.$toast.open({
        message: 'Forwarded messages.',
        type: 'success',
        position: 'bottom-left'
      })
      EventBus.$emit('conversation-opened', conversation)
      this.closeModal()
      return new Promise((resolve) => resolve)
    } else {
      this.isSending = false
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
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

  sortConversations (): void {
    this.conversations = Object.keys(this.conversations)
      .sort()
      .reduce((result: any, key: string) => {
        result[key] = this.conversations[key]
        return result
      }, {})
  }

  getContactKey (username: any): string {
    return username.trim() !== '' && isNaN(parseInt(username[0])) ? username[0].toUpperCase() : '*'
  }

  validateContact (usernameVal: any, username: any): boolean {
    if (!usernameVal[0] && !username[0]) {
      console.log('empty', usernameVal.trim() === username.trim())
      return usernameVal.trim() === username.trim()
    }

    if (usernameVal[0] && username[0]) {
      return usernameVal[0].toUpperCase() === username[0].toUpperCase()
    }

    return false
  }

  onResize () {
    this.screenWidth = window.innerWidth
  }
}
</script>

<style scoped>
.robin-shim {
  width: 100%;
  height: 100vh;
  background-color: rgba(81, 84, 92, 0.4);
  /* backdrop-filter: blur(3.8731px); */
  position: fixed;
  top: 0;
  left: 0;
  z-index: 101;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}

header {
  display: flex;
  align-items: center;
  padding: 1rem;
  /* justify-content: space-between; */
}

.robin-modal-container {
  width: max-content;
  border-radius: 10px;
  /* margin: 6rem 0 0; */
}

.robin-inner-container {
  display: flex;
  flex-direction: column;
  width: 426px;
  height: 750px;
  max-height: 750px;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0px 0px 20px rgba(0, 104, 255, 0.06);
  padding: 1.063rem 1.625rem 0 1.563rem;
  position: relative;
}

/* .robin-wrapper {
  padding: 0 1rem;
} */

.robin-search {
  padding: 0 1rem;
}

.robin-select {
  border-bottom: 1px solid #efefef;
}

.robin-conversation-container {
  flex: 1;
  height: 100%;
  overflow-y: auto;
}

.robin-card-container .robin-card {
  box-shadow: 0px 1px 0px 2.5px rgba(69, 104, 209, 0.05);
  padding: 0.875rem 1rem 1rem;
  transition: all 0.15s;
  background-color: #fff;
}

.robin-card-container .robin-card + .robin-card {
  margin-top: 0.25rem;
}

.robin-spinner {
  width: 16px;
  height: 16px;
}

.robin-primary-button {
  border-radius: 30px;
  width: 348px;
  height: 50px;
  background-color: #15ae73;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 10%;
  bottom: 3.25rem;
  color: #fff;
  font-size: 1rem;
  line-height: 2rem;
  cursor: pointer;
  border: none;
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

@media (max-width: 1200px) {
  .robin-modal-container {
    width: 100%;
    height: 100%;
  }

  .robin-inner-container {
    width: 100%;
    height: 100%;
    max-height: initial;
  }
}
</style>
