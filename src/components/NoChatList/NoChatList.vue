<script lang="tsx">
import { defineComponent, ref, computed, useSlots } from 'vue-demi';
import store from '@/store/index';
import Content from '../Content/Content.vue';
import IconButton from '../IconButton/IconButton.vue';
import SearchBar from '../SearchBar/SearchBar.vue';
import Button from '../Button/Button.vue';
import SvgIcon from '../SvgIcon/SvgIcon.vue';
import assets from '@/asset-url.json';
import '../NoChatList/NoChatList.css';

export default defineComponent({
  name: 'NoChatList',
  components: {
    Content,
    IconButton,
    SearchBar,
    Button,
    SvgIcon
  },
  setup(_, context) {
    const slots = useSlots();
    const key = ref(0);
    const logo = computed(() => store.state.logo as string);

    const isCreateChatEnabled = computed(() => {
      return store.state.createChatEnabled;
    });

    const openEdit = (): void => {
      context.emit('opennewchatmodal', 'newchat');
      setTimeout(() => {
        refresh();
      }, 300);
    };

    const refresh = (): void => {
      key.value += 1;
    };

    return {
      slots,
      key,
      logo,
      openEdit,
      isCreateChatEnabled
    };
  },
  render() {
    return (
      <div class="robin-no-chat-list">
        <header class="robin-header robin-flex robin-flex-align-center">
          {this.logo === '' ? (
            <img src={assets['logo']} alt="logo" />
          ) : (
            <img class="custom" src={this.logo} alt="logo" />
          )}

          <div class="robin-buttons robin-flex robin-flex-align-center">
            {this.isCreateChatEnabled ? (
              <IconButton
                name="edit"
                onEdit={() => this.openEdit()}
                emit="edit"
                to-emit={true}
                to-click-away={false}
                color="#fff"
                data-testid="edit"
              />
            ) : (
              ''
            )}
            {this.slots['chat-list-header']?.()}
          </div>
        </header>

        <div class="robin-wrapper robin-pl-16 robin-pr-16 robin-w-100">
          <SearchBar key={this.key} />
        </div>

        <div class="robin-wrapper robin-pl-16 robin-pr-16 robin-flex robin-flex-column robin-flex-align-center robin-h-100 robin-w-100 robin-flex-1 robin-pt-100">
          <SvgIcon name="nochat" />

          <div class="robin-mb-13 robin-mt-33">
            <Content fontWeight="normal" color="#535F89">
              {() => 'No Messages Yet'}
            </Content>
          </div>

          {this.isCreateChatEnabled ? (
            <Button emit="newchat" onNewChat={() => this.openEdit()}>
              {() => 'Start a chat'}
            </Button>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
});
</script>
