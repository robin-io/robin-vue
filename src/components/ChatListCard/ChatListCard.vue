<template>
  <!-- TYPE 1 -->
  <div
    v-if="type === 1"
    class="robin-card robin-flex robin-flex-align-center"
    :class="{
      'robin-card-active': currentConversation._id == item._id && screenWidth > 1200
    }"
    @click.self="openConversation"
    :data-testid="`conversation-${index}`"
    :id="`conversation-${index}`"
  >
    <div class="robin-card-info robin-mr-12" @click="openConversation">
      <avatar
        v-if="!item.is_group"
        :img-url="getProfileImage(item) || item.display_photo"
        :sender-token="item.sender_token === $user_token ? item.receiver_token : item.sender_token"
        data-testid="regular-avatar"
      />

      <group-avatar v-else :img-url="item.group_icon" data-testid="group-avatar" />
    </div>

    <div
      class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-pt-4 robin-pb-41 robin-flex-1"
      @click.self="openConversation"
    >
      <div class="robin-flex robin-flex-space-between" @click="openConversation">
        <message-content
          font-weight="normal"
          :color="currentTheme == 'light' ? '#000000' : '#F9F9F9'"
          :font-size="16"
          :line-height="20"
          v-if="!item.is_group"
        >
          {{ item.sender_token != $user_token ? item.sender_name : item.receiver_name }}
        </message-content>

        <message-content
          font-weight="normal"
          :color="currentTheme == 'light' ? '#000000' : '#F9F9F9'"
          :font-size="16"
          :line-height="20"
          v-else
        >
          {{ item.name }}
        </message-content>

        <message-content
          as="p"
          fontWeight="normal"
          :color="currentTheme == 'light' ? '#51545C' : '#B6B6B6'"
          :fontSize="14"
          :lineHeight="18"
        >
          {{
            getRecentMessageTime(
              item.last_message && item.last_message.timestamp
                ? item.last_message.timestamp
                : item.updated_at
            )
          }}
        </message-content>
      </div>
      <div class="robin-flex robin-flex-space-between" @click.self="openConversation">
        <div class="robin-mini-info-container robin-flex-1" @click="openConversation">
          <message-content
            as="p"
            font-weight="normal"
            :color="currentTheme == 'light' ? '#8D9091' : '#B6B6B6'"
            :font-size="14"
            :line-height="18"
            v-if="item.last_message && !item.last_message.is_attachment"
          >
            {{
              item.last_message && item.last_message.msg && item.last_message.msg.length < 20
                ? item.last_message.msg
                : item.last_message && item.last_message.msg
                ? item.last_message.msg.substring(0, 20) + ' ...'
                : ''
            }}
          </message-content>

          <message-content
            v-show="item.last_message && item.last_message.is_attachment"
            as="p"
            font-weight="normal"
            :color="currentTheme == 'light' ? '#8D9091' : '#B6B6B6'"
            :font-size="14"
            :line-height="18"
          >
            <b><i>Attachment</i></b>
          </message-content>
        </div>

        <div class="robin-mini-info-container robin-flex robin-flex-align-center">
          <div
            class="mini-info robin-ml-10"
            v-if="item.unread_messages > 0 || item.unread_messages == 'marked'"
            @click.self="openConversation"
          >
            <unread-message-count :unread="item.unread_messages" />
          </div>
          <div class="robin-hidden robin-ml-10" @click="openModal" v-clickaway="closeModal">
            <icon-button name="openModalDot" :to-click-away="false" :to-emit="false" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- TYPE 2 -->
  <div
    v-else-if="type === 2"
    class="robin-card robin-flex robin-flex-align-center"
    :data-testid="`conversation-${item._id}`"
  >
    <div class="robin-card-info robin-mr-12">
      <group-avatar v-if="item.is_group" :img-url="item.group_icon" />

      <avatar
        :sender-token="item.sender_token === $user_token ? item.receiver_token : item.sender_token"
        :img-url="getProfileImage(item) || item.display_photo"
        v-else
      />
    </div>

    <div
      class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1"
    >
      <div class="robin-flex">
        <message-content
          v-show="!item.is_group"
          :color="currentTheme == 'light' ? '#8D9091' : '#B6B6B6'"
          :font-size="14"
          :line-height="18"
          >{{
            item.sender_token != $user_token ? item.sender_name : item.receiver_name
          }}</message-content
        >

        <message-content
          v-show="item.is_group"
          :color="currentTheme == 'light' ? '#8D9091' : '#B6B6B6'"
          :font-size="14"
          :line-height="18"
          >{{ item.name }}</message-content
        >
      </div>

      <div class="robin-ml-auto">
        <check-box @clicked="toggleCheckAction" ref="checkbox-comp" />
      </div>
    </div>
  </div>

  <!-- TYPE 3 -->
  <div v-else-if="type === 3" class="robin-card robin-flex robin-flex-align-center">
    <div class="robin-card-info robin-mr-12">
      <avatar :img-url="item.display_photo" :sender-token="item.user_token" />
    </div>

    <div
      class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1"
    >
      <div class="robin-flex">
        <message-content :font-size="14" :line-height="18" data-testid="content">
          {{ item.username || item.meta_data.name || '' }}
        </message-content>
      </div>
      <div class="robin-ml-auto">
        <check-box @clicked="toggleCheckAction" ref="checkbox-comp" data-testid="checkbox" />
      </div>
    </div>
  </div>

  <!-- TYPE 4 -->
  <div
    v-else
    class="robin-card robin-flex robin-flex-align-center robin-clickable"
    @click="$emit('create-conversation')"
  >
    <div class="robin-card-info robin-mr-12">
      <avatar :img-url="item.display_photo" :sender-token="item.user_token" />
    </div>

    <div
      class="robin-card-info robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4˝ robin-flex-1"
    >
      <div class="robin-flex">
        <message-content
          :font-size="14"
          :color="currentTheme === 'light' ? '#000000' : '#F9F9F9'"
          :line-height="18"
          >{{ item.username || item.meta_data.name || '' }}</message-content
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue'
import Component, { mixins } from 'vue-class-component'
import Content from '../Content/Content.vue'
import Avatar from '../Avatar/Avatar.vue'
import GroupAvatar from '../GroupAvatar/GroupAvatar.vue'
import UnreadMessageCount from '../UnreadMessageCount/UnreadMessageCount.vue'
import CheckBox from '../CheckBox/CheckBox.vue'
import IconButton from '../IconButton/IconButton.vue'
import ConversationMixin from '@/mixins/conversation-mixins'

const ComponentProps = mixins(ConversationMixin).extend({
  props: {
    index: {
      type: Number,
      default: 0
    },
    type: {
      type: Number,
      default: 1
    },
    item: {
      type: Object as PropType<ObjectType>,
      default: () => ({})
    }
  }
})

@Component({
  name: 'ChatListCard',
  components: {
    'message-content': Content,
    Avatar,
    GroupAvatar,
    UnreadMessageCount,
    IconButton,
    CheckBox
  }
})
export default class ChatListCard extends ComponentProps {
  currentTheme!: string;
  screenWidth!: number;
  currentConversation!: ObjectType;
  getRecentMessageTime!: (time: string) => string;

  openModal () {
    this.$emit('open-modal', this.index)
  }

  closeModal () {
    this.$emit('close-modal', this.index)
  }

  openConversation (): void {
    if (this.currentConversation._id !== this.item._id) this.$emit('open-conversation')
  }

  getProfileImage (conversation: ObjectType) {
    const index = this.$robin_users.findIndex(
      (user: any) => user.user_token === conversation.sender_token
    )

    return this.$robin_users[index] ? this.$robin_users[index].display_photo : null
  }

  toggleCheckAction (val: boolean) {
    this.$emit('toggle-check-action', val, this.item)
  }
}
</script>
