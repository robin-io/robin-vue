<template>
  <div class="robin-new-chat-list-container" ref="popup-body">
    <header class="robin-header">
      <icon-button
        name="remove"
        @close="openPreviousModal()"
        emit="close"
        :to-emit="true"
        :to-click-away="false"
      />

      <message-content
        font-weight="400"
        :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'"
        :font-size="16"
        class="robin-ml-12"
      >
        New Chat
      </message-content>
    </header>

    <div class="robin-w-100 robin-pl-16 robin-pr-16">
      <search-bar
        @user-typing="searchContacts($event)"
        :loading="isLoading"
        :key="key"
        placeholder="Search or start new chat"
      />
    </div>

    <div
      class="robin-w-100 robin-create-group robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pl-16 robin-pr-16 robin-flex-1 robin-mt-31 robin-pb-16"
    >
      <custom-button
        color="#15AE73"
        :font-size="14"
        :line-height="18"
        emit="newgroupchat"
        @newgroupchat="openGroupChat()"
        class="robin-flex robin-flex-align-center"
      >
        <svg-icon name="3users" />

        <message-content class="robin-ml-5" color="#15AE73">Create Group Chat</message-content>
      </custom-button>
    </div>

    <div class="robin-contact-container" ref="contact-container">
      <virtual-scroller
        :items="contacts"
        :item-count="contacts.length"
        :height="636"
        :child-height="childHeight"
        v-slot="slotProps"
      >
        <div :key="slotProps.index" :id="slotProps.index">
          <alphabet-block v-if="typeof slotProps.item == 'string'" :text="slotProps.item" />

          <div v-else class="robin-wrapper robin-card-container robin-flex robin-flex-column">
            <chat-list-card
              :item="slotProps.item"
              :type="4"
              @create-conversation="createConversation(slotProps.item)"
            />
          </div>
        </div>
      </virtual-scroller>
    </div>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import Content from '../Content/Content.vue'
import SearchBar from '../SearchBar/SearchBar.vue'
import Button from '../Button/Button.vue'
import SvgIcon from '../SvgIcon/SvgIcon.vue'
import Avatar from '../Avatar/Avatar.vue'
import AlphabetBlock from '../AlphabetBlock/AlphabetBlock.vue'
import EventBus from '@/event-bus'
import IconButton from '../IconButton/IconButton.vue'
import ChatListCard from '../ChatListCard/ChatListCard.vue'
import VirtualScroller from '../VirtualScroller/VirtualScroller.vue'
import ConversationMixin from '@/mixins/conversation-mixins'

// eslint-disable-next-line
@Component<NewChatList>({
  name: 'NewChatList',
  components: {
    'message-content': Content,
    SearchBar,
    'custom-button': Button,
    SvgIcon,
    IconButton,
    Avatar,
    AlphabetBlock,
    ChatListCard,
    VirtualScroller
  },
  watch: {
    $robin_users: {
      handler () {
        this.getContacts('')
      }
    }
  }
})
export default class NewChatList extends mixins(ConversationMixin) {
  childHeight = [] as Array<number>
  contacts = [] as Array<string | ObjectType>
  isLoading = false as boolean
  searchData = [] as Array<ObjectType>
  key = 0 as number
  debouncedGetConversations = null as null | ((user: ObjectType) => void)

  created () {
    this.getContacts('')
  }

  get contactHeight () {
    const contactContainer = this.$refs['contact-container'] as HTMLElement
    return contactContainer?.offsetHeight
  }

  async createConversation (user: ObjectType) {
    const res = await this.$robin.createConversation({
      sender_name: this.$senderName,
      sender_token: this.$user_token,
      receiver_token: user.userToken,
      receiver_name: user.userName
    })

    if (res && !res.error) {
      if (!this.checkConversations(res.data)) {
        this.allConversations.push(res.data)
      }

      EventBus.$emit('conversation-opened', res.data)
      EventBus.$emit('open-conversation')
      this.openPreviousModal()
    } else {
      this.showToast('Check your connection.', 'error')
    }
  }

  checkConversations (convo: ObjectType): boolean {
    let res = false
    this.allConversations.forEach((conversation) => {
      if (conversation._id === convo._id) {
        res = true
      }
    })
    return res
  }

  getContacts (searchText: string): void {
    const contactMap = new Map()
    const data = searchText.trim() === '' ? this.$robin_users : this.searchData

    data.forEach((user: any) => {
      const filteredData = data.filter(
        (item: ObjectType) =>
          item.userToken !== this.$user_token &&
          this.validateContact(item.userName.trim(), user.userName.trim())
      )

      if (filteredData.length > 0) {
        contactMap.set(this.getContactKey(user.userName.trim()), filteredData)
      }
    })

    const sortedContactMap = this.sortContacts(contactMap)
    let contactData = [] as Array<string | ObjectType>

    for (const key of sortedContactMap.keys()) {
      contactData.push(key)
      contactData = [...contactData, ...contactMap.get(key)]
    }

    const childHeight = contactData.map(
      (item: any) => (typeof item === 'string' ? 42 : 80)
    )

    this.childHeight = childHeight
    this.contacts = contactData
  }

  searchContacts (searchText: string): void {
    this.isLoading = true
    const searchTextLower = searchText.toLowerCase()
    const data = this.$robin_users.filter((obj: any) => {
      return Object.values(obj).some((val) => String(val).toLowerCase().includes(searchTextLower))
    })
    this.searchData = [...data]
    this.getContacts(searchText)
    setTimeout(() => {
      this.isLoading = false
    }, 300)
  }

  sortContacts (contacts: Map<string, any>): Map<string, any> {
    const results = [...contacts.keys()].sort().reduce((result: any, key: string) => {
      result[key] = contacts.get(key)
      return result
    }, {})

    const contactMap = new Map(Object.entries(results))

    return contactMap
  }

  openPreviousModal (): void {
    this.$emit('closemodal', 'primary')
    setTimeout(() => {
      this.refresh()
    }, 300)
  }

  openGroupChat (): void {
    this.$emit('openmodal', 'newgroup')
    setTimeout(() => {
      this.refresh()
    }, 300)
  }

  getContactKey (username: string): string {
    if (username && username.trim() !== '' && isNaN(parseInt(username[0]))) {
      return username[0].toUpperCase()
    }
    return '*'
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

  refresh (): void {
    this.key += 1
  }
}
</script>
