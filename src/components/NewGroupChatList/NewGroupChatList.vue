<template>
  <div class="robin-new-groupchat-list-container" ref="popup-body">
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
        >{{ !updatingParticipants ? 'New Group Chat' : 'Add Group Participants' }}</message-content
      >

      <div class="robin-ml-auto">
        <custom-button
          emit="done"
          @done="!updatingParticipants ? createGroupConversation() : addGroupParticipants()"
          v-show="users.length > 0 && !isUploading"
          class="robin-pulse-2"
          >Done</custom-button
        >
        <div class="robin-spinner" v-show="isUploading"></div>
      </div>
    </header>

    <div class="robin-w-100 robin-pl-16 robin-pr-16">
      <search-bar @user-typing="searchContacts($event)" :loading="isLoading" placeholder="Search" />
    </div>

    <div
      class="robin-select robin-flex robin-flex-align-center robin-flex-justify-end robin-w-100 robin-pl-16 robin-pr-16 robin-pt-24 robin-pb-23"
    >
      <message-content :color="currentTheme === 'light' ? '#9999BC' : '#B6B6B6'">
        Select All
      </message-content>
      <check-box
        class="robin-ml-8"
        @clicked="toggleSelectAllCheckAction($event)"
        data-testid="select-all-button"
      />
    </div>

    <div class="robin-contact-container">
      <virtual-scroller
        :items="contacts"
        :item-count="contacts.length"
        :height="636"
        :child-height="childHeight"
        v-slot="slotProps"
      >
        <div :key="slotProps.index" :id="slotProps.index">
          <alphabet-block v-if="typeof slotProps.item == 'string'" :text="slotProps.item" />

          <div v-else class="robin-card-container robin-flex robin-flex-column">
            <chat-list-card
              :index="slotProps.index"
              :item="slotProps.item"
              :type="3"
              ref="chat-list"
              @toggle-check-action="toggleCheckAction"
            />
          </div>
        </div>
      </virtual-scroller>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import IconButton from '../IconButton/IconButton.vue'
import Content from '../Content/Content.vue'
import SearchBar from '../SearchBar/SearchBar.vue'
import Button from '../Button/Button.vue'
import Avatar from '../Avatar/Avatar.vue'
import CheckBox from '../CheckBox/CheckBox.vue'
import AlphabetBlock from '../AlphabetBlock/AlphabetBlock.vue'
import ChatListCard from '../ChatListCard/ChatListCard.vue'
import EventBus from '@/event-bus'
import VirtualScroller from '../VirtualScroller/VirtualScroller.vue'

const ComponentProps = Vue.extend({
  props: {
    groupName: {
      type: String,
      default: ''
    },
    groupIcon: {
      type: Object,
      default: () => {}
    }
  }
})

// eslint-disable-next-line
@Component<NewGroupChatList>({
  name: 'NewGroupChatList',
  components: {
    'message-content': Content,
    SearchBar,
    'custom-button': Button,
    Avatar,
    IconButton,
    CheckBox,
    AlphabetBlock,
    ChatListCard,
    VirtualScroller
  },
  watch: {
    $robin_users: {
      handler (val) {
        this.getContacts('', 'create-group')
      }
    }
  }
})
export default class NewGroupChatList extends ComponentProps {
  childHeight = [] as Array<Number>
  contacts = [] as Array<String | ObjectType>
  checkBoxKeyState = 0 as number
  users = [] as Array<ObjectType>
  isLoading = false as boolean
  isUploading = false as boolean
  searchData = [] as Array<any>
  updatingParticipants = false
  conversationId = ''

  created () {
    this.handleAddGroupParticipants()
  }

  mounted () {
    this.getContacts('', 'create-group')
  }

  get currentTheme () {
    return store.state.currentTheme
  }

  get currentConversation () {
    return store.state.currentConversation
  }

  closeModal (): void {
    this.users = []
    this.checkBoxKeyState += 1
  }

  openModal (): void {
    this.checkBoxKeyState += 1
  }

  getContacts (searchText: string, type: string): void {
    const contactMap = new Map()

    if (searchText.trim() === '') {
      this.$robin_users.forEach((user: ObjectType) => {
        const filter = type !== 'create-group'
          ? (item: ObjectType) =>
              item.userToken !== this.$user_token &&
              !this.isGroupParticipant(item) &&
              this.validateContact(item.userName, user.userName)
          : (item: ObjectType) =>
              item.userToken !== this.$user_token &&
              this.validateContact(item.userName, user.userName)

        contactMap.set(
          this.getContactKey(user.userName),
          this.$robin_users.filter(
            filter
          )
        )
      })

      for (const key of contactMap.keys()) {
        if (contactMap.get(key).length === 0) {
          contactMap.delete(key)
        }
      }

      const sortedContactMap = this.sortContacts(contactMap)
      let contactData = [] as Array<string | ObjectType>

      for (const key of sortedContactMap.keys()) {
        contactData.push(key)
        contactData = [...contactData, ...contactMap.get(key)]
      }

      const childHeight = []

      for (const item of contactData) {
        if (typeof item === 'string') {
          // AlphabetBlock height
          childHeight.push(42)
        } else {
          // Contact card height
          childHeight.push(80)
        }
      }

      this.childHeight = childHeight

      this.contacts = contactData
    } else {
      const contactMap = new Map()

      this.searchData.forEach((user: any) => {
        const filter = type !== 'create-group'
          ? (item: ObjectType) =>
              item.userToken !== this.$user_token &&
              !this.isGroupParticipant(item) &&
              this.validateContact(item.userName, user.userName)
          : (item: ObjectType) => item.userToken !== this.$user_token &&
              this.validateContact(item.userName, user.userName)

        contactMap.set(
          this.getContactKey(user.userName),
          this.searchData.filter(
            filter
          )
        )
      })

      let contactData = [] as Array<string | ObjectType>

      for (const key of contactMap.keys()) {
        contactData.push(key)
        contactData = [...contactData, ...contactMap.get(key)]
      }

      this.contacts = contactData
    }
  }

  toggleCheckAction (val: boolean, user: Object): void {
    if (!val) {
      this.addUser(user)
    } else {
      this.removeUser(user)
    }
  }

  toggleSelectAllCheckAction (val: boolean) {
    const checkboxes = document.querySelectorAll('.robin-card-info #checkbox') as NodeListOf<HTMLElement>

    if (checkboxes) {
      if (!val) {
        this.users = [...this.$robin_users] as Array<ObjectType>

        for (let i = 0; i < checkboxes.length; i += 1) {
          (checkboxes[i].childNodes[0] as HTMLInputElement).checked = true
        }
      } else {
        this.users = []

        for (let i = 0; i < checkboxes.length; i += 1) {
          (checkboxes[i].childNodes[0] as HTMLInputElement).checked = false
        }
      }
    }
  }

  async createGroupConversation (): Promise<void> {
    const moderator = {
      user_token: this.$user_token,
      meta_data: {
        display_name: this.$senderName
      }
    }

    const users = this.users.map((user) => {
      return {
        user_token: user.userToken,
        meta_data: {
          profile_image: user.profileImage,
          display_name: user.userName
        }
      }
    })

    this.isUploading = true
    const res = await this.$robin.createGroupConversation(this.groupName, moderator, users)

    if (res && !res.error) {
      if (this.groupIcon.file) {
        this.uploadGroupIcon(res.data).then(() => {
          this.$emit('changesidebartype', 'primary')
          this.$emit('closemodal')
          this.$emit('reset-groupname')
          this.toggleSelectAllCheckAction(true)
          this.isUploading = false
        })
      } else {
        this.$emit('changesidebartype', 'primary')
        this.$emit('closemodal')
        this.$emit('reset-groupname')
        this.isUploading = false
      }
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
      this.isUploading = false
    }
  }

  async addGroupParticipants () {
    const users = this.users.map((user) => {
      return {
        user_token: user.userToken,
        meta_data: {
          profile_image: user.profileImage,
          display_name: user.userName
        }
      }
    })

    this.isUploading = true
    const res = await this.$robin.addGroupParticipants(this.conversationId, users)

    if (res && !res.error) {
      this.conversationId = ''
      this.isUploading = false
      this.$emit('changesidebartype', 'primary')
      this.$emit('closemodal')
      this.$emit('reset-groupname')
      this.toggleSelectAllCheckAction(true)

      EventBus.$emit('update.group.conversation', res.data)
    } else {
      this.$toast.open({
        message: 'Check your connection.',
        type: 'error',
        position: 'bottom-left'
      })
      this.isUploading = false
    }
  }

  handleAddGroupParticipants () {
    EventBus.$on('edit.participants.group', (details: any) => {
      this.getContacts('', 'update-participants')
      this.conversationId = details.conversation_id

      this.updatingParticipants = true
    })
  }

  async uploadGroupIcon (conversation: any): Promise<void> {
    const robin = this.$robin as any
    const res = await robin.uploadGroupIcon(conversation._id, this.groupIcon.file)

    if (res && !res.error) {
      this.$emit('reset-groupicon')
    }
  }

  addUser (user: ObjectType): void {
    const userIndex = this.users.findIndex((item) => item.userToken === user.userToken)

    if (userIndex > -1) {
      this.removeUser(user)
    } else {
      this.users.push(user)
    }
  }

  removeUser (user: ObjectType): void {
    const userIndex = this.users.findIndex((item) => item.userToken === user.userToken)
    this.users.splice(userIndex, 1)

    if (this.users.length < 1) {
      this.closeModal()
    }
  }

  isGroupParticipant (contact: ObjectType): boolean {
    if (Object.keys(this.currentConversation).length > 0) {
      console.log(this.currentConversation.participants.some((participant: ObjectType) => participant.user_token === contact.userToken))
      return this.currentConversation.participants.some((participant: ObjectType) => participant.user_token === contact.userToken)
    }

    return false
  }

  addIndexToCheckBoxState (index: any, checkBoxKeyState: number): number {
    return parseInt(index) + checkBoxKeyState
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
    this.getContacts(searchText, !this.updatingParticipants ? 'create-group' : 'update-participants')
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

  getContactKey (username: any): string {
    return username !== '' && isNaN(parseInt(username[0])) ? username[0].toUpperCase() : '*'
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

  openPreviousModal (): void {
    if (!this.updatingParticipants) {
      this.$emit('closemodal', 'newgroup')
    } else {
      window.setTimeout(() => {
        this.getContacts('', 'create-group')
      }, 200)
      this.$emit('changesidebartype', 'primary')
      this.$emit('closemodal')

      this.toggleSelectAllCheckAction(true)
    }
    this.updatingParticipants = false
  }
}
</script>
