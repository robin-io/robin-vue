<template>
  <div class="robin-side-container">
    <header class="robin-header">
      <RText
        text="Settings"
        fontWeight="400"
        color="rgba(83, 95, 137, 1)"
        :fontSize="17"
      />
      <REditButton @edit="$emit('changesidebartype', 'newchat')" />
    </header>
    <div class="robin-wrapper robin-w-100">
      <RSearchBar />
    </div>
    <div class="robin-wrapper robin-pt-10 robin-pb-11">
      <RTextButton @archived="$emit('changesidebartype', 'archivedchat')" />
    </div>
    <div
      class="robin-wrapper robin-card-container robin-flex robin-flex-column"
    >
      <div
        class="robin-card robin-flex robin-flex-align-center"
        v-for="conversation in conversations"
        :key="conversation._id"
        @click="openConversation(conversation)"
      >
        <div class="robin-card-info robin-mr-12">
          <RAvatar />
        </div>
        <div
          class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-pt-4 robin-pb-4˝ robin-flex-1"
        >
          <div class="robin-flex robin-flex-space-between">
            <RText
              :text="
                conversation.sender_token != $user_token
                  ? conversation.sender_name
                  : conversation.receiver_name
              "
              fontWeight="normal"
              color="#000000"
              :fontSize="16"
              :lineHeight="20"
            />

            <RText
              as="p"
              :text="recentMessageTime(conversation.updated_at)"
              fontWeight="normal"
              color="#566BA0"
              :fontSize="14"
              :lineHeight="18"
            />
          </div>
          <div class="robin-flex robin-flex-space-between">
            <RText
              as="p"
              text="We believe life is vast, and..."
              fontWeight="normal"
              color="#7A7A7A"
              :fontSize="14"
              :lineHeight="18"
            />

            <div class="robin-mini-info-container robin-flex">
              <!-- <div class="mini-info">
               <RMention />
            </div> -->
              <!-- use when mention icon is present robin-ml-8 -->
              <div class="mini-info robin-ml-auto">
                <RUnreadMessageCount :count="100" />
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
import moment from 'moment'
import EventBus from '@/event-bus'
import RText from './RText/RText.vue'
import REditButton from './REditButton/REditButton.vue'
import RSearchBar from './RSearchBar/RSearchBar.vue'
import RTextButton from './RTextButton/RTextButton.vue'
import RAvatar from './RAvatar/RAvatar.vue'
// import RGroupAvatar from './RGroupAvatar/RGroupAvatar.vue'
import RUnreadMessageCount from './RUnreadMessageCount/RUnreadMessageCount.vue'

export default Vue.extend({
  name: 'RSideContainer',
  components: {
    RText,
    REditButton,
    RSearchBar,
    RTextButton,
    RAvatar,
    // RGroupAvatar,
    RUnreadMessageCount
  },
  props: {
    conversations: {
      type: Array,
      default: (): Array<any> => []
    }
  },
  methods: {
    openConversation(conversation: object): void {
      console.log(conversation)
      EventBus.$emit('conversation-opened', conversation)
    },
    recentMessageTime(time: string): string {
      // const datetime = new Date(time)
      const datetime = moment(time)
      return datetime.calendar(null, {
        sameDay: 'hh:ss a',
        lastDay: '[Yesterday]',
        sameElse: 'DD/MM/YYYY'
      })
    }
  }
})
</script>

<style scoped>
.robin-side-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 3.563rem 1.5rem 1.5rem;
}

.robin-wrapper {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
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

.robin-card:hover {
  background-color: #f0f3f5;
  border-radius: 4px;
  cursor: pointer;
  padding: 1rem 0.75rem 1.1rem;
}
</style>
