<template>
  <!-- eslint-disable vue/no-parsing-error -->
  <div class="robin-side-container" ref="popup-body">
    <header class="robin-header">
      <IconButton
        name="remove"
        color="#000"
        @close="$emit('closemodal', 'primary')"
        emit="close"
        :to-emit="true"
        :to-click-away="false"
        data-testid="closemodal"
      />

      <Content
        fontWeight="400"
        :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'"
        :fontSize="16"
        class="robin-ml-12"
      >
        Archived Messages
      </Content>
    </header>

    <div
      class="robin-wrapper robin-card-container robin-flex robin-flex-column robin-mt-42"
      @scroll="onScroll()"
    >
      <RecycleScroller
        :items="conversations"
        :items-size="conversations.length"
        :page-mode="true"
        key-field="_id"
        v-slot="{ item, index }"
      >
        <div
          data-testid="card"
          class="robin-card robin-flex robin-flex-align-center"
          :class="{ 'robin-card-active': currentConversation._id == item._id && screenWidth > 1200 }"
          :key="`item-${index}`"
          @click.self="openConversation(item)"
          v-show="conversations.length > 0"
        >
          <div class="robin-card-info robin-mr-12" @click="openConversation(item)">
            <Avatar
              data-testid="regular-avatar"
              v-if="!item.is_group"
              :key="avatarKey"
              :img-url="getProfileImage(item)"
              :sender-token="
                item.sender_token === $user_token ? item.receiver_token : item.sender_token
              "
            />

            <GroupAvatar data-testid="group-avatar" v-else :img-url="item.group_icon" />
          </div>

          <div
            class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-pt-4 robin-pb-4˝ robin-flex-1"
          >
            <div class="robin-flex robin-flex-space-between" @click="openConversation(item)">
              <Content
                fontWeight="normal"
                :color="currentTheme == 'light' ? '#000000' : '#F9F9F9'"
                :fontSize="16"
                :lineHeight="20"
                v-if="!item.is_group"
              >
                {{ item.sender_token != $user_token ? item.sender_name : item.receiver_name }}
              </Content>

              <Content
                font-weight="normal"
                :color="currentTheme == 'light' ? '#000000' : '#F9F9F9'"
                :font-size="16"
                :line-height="20"
                v-else
              >
                {{ item.name }}
              </Content>

              <Content
                as="p"
                fontWeight="normal"
                :color="currentTheme == 'light' ? '#51545C' : '#B6B6B6'"
                :fontSize="14"
                :lineHeight="18"
              >
                {{
                  formatRecentMessageTime(
                    item.last_message ? item.last_message.timestamp : item.updated_at
                  )
                }}
              </Content>
            </div>
            <div class="robin-flex robin-flex-space-between" @click.self="openConversation(item)">
              <Content
                as="p"
                fontWeight="normal"
                color="#8D9091"
                :fontSize="14"
                :lineHeight="18"
                @click.native="openConversation(item)"
              >
                {{
                  item.last_message && item.last_message.msg.length < 20
                    ? item.last_message.msg
                    : item.last_message
                    ? item.last_message.msg.substring(0, 20) + ' ...'
                    : ''
                }}
              </Content>

              <div class="robin-mini-info-container robin-flex robin-flex-align-center">
                <div
                  class="robin-hidden robin-ml-10"
                  data-testid="chat-handler"
                  @click="
                    handleOpenPopUp(
                      $event,
                      item._id,
                      `popup-container-${index}`,
                      `popup-${index}`,
                      index.toString()
                    )
                  "
                >
                  <IconButton
                    name="openModalDot"
                    @clickoutside="handleClosePopUp(item._id, `popup-${index}`)"
                    :to-emit="false"
                    :to-click-away="true"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            class="robin-popup-container"
            data-testid="chat-popover"
            :ref="`popup-container-${index}`"
            v-show="popUpStates[index].opened"
          >
            <ArchiveChatListPopOver
              :ref="`popup-${index}`"
              @unarchive-chat="unArchiveChat(item._id)"
            />
          </div>
        </div>
      </RecycleScroller>

      <div
        v-show="conversations.length < 1"
        class="robin-flex robin-flex-justify-center robin-pt-15"
      >
        <Content :font-size="18" color="#15AE73">No archived chat</Content>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import moment from 'moment'
import store from '@/store/index'
import Component from 'vue-class-component'
import EventBus from '@/event-bus'
import Content from '../Content/Content.vue'
import IconButton from '../IconButton/IconButton.vue'
import Avatar from '../Avatar/Avatar.vue'
import GroupAvatar from '../GroupAvatar/GroupAvatar.vue'
import ArchiveChatListPopOver from '../ArchiveChatListPopOver/ArchiveChatListPopOver.vue'
import RecycleScroller from '../RecycleScroller/RecycleScroller.vue'

const ComponentProps = Vue.extend({
  props: {
    archivedConversations: {
      type: Array,
      default: (): Array<any> => []
    }
  }
})

// eslint-disable-next-line
@Component<ArchivedChatList>({
  name: 'ArchivedChatList',
  components: {
    Content,
    IconButton,
    Avatar,
    GroupAvatar,
    ArchiveChatListPopOver,
    RecycleScroller
  },
  watch: {
    archivedConversations: {
      handler (val: Array<any>): void {
        this.conversations = [...val].sort((a, b) => {
          const dateA = moment(a.last_message ? a.last_message.timestamp : a.updated_at).valueOf()
          const dateB = moment(b.last_message ? b.last_message.timestamp : b.updated_at).valueOf()

          if (dateA > dateB) {
            return -1
          }

          if (dateB < dateA) {
            return 1
          }

          return 0
        })
        this.popUpStates = []
        ;[...val].forEach((val) => {
          this.popUpStates.push({
            opened: false,
            _id: val._id
          })
        })
      },
      immediate: true
    },
    $robin_users: {
      handler (val) {
        this.avatarKey += 1
      }
    }
  }
})
export default class ArchivedChatList extends ComponentProps {
  conversations: Array<any> = []
  popUpStates: Array<any> = []
  scroll = false as boolean
  avatarKey: number = 0
  screenWidth = 0 as number

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
  }

  get currentConversation () {
    return store.state.currentConversation
  }

  get currentTheme () {
    return store.state.currentTheme
  }

  openConversation (conversation: object): void {
    store.setState('imagePreviewOpen', false)
    store.setState('currentConversation', [])
    store.setState('conversationOpen', false)
    store.setState('currentConversation', conversation)

    this.$nextTick(() => {
      EventBus.$emit('open-conversation')
      EventBus.$emit('conversation-opened', conversation)
    })
  }

  getProfileImage (conversation: any) {
    const index = this.$robin_users.findIndex(
      (user: any) => user.userToken === conversation.sender_token
    )

    return this.$robin_users[index] ? this.$robin_users[index].profileImage : ''
  }

  handleOpenPopUp (
    event: any,
    _id: string,
    refContainerKey: string,
    refKey: string,
    id: string
  ): void {
    const popupContainer = this.$refs[refContainerKey] as any
    const popup = this.$refs[refKey] as any
    popup.$el.classList.remove('robin-zoomOut')

    if (
      (!this.scroll && this.conversations.length - 2 !== parseInt(id)) ||
      this.conversations.length - 1 !== parseInt(id)
    ) {
      popupContainer[0].style.top = event.clientY - 12 + 'px'

      if (this.screenWidth > 1024) {
        popupContainer[0].style.left = event.clientX - 90 + 'px'
      } else {
        popupContainer[0].style.left = event.clientX - 145 + 'px'
      }
    } else {
      popupContainer[0].style.top = event.clientY - 60 + 'px'
      if (this.screenWidth > 1024) {
        popupContainer[0].style.left = event.clientX - 90 + 'px'
      } else {
        popupContainer[0].style.left = event.clientX - 145 + 'px'
      }
    }

    const index = this.popUpStates.findIndex((val) => val._id === _id)
    this.popUpStates[index].opened = true

    this.popUpStates.forEach((val, i) => {
      if (val._id !== _id) {
        this.popUpStates[i].opened = false
      }
    })
  }

  handleClosePopUp (_id: string, refKey: string): void {
    const popup = this.$refs[refKey] as any
    popup.$el.classList.add('robin-zoomOut')

    window.setTimeout(() => {
      const index = this.popUpStates.findIndex((val) => val._id === _id)
      if (this.popUpStates[index].opened) {
        const popup = this.$refs[refKey] as any
        popup.$el.classList.remove('robin-zoomOut')

        this.popUpStates[index].opened = false
      }
    }, 300)
  }

  formatRecentMessageTime (time: string): string {
    const datetime = moment(time)

    return datetime.calendar(null, {
      sameDay: function () {
        return '[' + datetime.fromNow() + ']'
      },
      lastDay: function () {
        return '[' + datetime.fromNow() + ']'
      },
      lastWeek: function () {
        return '[' + datetime.fromNow() + ']'
      },
      sameElse: 'DD/MM/YYYY'
    })
  }

  onScroll (): void {
    this.scroll = true
  }

  async unArchiveChat (id: string): Promise<void> {
    const res = await this.$robin.unarchiveConversation(id, this.$user_token)

    if (!res.error) {
      const index = this.conversations.findIndex((conversation) => conversation._id === id)
      const conversation = this.conversations[index]
      conversation.archived_for = []

      EventBus.$emit('archived-conversation.delete', conversation)
      EventBus.$emit('regular-conversation.add', conversation)
      this.$toast.open({
        message: 'Conversation unarchived.',
        type: 'success',
        position: 'bottom-left'
      })
      this.$emit('refresh')
    }
  }

  onResize () {
    this.screenWidth = window.innerWidth
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
  z-index: 3;
  background-color: inherit;
}

header {
  width: 100%;
  display: flex;
  align-items: center;
  padding: clamp(2%, 4vh, 1rem) clamp(2%, 4vw, 1rem) 1rem;
  margin-top: 1.688rem;
  background-color: var(--rb-color2);
}

.robin-card-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 1rem;
}

.robin-card-container .robin-card {
  border-bottom: 3.5px solid var(--rb-color4);
  padding: 1rem 1rem 1.1rem;
  transition: all 0.15s;
  background-color: var(--rb-color2);
}

.robin-card-container .robin-card:nth-last-child(2) {
  border-bottom: none;
}

.robin-card-active {
  background-color: var(--rb-color5);
  cursor: default;
}

.robin-card-active:hover {
  cursor: default;
  border-radius: 4px;
}

.robin-card:hover {
  background-color: var(--rb-color4);
  border-radius: 4px;
  cursor: pointer;
  /* padding: 1rem 0.75rem 1.1rem; */
}

.robin-card:hover .robin-hidden {
  display: block;
  animation: slideInRight 300ms;
}

.robin-popup-container {
  position: fixed;
  z-index: 100;
}

.robin-mini-info-container {
  height: 20px;
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

@media (max-width: 1200px) {
  .robin-card-container {
    box-shadow: 0px 2px 20px rgba(0, 104, 255, 0.06);
  }

  .robin-hidden {
    display: block;
  }

  .robin-hidden >>> .robin-button {
    width: 20px;
    text-align: right;
  }

  .robin-card:not(.robin-card-active):hover {
    background-color: initial;
  }

  .robin-card:hover .robin-hidden {
    animation: none;
  }

  .robin-popup-container {
    right: 0px;
  }
}
</style>
