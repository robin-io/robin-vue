<template>
  <div class="robin-side-container" ref="popup-body">
    <header class="robin-header">
      <RText font-weight="400" color="rgba(83, 95, 137, 1)" :fontSize="17"> New Chat </RText>
      <!-- <RCloseButton @close="openPreviousModal()" /> -->
      <IconButton name="close" @close="openPreviousModal()" emit="close" :to-emit="true" :to-click-away="false" />
    </header>
    <div class="robin-wrapper robin-w-100">
      <RSearchBar @user-typing="searchContacts($event)" :loading="isLoading" :key="key" placeholder="Search or start new chat" />
    </div>
    <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-mt-42">
      <div class="robin-card robin-flex robin-flex-align-center">
        <div class="robin-card-info robin-mr-12">
          <RGroupAvatar />
        </div>
        <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1">
          <div class="robin-flex">
            <RButton color="#15AE73" :font-size="14" :line-height="18" emit="newgroupchat" @newgroupchat="openGroupChat()">Create A New Group</RButton>
          </div>
        </div>
      </div>
    </div>
    <!-- <div
      class="robin-wrapper robin-card-container robin-flex robin-flex-column"
    >
      <div class="robin-card robin-flex robin-flex-align-center">
        <div class="robin-card-info robin-mr-12">
          <RNewContactAvatar />
        </div>
        <div
          class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1"
        >
          <div class="robin-flex">
            <RButton
              color="#15AE73"
              :font-size="14"
              :line-height="18"
            >Add New Contact</RButton>
          </div>
        </div>
      </div>
    </div> -->
    <div class="robin-contact-container robin-overflow-y-auto">
      <div v-for="(contact, key, index) in contacts" :key="`contact-${index}`">
        <RAlphabetBlock :text="key" />
        <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-grey-200">
          <div class="robin-card robin-flex robin-flex-align-center robin-clickable" v-for="user in contact" :key="user.userToken" @click="createConversation(user)">
            <div class="robin-card-info robin-mr-12">
              <RAvatar />
            </div>
            <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1">
              <div class="robin-flex">
                <RText :font-size="14" :line-height="18">{{ user.userName }}</RText>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <RAlphabetBlock text="B" /> -->
    <!-- <div
      class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-grey-200"
    >
      <div
        class="robin-card robin-flex robin-flex-align-center robin-clickable"
      >
        <div class="robin-card-info robin-mr-12">
          <RAvatar />
        </div>
        <div
          class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1"
        >
          <div class="robin-flex">
            <RText text="Temi Obadofin" :fontSize="14" :lineHeight="18" />
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '../../store/index'
import Component from 'vue-class-component'
import RText from './RText/RText.vue'
import RSearchBar from './RSearchBar/RSearchBar.vue'
// import RCloseButton from './RCloseButton/RCloseButton.vue'
import RButton from './RButton/RButton.vue'
import RGroupAvatar from './RGroupAvatar/RGroupAvatar.vue'
import RAvatar from './RAvatar/RAvatar.vue'
// import RNewContactAvatar from './RNewContactAvatar/RNewContactAvatar.vue'
import RAlphabetBlock from './RAlphabetBlock/RAlphabetBlock.vue'
import EventBus from '@/event-bus'
import IconButton from '../IconButton/IconButton.vue'

// eslint-disable-next-line
@Component<NewChatList>({
  name: 'NewChatList',
  components: {
    RText,
    RSearchBar,
    RButton,
    RGroupAvatar,
    IconButton,
    // RNewContactAvatar,
    // RCloseButton,
    RAvatar,
    RAlphabetBlock
  },
  watch: {
    robinUsers: {
      handler (val) {
        this.getContacts('')
      },
      immediate: true
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

  get robinUsers () {
    return store.state.users
  }

  async createConversation (user: any) {
    // console.log(this.$user_token, user.userToken)

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
      // console.log(res)
      EventBus.$emit('conversation-opened', res.data)
      EventBus.$emit('open-conversation')
    } else {
      this.$toasted.global.custom_error('Check your connection.')
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
    // console.log(this.robinUsers)
    this.contacts = {}

    if (searchText.trim() === '') {
      this.robinUsers.forEach((user) => {
        this.contacts[this.getContactKey(user.userName)] = this.robinUsers.filter((item) => this.validateContact(item.userName, user.userName))
      })

      this.sortContacts()
    } else {
      this.searchData.forEach((user) => {
        this.contacts[this.getContactKey(user.userName)] = this.searchData.filter((item) => this.validateContact(item.userName, user.userName))
      })
    }
  }

  searchContacts (searchText: string): void {
    this.isLoading = true
    // eslint-disable-next-line array-callback-return
    const data = this.robinUsers.filter((obj) => {
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
    this.$emit('openmodal', 'newgroupchat')
    setTimeout(() => {
      this.refresh()
    }, 300)
  }

  getContactKey (username: any): string {
    return username.trim() !== '' && isNaN(parseInt(username[0])) ? username[0].toUpperCase() : '*'
  }

  validateContact (usernameVal:any, username: any): boolean {
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
  z-index: 1;
  background-color: #fff;
}

header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(10%, 4vh, 3.563rem) clamp(2%, 4vw, 1.5rem) 1.5rem;
}

.robin-contact-container {
  width: 100%;
}

.robin-wrapper {
  padding: 0 clamp(2%, 4vw, 1.5rem);
}

.robin-card-container {
  width: 100%;
}

.robin-card-container .robin-card {
  border-bottom: 1px solid #f4f6f8;
  padding: 1rem 0 1.1rem;
  transition: all 0.15s;
}

.robin-card-container:last-child .robin-card {
  border-bottom: none;
}

.robin-alphabet-block {
  width: 100%;
  padding: 0 1.5rem;
  height: 28px;
  background-color: #f3f3f3;
}

.robin-alphabet-block + .robin-card-container .robin-card:hover {
  background-color: #c8c8c8;
  /* padding: 1rem 0.75rem 1.1rem; */
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
