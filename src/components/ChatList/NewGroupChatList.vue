<template>
  <div class="robin-side-container" ref="popup-body">
    <header class="robin-header">
      <div class="robin-mr-10" @click="$emit('closemodal', 'newchat')">
        <RCloseButton />
      </div>
      <div class="robin-mb-5">
        <RText font-weight="400" color="rgba(83, 95, 137, 1)" :font-size="16">New Group Chat</RText>
      </div>
      <div class="robin-ml-auto">
        <RButton emit="done" @done="openModal()" v-show="users.length > 0" class="robin-pulse">Done</RButton>
      </div>
    </header>
    <div class="robin-wrapper robin-w-100">
      <RSearchBar @user-typing="searchContacts($event)" :loading="isLoading" />
    </div>
    <div class="robin-contact-container" v-for="(contact, key, index) in contacts" :key="`contact-${index}`">
      <div class="robin-w-100">
        <RAlphabetBlock :text="key" />
      </div>
      <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-grey-200">
        <div class="robin-card robin-flex robin-flex-align-center" v-for="(user, userIndex) in contact" :key="user.userToken">
          <div class="robin-card-info robin-mr-12">
            <RAvatar />
          </div>
          <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1">
            <div class="robin-flex">
              <RText :font-size="14" :line-height="18">{{ user.userName }}</RText>
            </div>
            <div class="robin-ml-auto">
              <RCheckBox :key="addIndexToCheckBoxState(userIndex, checkBoxKeyState)" @clicked="toggleCheckAction($event, user)" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="robin-w-100 robin-mt-38">
      <RAlphabetBlock />
    </div>
    <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-grey-200">
      <div class="robin-card robin-flex robin-flex-align-center">
        <div class="robin-card-info robin-mr-12">
          <RAvatar />
        </div>
        <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1">
          <div class="robin-flex">
            <RText :font-size="14" :line-height="18">Temi Obadofin</RText>
          </div>
          <div class="robin-ml-auto">
            <RCheckBox />
          </div>
        </div>
      </div>
    </div>
    <RAlphabetBlock text="B" />
    <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-grey-200">
      <div class="robin-card robin-flex robin-flex-align-center">
        <div class="robin-card-info robin-mr-12">
          <RAvatar />
        </div>
        <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1">
          <div class="robin-flex">
            <RText :font-size="14" :line-Height="18">Temi Obadofin</RText>
          </div>
          <div class="robin-ml-auto">
            <RCheckBox />
          </div>
        </div>
      </div>
    </div> -->
    <CreateGroup v-show="modalOpen" @closemodal="closeModal()" :users="users" @remove-user="removeUser($event)" @changesidebartype="$emit('openmodal', $event)" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// import * as _ from 'lodash'
import Component from 'vue-class-component'
import RCloseButton from './RCloseButton/RCloseButton.vue'
import RText from './RText/RText.vue'
import RSearchBar from './RSearchBar/RSearchBar.vue'
import RButton from './RButton/RButton.vue'
import RAvatar from './RAvatar/RAvatar.vue'
import RCheckBox from './RCheckBox/RCheckBox.vue'
import CreateGroup from './CreateGroup.vue'
import RAlphabetBlock from './RAlphabetBlock/RAlphabetBlock.vue'

@Component({
  name: 'NewGroupChatList',
  components: {
    RText,
    RSearchBar,
    RButton,
    RAvatar,
    RCloseButton,
    RCheckBox,
    CreateGroup,
    RAlphabetBlock
  }
})
export default class NewGroupChatList extends Vue {
  modalOpen = false as boolean
  contacts = {} as any
  checkBoxKeyState = 0 as number
  users = [] as Array<any>
  isLoading = false as boolean
  searchData = [] as Array<any>

  created() {
    this.getContacts('')
  }

  closeModal(): void {
    this.modalOpen = false
    this.users = []
    this.checkBoxKeyState += 1
  }

  openModal(): void {
    this.modalOpen = true
  }

  getContacts(searchText: string): void {
    this.contacts = {}

    if (searchText.trim() === '') {
      this.$robin_users.forEach((user) => {
        this.contacts[user.userName[0].toUpperCase()] = this.$robin_users.filter((item) => item.userName[0].toUpperCase() === user.userName[0].toUpperCase())
      })
    } else {
      this.searchData.forEach((user) => {
        this.contacts[user.userName[0].toUpperCase()] = this.searchData.filter((item) => item.userName[0].toUpperCase() === user.userName[0].toUpperCase())
      })
    }
  }

  toggleCheckAction(val: boolean, user: Object): void {
    if (!val) {
      this.addUser(user)
    } else {
      this.removeUser(user)
    }
  }

  addUser(user: Object): void {
    this.users.push(user)
  }

  removeUser(user: any): void {
    const userIndex = this.users.findIndex((item) => item.userToken === user.userToken)
    this.users.splice(userIndex, 1)

    if (this.users.length < 1) {
      this.closeModal()
    }
  }

  addIndexToCheckBoxState(index: any, checkBoxKeyState: number): number {
    return parseInt(index) + checkBoxKeyState
  }

  searchContacts(searchText: string): void {
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
  padding: 3.563rem 1.5rem 1.5rem;
}

.robin-contact-container {
  width: 100%;
}

.robin-wrapper {
  padding: 0 1.5rem;
}

.robin-card-container {
  width: 100%;
}

.robin-contact-container:nth-child(3) {
  margin-top: 2.375rem;
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
