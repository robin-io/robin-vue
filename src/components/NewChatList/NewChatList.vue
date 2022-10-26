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

    <div class="robin-contact-container robin-overflow-y-auto">
      <div v-for="(contact, key, index) in contacts" :key="`contact-${index}`">
        <alphabet-block :text="key" v-show="key.toString() != '*'" />

        <div class="robin-wrapper robin-card-container robin-flex robin-flex-column">
          <recycle-scroller
            :items="contact"
            :page-mode="true"
            key-field="userToken"
            :item-size="83"
            v-slot="{ item }"
          >
            <chat-list-card
              :item="item"
              :type="4"
              @create-conversation="createConversation(item)"
            />
          </recycle-scroller>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import Content from '../Content/Content.vue'
import SearchBar from '../SearchBar/SearchBar.vue'
import Button from '../Button/Button.vue'
import SvgIcon from '../SvgIcon/SvgIcon.vue'
import Avatar from '../Avatar/Avatar.vue'
import AlphabetBlock from '../AlphabetBlock/AlphabetBlock.vue'
import EventBus from '@/event-bus'
import IconButton from '../IconButton/IconButton.vue'
import ChatListCard from '../ChatListCard/ChatListCard.vue'
import RecycleScroller from '../RecycleScroller/RecycleScroller.vue'

// eslint-disable-next-line
@Component<NewChatList>({
  name: 'NewChatList',
  components: {
    'message-content': Content,
    SearchBar,
    'custom-button': Button,
    SvgIcon,
    RecycleScroller,
    IconButton,
    Avatar,
    AlphabetBlock,
    ChatListCard
  },
  watch: {
    $robin_users: {
      handler (val) {
        this.getContacts('')
      }
    }
  }
})
export default class NewChatList extends Vue {
  contacts = {} as any
  isLoading = false as boolean
  searchData = [] as Array<any>
  key = 0 as number

  created () {
    this.getContacts('')
  }

  get currentTheme () {
    return store.state.currentTheme
  }

  async createConversation (user: any) {
    const res = await this.$robin.createConversation({
      sender_name: this.$senderName,
      sender_token: this.$user_token,
      receiver_token: user.userToken,
      receiver_name: user.userName
    })

    if (res && !res.error) {
      if (!this.checkConversations(res.data)) {
        this.$conversations.push(res.data)
      }

      EventBus.$emit('conversation-opened', res.data)
      EventBus.$emit('open-conversation')
      this.openPreviousModal()
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
    }
  }

  checkConversations (convo: any): Boolean {
    let res = false
    this.$conversations.forEach((conversation) => {
      if (conversation._id === convo._id) {
        res = true
      }
    })
    return res
  }

  getContacts (searchText: string): void {
    this.contacts = {}

    if (searchText.trim() === '') {
      this.$robin_users.forEach((user: any) => {
        this.contacts[this.getContactKey(user.userName)] = this.$robin_users.filter(
          (item: any) =>
            item.userToken !== this.$user_token &&
            this.validateContact(item.userName, user.userName)
        )
      })

      for (const key in this.contacts) {
        if (this.contacts[key].length === 0) {
          delete this.contacts[key]
        }
      }

      this.sortContacts()
    } else {
      this.searchData.forEach((user: any) => {
        this.contacts[this.getContactKey(user.userName)] = this.searchData.filter(
          (item: any) =>
            item.userToken !== this.$user_token &&
            this.validateContact(item.userName, user.userName)
        )
      })
    }
  }

  searchContacts (searchText: string): void {
    this.isLoading = true
    // eslint-disable-next-line array-callback-return
    const data = this.$robin_users.filter((obj: any) => {
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
    this.getContacts(searchText)
    setTimeout(() => {
      this.isLoading = false
    }, 300)
  }

  sortContacts (): void {
    this.contacts = Object.keys(this.contacts)
      .sort()
      .reduce((result: any, key: string) => {
        result[key] = this.contacts[key]
        return result
      }, {})
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
