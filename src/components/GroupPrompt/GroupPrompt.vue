<script lang="tsx">
import { defineComponent, computed } from 'vue-demi';
import Content from '../Content/Content.vue';
import { RobinType, Hashmap } from '@/utilities/types';
import useEmitter from '@/utilities/index';
import store from '@/store/index';
import './GroupPrompt.css';

export default defineComponent({
  name: 'GroupPrompt',
  setup() {
    const { emit } = useEmitter();

    const robin = computed(() => {
      return store.state.robin as RobinType;
    });

    const currentConversation = computed(() => {
      return store.state.currentConversation as Hashmap;
    });

    const currentParticipantToken = computed(() => {
      return store.state.currentParticipantToken as string;
    });

    const isParticipantModerator = computed(() => {
      return store.state.isParticipantModerator as boolean;
    });

    const closeModal = () => {
      store.setState('groupPromptOpen', false);
    };

    const assignModerator = async () => {
      const res = await robin.value.assignGroupModerator(
        currentConversation.value._id,
        currentParticipantToken.value
      );

      if (res && !res.error) {
        emit('participant.assigned.moderator', res.data);
        closeModal();
      } else {
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    const removeGroupParticipant = async () => {
      const res = await robin.value.removeGroupParticipant(
        currentConversation.value._id,
        currentParticipantToken.value
      );

      if (res && !res.error) {
        closeModal();
      } else {
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    return {
      isParticipantModerator,
      closeModal,
      assignModerator,
      removeGroupParticipant
    };
  },
  render() {
    return (
      <div
        class="robin-shim robin-fadeIn"
        onClickSelf={() => this.closeModal()}
      >
        <div class="robin-card">
          {!this.isParticipantModerator ? (
            <div
              class="robin-wrapper robin-clickable"
              onClick={() => this.assignModerator()}
            >
              <Content font-size={18} color="#15AE73">
                {() =>
                  !this.isParticipantModerator
                    ? 'Assign moderator'
                    : 'Dismiss as moderator'
                }
              </Content>
            </div>
          ) : (
            ''
          )}
          <div
            class="robin-wrapper robin-clickable"
            onClick={() => this.removeGroupParticipant()}
          >
            <Content font-size={18} color="#D53120">
              {() => 'Remove participant'}
            </Content>
          </div>
        </div>
      </div>
    );
  }
});
</script>
