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

          <message-content
            class="robin-ml-8"
            :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'"
            >Forward Message</message-content
          >
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
          <message-content :color="currentTheme == 'light' ? '#9999BC' : '#B6B6B6'">
            Select All
          </message-content>

          <check-box class="robin-ml-8" @clicked="toggleSelectAllCheckAction($event)" />
        </div>

        <div class="robin-conversation-container">
          <div class="robin-contact-container">
            <virtual-scroller
              :items="conversations"
              :item-count="conversations.length"
              :height="636"
              :child-height="childHeight"
              :render-after="0"
              v-slot="slotProps"
            >
              <div :key="slotProps.index" :id="slotProps.index">
                <alphabet-block v-if="typeof slotProps.item == 'string'" :text="slotProps.item" />

                <div v-else class="robin-card-container robin-flex robin-flex-column">
                  <chat-list-card
                    :item="slotProps.item"
                    :type="2"
                    @toggle-check-action="toggleCheckAction"
                  />
                </div>
              </div>
            </virtual-scroller>
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
import { PropType } from 'vue'
import Component, { mixins } from 'vue-class-component'
import ConversationMixin from '@/mixins/conversation-mixins'
import Content from '@/components/Content/Content.vue'
import IconButton from '@/components/IconButton/IconButton.vue'
import SearchBar from '@/components/SearchBar/SearchBar.vue'
import AlphabetBlock from '@/components/AlphabetBlock/AlphabetBlock.vue'
import CheckBox from '@/components/CheckBox/CheckBox.vue'
import ChatListCard from '../ChatListCard/ChatListCard.vue'
import VirtualScroller from '../VirtualScroller/VirtualScroller.vue'
import EventBus from '@/event-bus'

const ComponentProps = mixins(ConversationMixin).extend({
  props: {
    selectedMessages: {
      type: Array as PropType<Array<any>>,
      default: () => []
    }
  }
})

// eslint-disable-next-line
@Component<ForwardMessage>({
  name: 'ForwardMessage',
  components: {
    'message-content': Content,
    IconButton,
    AlphabetBlock,
    SearchBar,
    CheckBox,
    ChatListCard,
    VirtualScroller
  }
})
export default class ForwardMessage extends ComponentProps {
  childHeight = [] as Array<number>;
  conversations = [] as Array<string | ObjectType>;
  isLoading = false as boolean;
  isSending = false as boolean;
  selectedConversations = [] as Array<any>;
  checkBoxKeyState = 0 as number;
  searchData = [] as Array<any>;
  generalConversations!: Array<ObjectType>;
  screenWidth!: number;
  currentConversation!: ObjectType;
  currentTheme!: string;
  showToast!: (message: string, info: string) => void;

  mounted () {
    this.getConversations('')
  }

  getConversations (searchText: string): void {
    const conversationMap = new Map()

    if (searchText.trim() === '') {
      for (const conversation of this.generalConversations) {
        conversationMap.set(
          conversation.name[0]
            ? this.getContactKey(conversation.name)
            : this.getContactKey(
              conversation.sender_token !== this.$user_token
                ? conversation.sender_name
                : conversation.receiver_name
            ),
          this.generalConversations.filter((item) => {
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
        )
      }

      const sortedConversationMap = this.sortConversations(conversationMap)
      let conversationData = [] as Array<string | ObjectType>

      for (const key of sortedConversationMap.keys()) {
        conversationData.push(key)
        conversationData = [...conversationData, ...conversationMap.get(key)]
      }

      const childHeight = []

      for (const item of conversationData) {
        if (typeof item === 'string') {
          // AlphabetBlock height
          childHeight.push(45)
        } else {
          // Contact card height
          childHeight.push(95)
        }
      }

      this.childHeight = childHeight

      this.conversations = conversationData
    } else {
      const conversationMap = new Map()

      for (const conversation of this.searchData) {
        conversationMap.set(
          conversation.name[0]
            ? this.getContactKey(conversation.name)
            : this.getContactKey(
              conversation.sender_token !== this.$user_token
                ? conversation.sender_name
                : conversation.receiver_name
            ),
          this.searchData.filter((item) => {
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
        )
      }

      const sortedConversationMap = this.sortConversations(conversationMap)
      let conversationData = [] as Array<string | ObjectType>

      for (const key of sortedConversationMap.keys()) {
        conversationData.push(key)
        conversationData = [...conversationData, ...conversationMap.get(key)]
      }

      const childHeight = []

      for (const item of conversationData) {
        if (typeof item === 'string') {
          // AlphabetBlock height
          childHeight.push(42)
        } else {
          // Contact card height
          childHeight.push(78)
        }
      }

      this.childHeight = childHeight

      this.conversations = conversationData
    }
  }

  searchConversation (searchText: string): void {
    this.isLoading = true
    // eslint-disable-next-line array-callback-return
    const data = this.generalConversations.filter((obj) => {
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
      this.selectedConversations = [...this.generalConversations]

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

  toggleCheckAction (val: boolean, item: ObjectType): void {
    if (!val) {
      this.addConversation(item)
    } else {
      this.removeConversation(item)
    }
  }

  addConversation (item: ObjectType): void {
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
      const data = Array.isArray(message) ? { ...message[0] } : { ...message }
      data.is_read = false
      data.created_at = new Date()
      data.content.timestamp = new Date()
      messageIds.push(data._id)
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
      const conversation = this.generalConversations.find(
        (conversation: any) => conversation._id === conversationIds[0]
      )

      this.isSending = false
      this.showToast('Forwarded messages.', 'success')
      EventBus.$emit('conversation-opened', conversation)
      this.closeModal()
      return new Promise((resolve) => resolve)
    } else {
      this.isSending = false
      this.showToast('Failed to forward messages.', 'error')
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

  sortConversations (conversations: Map<string, any>): Map<string, any> {
    const results = [...conversations.keys()].sort().reduce((result: any, key: string) => {
      result[key] = conversations.get(key)
      return result
    }, {})

    const contactMap = new Map(Object.entries(results))

    return contactMap
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
}
</script>
