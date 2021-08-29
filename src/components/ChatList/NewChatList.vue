<template>
  <div class="robin-side-container">
    <header class="robin-header">
      <RText font-weight="400" color="rgba(83, 95, 137, 1)" :fontSize="17"> New Chat </RText>
      <RCloseButton @close="$emit('changesidebartype', 'primary')" />
    </header>
    <div class="robin-wrapper robin-w-100">
      <RSearchBar />
    </div>
    <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-mt-42">
      <div class="robin-card robin-flex robin-flex-align-center">
        <div class="robin-card-info robin-mr-12">
          <RGroupAvatar />
        </div>
        <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1">
          <div class="robin-flex">
            <RTextButton text="Create A New Group" color="#15AE73" :font-size="14" :line-height="18" emit="newgroupchat" @newgroupchat="$emit('changesidebartype', 'newgroupchat')" />
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
            <RTextButton
              text="Add New Contact"
              color="#15AE73"
              :font-size="14"
              :line-height="18"
            />
          </div>
        </div>
      </div>
    </div> -->
    <RAlphabetBlock />
    <div class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-grey-200">
      <div class="robin-card robin-flex robin-flex-align-center robin-clickable" v-for="user in $robin_users" :key="user.userToken" @click="createConversation(user)">
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
import Component from 'vue-class-component'
import RText from './RText/RText.vue'
import RSearchBar from './RSearchBar/RSearchBar.vue'
import RCloseButton from './RCloseButton/RCloseButton.vue'
import RTextButton from './RTextButton/RTextButton.vue'
import RGroupAvatar from './RGroupAvatar/RGroupAvatar.vue'
import RAvatar from './RAvatar/RAvatar.vue'
// import RNewContactAvatar from './RNewContactAvatar/RNewContactAvatar.vue'
import RAlphabetBlock from './RAlphabetBlock/RAlphabetBlock.vue'
import EventBus from '@/event-bus'

@Component({
  name: 'RNewChatList',
  components: {
    RText,
    RSearchBar,
    RTextButton,
    RGroupAvatar,
    // RNewContactAvatar,
    RCloseButton,
    RAvatar,
    RAlphabetBlock
  }
})
export default class NewChatList extends Vue {
  async createConversation(user: any) {
    const resp = await this.$robin.createConversation({
      sender_name: 'vue test',
      sender_token: this.$user_token,
      receiver_token: user.userToken,
      receiver_name: user.userName
    })
    console.log(resp)

    if (!resp.error) {
      if (!this.checkConversations(resp.data)) {
        this.$conversations.push(resp.data)
      }
      this.$emit('changesidebartype', 'primary')
      EventBus.$emit('conversation-opened', resp.data)
    }
  }

  checkConversations(convo: any): Boolean {
    let res = false
    this.$conversations.forEach((conversation) => {
      if (conversation._id === convo._id) {
        res = true
      }
    })
    return res
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
}

header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 3.563rem 1.5rem 1.5rem;
}

.robin-wrapper {
  padding: 0 1.5rem;
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
</style>
