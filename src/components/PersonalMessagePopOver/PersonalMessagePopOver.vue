<script lang="tsx">
import { defineComponent, ref, computed } from 'vue-demi';
import store from '@/store/index';
import './PersonalMessagePopOver.css';
import Content from '../Content/Content.vue';
import SvgIcon from '../SvgIcon/SvgIcon.vue';

export default defineComponent({
  name: 'PersonalMessagePopOver',
  components: {
    Content,
    SvgIcon
  },
  setup(_, { expose }) {
    const popUpBody = ref();
    const isDeleteMessagesEnabled = computed(
      () => store.state.deleteMessagesEnabled
    );

    const isForwardMessagesEnabled = computed(
      () => store.state.forwardMessagesEnabled
    );

    const handleSelectMessages = () => {
      return store.setState('selectMessagesOpen', true);
    };

    const handleClearMessages = () => {
      store.setState('clearMessages', true);
    };

    expose({ popUpBody });

    return {
      popUpBody,
      isForwardMessagesEnabled,
      isDeleteMessagesEnabled,
      handleClearMessages,
      handleSelectMessages
    };
  },
  render() {
    return (
      <div
        class="robin-popup robin-zoomIn"
        ref={(element) => (this.popUpBody = element)}
      >
        <div
          class="robin-wrapper robin-w-100"
          onClick={() => this.$emit('view-profile')}
        >
          <Content font-size={14} color="#51545C">
            {() => 'Contact Info'}
          </Content>

          <SvgIcon name="user-circle" />
        </div>
        {this.isForwardMessagesEnabled ||
        this.isDeleteMessagesEnabled ||
        (this.isForwardMessagesEnabled && this.isDeleteMessagesEnabled) ? (
          <div
            class="robin-wrapper robin-w-100"
            onClick={() => this.handleSelectMessages()}
          >
            <Content font-size={14} color="#51545C">
              {() => 'Select Messages'}
            </Content>

            <SvgIcon name="check-circle" />
          </div>
        ) : (
          ''
        )}
        {this.isDeleteMessagesEnabled ? (
          <div
            class="robin-wrapper robin-w-100"
            onClick={() => this.handleClearMessages()}
            v-if="isDeleteMessagesEnabled"
          >
            <Content font-size={14} color="#51545C">
              {() => 'Delete Chat'}
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
