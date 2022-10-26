<template>
  <div class="robin-forward-message robin-shim robin-fadeIn" ref="popup-1" @click.self="closeModal">
    <div class="robin-modal-container robin-flex">
      <div class="robin-inner-container robin-flex robin-flex-column">
        <header class="robin-wrapper robin-mb-7">
          <icon-button
            name="remove"
            @close="closeModal()"
            emit="close"
            :to-emit="true"
            :to-click-away="false"
          />

          <content class="robin-ml-8">Forward Message</content>
        </header>

        <div class="robin-search">
          <search-bar
            placeholder="Search people..."
            @user-typing="searchConversation($event)"
            :loading="isLoading"
          />
        </div>

        <div
          class="robin-select robin-flex robin-flex-align-center robin-flex-justify-end robin-w-100 robin-pl-16 robin-pr-16 robin-pt-17 robin-pb-17"
        >
          <content color="#9999BC"> Select All </content>

          <check-box class="robin-ml-8" @clicked="toggleSelectAllCheckAction($event)" />
        </div>

        <div class="robin-conversation-container">
          <div
            class="robin-contact-container"
            v-for="(conversation, key, index) in conversations"
            :key="`conversation-${index}`"
          >
            <div class="robin-w-100 robin-alphabet-block" v-show="key.toString() != '*'">
              <alphabet-block :text="key" />
            </div>

            <div class="robin-card-container robin-flex robin-flex-column">
              <recycle-scroller
                :items="conversation"
                key-field="_id"
                :page-mode="true"
                :item-size="83"
                v-slot="{ item }"
              >
                <chat-list-card
                  :item="item"
                  :type="2"
                  @toggle-check-action="toggleCheckAction"
                />
              </recycle-scroller>
            </div>
          </div>
        </div>

        <button
          class="robin-primary-button robin-come-up"
          v-show="selectedConversations.length > 0 && !isSending"
          @click="handleForwardMessages()"
        >
          Forward
        </button>
        <button class="robin-primary-button" v-show="isSending">
          <div class="robin-spinner2"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import Content from '@/components/Content/Content.vue'
import IconButton from '@/components/IconButton/IconButton.vue'
import SearchBar from '@/components/SearchBar/SearchBar.vue'
import AlphabetBlock from '@/components/AlphabetBlock/AlphabetBlock.vue'
import CheckBox from '@/components/CheckBox/CheckBox.vue'
import ChatListCard from '../ChatListCard/ChatListCard.vue'
import RecycleScroller from '../RecycleScroller/RecycleScroller.vue'
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
  name: 'ForwardMessage',
  components: {
    Content,
    IconButton,
    AlphabetBlock,
    SearchBar,
    CheckBox,
    ChatListCard,
    RecycleScroller
  }
})
export default class ForwardMessage extends ComponentProps {
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
      for (const conversation of this.getRegularConversations(this.$conversations)) {
        this.conversations[
          conversation.name[0]
            ? this.getContactKey(conversation.name)
            : this.getContactKey(
              conversation.sender_token !== this.$user_token
                ? conversation.sender_name
                : conversation.receiver_name
            )
        ] = this.getRegularConversations(this.$conversations).filter((item) => {
          const conversationName = conversation.is_group
            ? conversation.name
            : conversation.sender_token !== this.$user_token
              ? conversation.sender_name
              : conversation.receiver_name
          const itemName = item.is_group
            ? item.name
            : item.sender_token !== this.$user_token
              ? item.sender_name
              : item.receiver_name

          return this.validateContact(itemName, conversationName)
        })
      }

      this.sortConversations()
    } else {
      for (const conversation of this.searchData) {
        this.conversations[
          conversation.name[0]
            ? this.getContactKey(conversation.name)
            : this.getContactKey(
              conversation.sender_token !== this.$user_token
                ? conversation.sender_name
                : conversation.receiver_name
            )
        ] = this.searchData.filter((item) => {
          const conversationName = conversation.is_group
            ? conversation.name
            : conversation.sender_token !== this.$user_token
              ? conversation.sender_name
              : conversation.receiver_name
          const itemName = item.is_group
            ? item.name
            : item.sender_token !== this.$user_token
              ? item.sender_name
              : item.receiver_name

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
    const index = this.selectedConversations.findIndex(
      (conversation) => conversation._id === item._id
    )
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
      const conversation = this.$conversations.find(
        (conversation: any) => conversation._id === conversationIds[0]
      )

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
