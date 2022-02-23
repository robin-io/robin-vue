<template>
  <div class="robin-side-container" ref="popup-body">
    <header class="robin-header">
      <IconButton name="remove" @close="openPreviousModal()" emit="close" :to-emit="true" :to-click-away="false" />

      <RText font-weight="400" :font-size="16" class="robin-ml-12"> New Chat </RText>
    </header>

    <div class="robin-w-100 robin-pl-16 robin-pr-16">
      <RSearchBar @user-typing="searchContacts($event)" :loading="isLoading" :key="key" placeholder="Search or start new chat" />
    </div>

    <div class="robin-w-100 robin-create-group robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pl-16 robin-pr-16 robin-flex-1 robin-mt-31 robin-pb-16">
      <RButton color="#15AE73" :font-size="14" :line-height="18" emit="newgroupchat" @newgroupchat="openGroupChat()" class="robin-flex robin-flex-align-center">
        <SvgIcon name="3users" />

        <RText class="robin-ml-5" color="#15AE73">Create Group Chat</RText>
      </RButton>
    </div>

    <div class="robin-contact-container robin-overflow-y-auto">
      <div v-for="(contact, key, index) in contacts" :key="`contact-${index}`">
        <RAlphabetBlock :text="key" v-show="key.toString() != '*'" />

        <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-grey-200">
          <div class="robin-card robin-flex robin-flex-align-center robin-clickable" v-for="user in contact" :key="user.userToken" @click="createConversation(user)">
            <div class="robin-card-info robin-mr-12">
              <RAvatar :img-url="user.profileImage" :sender-token="user.userToken" />
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import RText from './RText/RText.vue'
import RSearchBar from './RSearchBar/RSearchBar.vue'
import RButton from './RButton/RButton.vue'
import SvgIcon from '../SvgIcon/SvgIcon.vue'
import RAvatar from './RAvatar/RAvatar.vue'
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
    SvgIcon,
    IconButton,
    RAvatar,
    RAlphabetBlock
  },
  watch: {
    $robin_users: {
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
      this.$robin_users.forEach((user) => {
        this.contacts[this.getContactKey(user.userName)] = this.$robin_users.filter((item) => item.userToken !== this.$user_token && this.validateContact(item.userName, user.userName))
      })

      this.sortContacts()
    } else {
      this.searchData.forEach((user) => {
        this.contacts[this.getContactKey(user.userName)] = this.searchData.filter((item) => item.userToken !== this.$user_token && this.validateContact(item.userName, user.userName))
      })
    }
  }

  searchContacts (searchText: string): void {
    this.isLoading = true
    // eslint-disable-next-line array-callback-return
    const data = this.$robin_users.filter((obj) => {
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
  z-index: 0;
  background-color: #fff;
}

header {
  width: 100%;
  display: flex;
  align-items: center;
  padding: clamp(10%, 4vh, 3.563rem) clamp(2%, 4vw, 1rem) 1.5rem;
}

.robin-contact-container {
  width: 100%;
}

.robin-create-group {
  border-bottom: 1px solid #EFEFEF;
  max-height: 30px;
}

/* .robin-wrapper {
  padding: 0 clamp(2%, 4vw, 1.5rem);
} */

.robin-card-container {
  width: 100%;
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

.robin-alphabet-block + .robin-card-container .robin-card:hover {
  background-color: #f5f7fc;
}

.robin-flex .robin-svg {
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
