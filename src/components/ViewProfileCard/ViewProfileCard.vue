<template>
  <div v-if="type == 1" class="robin-card robin-flex robin-flex-align-center">
    <div class="robin-card-info robin-mr-12">
      <avatar :sender-token="item.user_token" />
    </div>

    <div
      class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1"
    >
      <div class="robin-flex">
        <message-content :font-size="14" :line-height="18">{{
          item.user_token === $user_token ? 'You' : item.meta_data.display_name
        }}</message-content>
      </div>

      <div v-show="item.is_moderator" class="robin-moderator-text">Moderator</div>
    </div>
  </div>

  <div
    v-else
    class="robin-card robin-flex robin-flex-align-center"
    @click.self="$emit('open-group-prompt')"
    :class="{
      'robin-clickable': currentConversation.is_group && item.user_token !== $user_token
    }"
  >
    <div class="robin-card-info robin-mr-12" @click="$emit('open-group-prompt')">
      <avatar :sender-token="item.user_token == $user_token ? '' : item.user_token" />
    </div>

    <div
      class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1"
      @click.self="$emit('open-group-prompt')"
    >
      <div class="robin-flex" @click="$emit('open-group-prompt')">
        <message-content :font-size="14" :line-height="18">{{
          item.user_token === $user_token ? 'You' : item.meta_data.display_name
        }}</message-content>
      </div>

      <div class="robin-ml-auto" v-show="!item.is_moderator" @click="$emit('remove-participant')">
        <icon-button name="remove2" :to-emit="false" :to-click-away="false" />
      </div>

      <div v-show="item.is_moderator" class="robin-moderator-text">Moderator</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import store from '@/store/index'
import Content from '../Content/Content.vue'
import Avatar from '../Avatar/Avatar.vue'
import IconButton from '../IconButton/IconButton.vue'

const ComponentProps = Vue.extend({
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
    IconButton
  }
})
export default class ChatListCard extends ComponentProps {
  get currentTheme () {
    return store.state.currentTheme
  }

  get screenWidth () {
    return store.state.screenWidth
  }

  get currentConversation () {
    return store.state.currentConversation
  }

  openConversation (): void {
    this.$emit('open-conversation')
  }

  getProfileImage (conversation: ObjectType) {
    const index = this.$robin_users.findIndex(
      (user: any) => user.userToken === conversation.sender_token
    )

    return this.$robin_users[index] ? this.$robin_users[index].profileImage : null
  }

  toggleCheckAction (val: boolean) {
    this.$emit('toggle-check-action', val, this.item)
  }
}
</script>
