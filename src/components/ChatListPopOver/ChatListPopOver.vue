<script lang="tsx">
import { defineComponent, ref, computed, h } from 'vue-demi';
import store from '@/store/index';
import Content from '../Content/Content.vue';
import SvgIcon from '../SvgIcon/SvgIcon.vue';
import './ChatListPopOver.css';

export default defineComponent({
  name: 'ChatListPopOver',
  props: {
    conversation: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    Content,
    SvgIcon
  },
  emits: [
    'archive-chat',
    'mark-as-read',
    'mark-as-unread',
    'delete-conversation'
  ],
  setup(props, { expose }) {
    const popUpBody = ref();
    const isDeleteMessagesEnabled = computed(() => {
      return store.state.deleteMessagesEnabled;
    });
    const isArchiveChatEnabled = computed(() => {
      return store.state.archiveChatEnabled;
    });

    expose({
      popUpBody
    });

    return {
      popUpBody,
      isDeleteMessagesEnabled,
      isArchiveChatEnabled
    };
  },
  render() {
    return (
      <div
        class="robin-chat-list-popup robin-zoomIn"
        ref={((element: HTMLElement) => (this.popUpBody = element)) as any}
      >
        <div
          class="robin-wrapper robin-w-100"
          onClick={() =>
            this.conversation.unread_messages > 0 ||
            this.conversation.unread_messages == 'marked'
              ? this.$emit('mark-as-read')
              : this.$emit('mark-as-unread')
          }
        >
          <Content font-size={14} color="#101010">
            {this.conversation.unread_messages > 0 ||
            this.conversation.unread_messages == 'marked'
              ? 'Mark As Read'
              : 'Mark As Unread'}
          </Content>
          <SvgIcon name="comment" color="#51545C" />
        </div>
        {this.isArchiveChatEnabled ? (
          <div
            class="robin-wrapper robin-w-100"
            onClick={() => this.$emit('archive-chat')}
          >
            <Content font-size={14} color="#101010">
              {() => 'Archive Chat'}
            </Content>
            <SvgIcon name="mailbox" color="#51545C" />
          </div>
        ) : (
          ''
        )}
        {this.isDeleteMessagesEnabled ? (
          <div
            class="robin-wrapper robin-w-100"
            onClick={() => this.$emit('delete-conversation')}
          >
            <Content font-size={14} color="#D53120">
              Delete Chat
            </Content>
            <SvgIcon name="trash" />
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
});
</script>
