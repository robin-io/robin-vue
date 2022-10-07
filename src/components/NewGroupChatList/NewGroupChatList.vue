<template>
  <div class="robin-side-container" ref="popup-body">
    <header class="robin-header">
      <IconButton name="remove" @close="openPreviousModal()" emit="close" :to-emit="true" :to-click-away="false" />

      <Content font-weight="400" :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'" :font-size="16" class="robin-ml-12">{{ !updatingParticipants ? 'New Group Chat' : 'Add Group Participants' }}</Content>

      <div class="robin-ml-auto">
        <Button emit="done" @done="!updatingParticipants ? createGroupConversation() : addGroupParticipants()" v-show="users.length > 0 && !isUploading" class="robin-pulse-2">Done</Button>
        <div class="robin-spinner" v-show="isUploading"></div>
      </div>
    </header>

    <div class="robin-w-100 robin-pl-16 robin-pr-16">
      <SearchBar @user-typing="searchContacts($event)" :loading="isLoading" placeholder="Search" />
    </div>

    <div class="robin-select robin-flex robin-flex-align-center robin-flex-justify-end robin-w-100 robin-pl-16 robin-pr-16 robin-pt-24 robin-pb-23">
      <Content :color="currentTheme === 'light' ? '#9999BC' : '#B6B6B6'"> Select All </Content>
      <CheckBox class="robin-ml-8" @clicked="toggleSelectAllCheckAction($event)" data-testid="select-all-button" />
    </div>

    <div class="robin-contact-container robin-overflow-y-auto">
      <div v-for="(contact, key, index) in contacts" :key="`contact-${index}`">
        <div class="robin-w-100" v-show="key.toString() != '*'">
          <AlphabetBlock :text="key" />
        </div>

        <div class="robin-card-container robin-flex robin-flex-column">
          <div class="robin-card robin-flex robin-flex-align-center" v-for="(user, userIndex) in contact" :key="user.userToken">
            <div class="robin-card-info robin-mr-12">
              <Avatar :img-url="user.profileImage" :sender-token="user.userToken" />
            </div>

            <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1">
              <div class="robin-flex">
                <Content :font-size="14" :line-height="18" data-testid="content">{{ user.userName }}</Content>
              </div>
              <div class="robin-ml-auto">
                <CheckBox :key="addIndexToCheckBoxState(userIndex, checkBoxKeyState)" @clicked="toggleCheckAction($event, user)" ref="checkbox-comp" data-testid="checkbox" />
              </div>
            </div>
          </div>
        </div>
      </div>
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
import EventBus from '@/event-bus'

const ComponentProps = Vue.extend({
  props: {
    groupName: {
      type: String,
      default: ''
    },
    groupIcon: {
      type: Object,
      default: () => {}
    },
    robinUsers: {
      type: Array,
      default: () => []
    }
  }
})

// eslint-disable-next-line
@Component<NewGroupChatList>({
  name: 'NewGroupChatList',
  components: {
    Content,
    SearchBar,
    Button,
    Avatar,
    IconButton,
    CheckBox,
    AlphabetBlock
  },
  watch: {
    robinUsers: {
      handler (val) {
        this.getContacts('')
      }
    }
  }
})
export default class NewGroupChatList extends ComponentProps {
  modalOpen = false as boolean
  contacts = {} as any
  checkBoxKeyState = 0 as number
  users = [] as Array<any>
  isLoading = false as boolean
  isUploading = false as boolean
  searchData = [] as Array<any>
  updatingParticipants = false
  conversationId = ''
  key = 0 as number

  created () {
    this.getContacts('')
    this.handleAddGroupParticipants()
  }

  get currentTheme () {
    return store.state.currentTheme
  }

  closeModal (): void {
    this.modalOpen = false
    this.users = []
    this.checkBoxKeyState += 1
  }

  openModal (): void {
    this.modalOpen = true

    this.checkBoxKeyState += 1
  }

  getContacts (searchText: string): void {
    this.contacts = {}

    if (searchText.trim() === '') {
      this.robinUsers.forEach((user: any) => {
        this.contacts[this.getContactKey(user.userName)] = this.robinUsers.filter((item: any) => item.userToken !== this.$user_token && this.validateContact(item.userName, user.userName))
      })

      for (const key in this.contacts) {
        if (this.contacts[key].length === 0) {
          delete this.contacts[key]
        }
      }

      this.sortContacts()
    } else {
      this.searchData.forEach((user: any) => {
        this.contacts[this.getContactKey(user.userName)] = this.searchData.filter((item: any) => item.userToken !== this.$user_token && this.validateContact(item.userName, user.userName))
      })
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
    const checkboxComponents = this.$refs['checkbox-comp'] as any

    if (!val) {
      this.users = [...this.robinUsers]

      for (let i = 0; i < checkboxComponents.length; i += 1) {
        checkboxComponents[i].checked = true
      }
    } else {
      this.users = []

      for (let i = 0; i < checkboxComponents.length; i += 1) {
        checkboxComponents[i].checked = false
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

  addUser (user: Object): void {
    this.users.push(user)
  }

  removeUser (user: any): void {
    const userIndex = this.users.findIndex((item) => item.userToken === user.userToken)
    this.users.splice(userIndex, 1)

    if (this.users.length < 1) {
      this.closeModal()
    }
  }

  addIndexToCheckBoxState (index: any, checkBoxKeyState: number): number {
    return parseInt(index) + checkBoxKeyState
  }

  searchContacts (searchText: string): void {
    this.isLoading = true
    // eslint-disable-next-line array-callback-return
    const data = this.robinUsers.filter((obj: any) => {
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
      this.$emit('changesidebartype', 'primary')
      this.$emit('closemodal')

      this.toggleSelectAllCheckAction(true)
    }
    this.updatingParticipants = false
    setTimeout(() => {
      this.refresh()
    }, 300)
  }

  refresh (): void {
    this.key += 1
  }
}
</script>

<style scoped>
.robin-side-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
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
  margin: 1.688rem 0 0.625rem;
  background-color: var(--rb-color2);
}

.robin-contact-container {
  width: 100%;
}

.robin-select {
  border-bottom: 1px solid var(--rb-color5);
}

.robin-card-container {
  width: 100%;
}

.robin-contact-container:nth-child(3) {
  margin-top: 2.375rem;
}

.robin-card-container .robin-card {
  /* box-shadow: 0px 1px 0px 2.5px rgba(69, 104, 209, 0.05); */
  padding: 0.875rem 1rem 1rem;
  transition: all 0.15s;
  background-color: var(--rb-color2);
}

.robin-card-container .robin-card + .robin-card {
  margin-top: 0.25rem;
}

.robin-spinner {
  width: 19px;
  height: 19px;
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
