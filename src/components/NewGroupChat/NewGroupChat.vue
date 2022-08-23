<script lang="tsx">
import { ref, reactive, defineComponent, PropType } from 'vue-demi';
import { Hashmap } from '@/utilities/types';
import IconButton from '../IconButton/IconButton.vue';
import Content from '../Content/Content.vue';
import Input from '../Input/Input.vue';
import Button from '../Button/Button.vue';
import GroupAvatar from '../GroupAvatar/GroupAvatar.vue';

export default defineComponent({
  name: 'NewGroupChat',
  props: {
    groupName: {
      type: String as PropType<string>,
      default: '',
    },
  },
  components: {
    Content,
    Input,
    Button,
    GroupAvatar,
    IconButton,
  },
  setup(_, context) {
    const name = ref('');
    let icon = reactive({} as Hashmap);
    const resetInput = ref(false);
    const acceptedVisualFiles = ref('image/png, image/jpg, image/jpeg');

    const userTyping = (val: string) => {
      name.value = val;
    };

    const openPreviousModal = () => {
      context.emit('closemodal', 'newchat');
      icon = reactive({});
      name.value = '';
      resetInput.value = true;
    };

    const openGroupChatList = () => {
      context.emit('openmodal', 'newgroupchat');
      context.emit('set-groupicon', icon);
      context.emit('set-groupname', name);
    };

    const resetFileTarget = (event: any): void => {
      event.target.value = '';
    };

    const toBase64 = (file: File): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result?.toString() || '');
        reader.onerror = (error) => reject(error);
      });
    };

    const handleFileChange = async (file: any): Promise<void> => {
      let fileURL;

      try {
        fileURL = await toBase64(file[0]);
      } catch (e) {
        console.warn(e);
      }

      const typeIndex = file[0].name.lastIndexOf('.');

      if (file[0].size < 5000001) {
        icon.name = file[0].name.substring(0, typeIndex);
        icon.size = file[0].size;
        icon.type = file[0].type;
        icon.extension = file[0].name.substring(typeIndex + 1);
        icon.localUrl = fileURL;
        icon.file = file[0];
      } else {
        // this.$toast.open({
        //   message: 'Image upload cannot be more than 5mb',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    return {
      name,
      icon,
      acceptedVisualFiles,
      resetInput,
      handleFileChange,
      resetFileTarget,
      openPreviousModal,
      openGroupChatList,
      userTyping,
    };
  },
  render() {
    return (
      <div class="robin-new-group-chat">
        <header class="robin-header robin-mb-33">
          <IconButton
            name="remove"
            emit="close"
            to-emit={true}
            to-click-away={false}
            onClose={() => this.openPreviousModal()}
          />
          <Content font-weight={400} font-size={16} class="robin-ml-12">
            {() => 'New Group Chat'}
          </Content>

          <div class="robin-ml-auto">
            <Button
              emit="done"
              onDone={() => this.openGroupChatList()}
              v-show={this.name.length > 0}
              class="robin-pulse-2"
            >
              {() => 'Done'}
            </Button>
          </div>
        </header>

        <Content as="label" for-ref="group-icon-upload" class="robin-clickable">
          {() => (
            <>
              <div
                class="robin-group-image robin-mb-7"
                v-show={!this.icon.name}
              >
                <input
                  type="file"
                  style="display: none"
                  accept={this.acceptedVisualFiles}
                  onChange={(event) => {
                    const element = event.target as HTMLInputElement;
                    this.handleFileChange(element.files);
                  }}
                  onClick={(event) => this.resetFileTarget(event)}
                  id="group-icon-upload"
                  data-testid="group-icon-upload"
                />
                <Content color="#fff" fontSize={24}>
                  {() => 'RG'}
                </Content>
              </div>

              <img
                class="robin-group-image robin-mb-7"
                src={this.icon.localUrl}
                alt={this.icon.name}
                v-show={this.icon.name}
                data-testid="image"
              />

              <Content fontWeight="400" fontSize={14} class="robin-mb-32">
                {() => 'Tap To Add Group Image'}
              </Content>
            </>
          )}
        </Content>

        <div class="robin-wrapper robin-w-100">
          <Content fontWeight="400" fontSize={14} class="robin-mb-8">
            {() => 'Group Name'}
          </Content>

          <Input
            onUserTyping={(event: string) => this.userTyping(event)}
            text={this.groupName}
            reset={this.resetInput}
            placeholder="Robin Group"
          />
        </div>
      </div>
    );
  },
});
</script>
