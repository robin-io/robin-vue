<script lang="tsx">
import { defineComponent, PropType, ref, computed } from 'vue-demi';
import useEmitter from '@/utilities/index';
import { RobinType, Hashmap } from '@/utilities/types';
import store from '@/store/index';
import { VLazyImage, VueClickaway } from '@/package-compatibility';
import IconButton from '../IconButton/IconButton.vue';
import GroupAvatar from '../GroupAvatar/GroupAvatar.vue';
import Avatar from '../Avatar/Avatar.vue';
import Content from '@/components/Content/Content.vue';
import MessagePreviewPopOver from '../MessagePreviewPopOver/MessagePreviewPopOver.vue';
import ForwardMessage from '../ForwardMessage/ForwardMessage.vue';

import './MessageImagePreview.css';

export default defineComponent({
  name: 'MessageImagePreview',
  props: {
    imagesToPreview: {
      type: Array as PropType<Array<Hashmap>>,
      default: () => []
    },
    conversation: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, context) {
    const popUp = ref();
    const popUpBody = ref();
    const imageSelected = ref(0);
    const selectedMessages = ref([] as Array<Hashmap>);
    const forwardMessage = ref(false);
    const images = ref([] as Array<Hashmap>);
    const id = ref(0);

    const settings = ref({
      dots: true,
      infinite: true,
      slidesToScroll: 1,
      rtl: true
    });
    const popUpState = ref({
      opened: false
    });
    const { emit, listen } = useEmitter();

    const robinUsers = computed(() => {
      return store.state.robin_users as Array<Hashmap>;
    });
    const robin = computed(() => {
      return store.state.robin as RobinType;
    });
    const userToken = computed(() => {
      return store.state.user_token;
    });

    const imagePreview = computed(() => {
      return images.value[imageSelected.value]
        ? images.value[imageSelected.value].content.attachment
        : '';
    });

    const isDeleteMessagesEnabled = computed(() => {
      return store.state.deleteMessagesEnabled;
    });

    const isForwardMessagesEnabled = computed(() => {
      return store.state.forwardMessagesEnabled;
    });

    const isReplyMessagesEnabled = computed(() => {
      return store.state.replyMessagesEnabled;
    });

    const handleOpenPopUp = (): void => {
      popUp.value.popUpBody.classList.remove('robin-zoomOut');

      popUpState.value.opened = true;
    };

    const handleClosePopUp = (): void => {
      popUp.value.popUpBody.classList.remove('robin-zoomIn');
      popUp.value.popUpBody.classList.add('robin-zoomOut');

      window.setTimeout(() => {
        popUp.value.popUpBody.classList.add('robin-zoomIn');
        popUp.value.popUpBody.classList.remove('robin-zoomOut');

        popUpState.value.opened = false;
      }, 300);
    };

    const closeImagePreview = () => {
      context.emit('close');
    };

    const getFileDetails = (attachmentUrl: string): Hashmap => {
      const fileName = attachmentUrl.substring(
        attachmentUrl.lastIndexOf('/') + 1
      );
      const strArr = fileName.split('.');

      return {
        name: strArr[strArr.length - 2],
        extension: strArr[strArr.length - 1]
      };
    };

    const getProfileImage = (conversation: Hashmap) => {
      const index = robinUsers.value.findIndex(
        (user: any) => user.userToken === conversation.sender_token
      );

      return robinUsers.value[index]
        ? robinUsers.value[index].profileImage
        : null;
    };

    const onSelectChange = (index: number): void => {
      imageSelected.value = index;
    };

    const downloadImage = (): void => {
      const fileDetails = getFileDetails(imagePreview.value) as any;
      const element = document.createElement('a');

      element.setAttribute('href', imagePreview.value);
      element.setAttribute(
        'download',
        fileDetails.name + ' ' + fileDetails.extension
      );
      element.click();
    };

    const deleteImage = async (): Promise<void> => {
      const res = await robin.value.deleteMessages(
        [images.value[imageSelected.value]._id],
        userToken.value
      );

      if (res && !res.error) {
        if (images.value.length < 2) closeImagePreview();

        emit('image-deleted', images.value[imageSelected.value]);

        window.setTimeout(() => {
          images.value.splice(imageSelected.value, 1);
        }, 300);
      } else {
        // this.$toast.open({
        //   message: 'Check your connection.',
        //   type: 'error',
        //   position: 'bottom-left'
        // })
      }
    };

    const openForwardMessage = () => {
      forwardMessage.value = true;
      selectedMessages.value = [props.imagesToPreview[0]];
      store.setState('messageViewProfileOpen', false);
    };

    const replyImageMessage = () => {
      store.setState('imageSelected', imageSelected.value);
      store.setState('isImageReplying', true);
      store.setState('messageViewProfileOpen', false);
      closeImagePreview();
    };

    const onCloseForwardMessagePopup = (): void => {
      forwardMessage.value = false;
      store.setState('selectMessagesOpen', false);
    };

    return {
      popUpBody,
      userToken,
      popUpState,
      images,
      getProfileImage,
      onSelectChange,
      onCloseForwardMessagePopup,
      handleClosePopUp,
      downloadImage,
      deleteImage,
      openForwardMessage,
      closeImagePreview,
      replyImageMessage,
      handleOpenPopUp
    };
  },
  render() {
    return (
      <div class="robin-image-box robin-squeezeOut" ref={this.popUpBody}>
        <header class="robin-head">
          <div class="robin-card-container robin-flex robin-flex-align-center">
            <div
              class="robin-wrapper robin-mr-27"
              onClick={() => this.closeImagePreview()}
            >
              <IconButton name="remove" to-emit={false} to-click-away={false} />
            </div>

            <div class="robin-card-info robin-mr-16">
              {this.conversation.is_group ? (
                <GroupAvatar img-url={this.conversation.group_icon} />
              ) : (
                <Avatar
                  img-url={
                    this.getProfileImage(this.conversation) ||
                    this.conversation.display_photo
                  }
                  sender-token={
                    this.conversation.sender_token === this.userTtoken
                      ? this.conversation.receiver_token
                      : this.conversation.sender_token
                  }
                />
              )}
            </div>

            <div class="robin-card-info robin-h-100 robin-flex robin-flex-column robin-flex-space-between robin-flex-1">
              <div class="robin-mt-6">
                {!this.conversation.is_group ? (
                  <Content
                    font-weight="normal"
                    color="#000000"
                    font-size={16}
                    line-height={20}
                  >
                    {() =>
                      this.conversation.sender_token != this.userToken
                        ? this.conversation.sender_name
                        : this.conversation.receiver_name
                    }
                  </Content>
                ) : (
                  <Content
                    font-weight="normal"
                    color="#000000"
                    font-size={16}
                    line-height={20}
                    v-else
                  >
                    {() => this.conversation.name}
                  </Content>
                )}
              </div>
            </div>
          </div>
          {this.isReplyMessagesEnabled ||
          this.isDeleteMessagesEnabled ||
          this.isForwardMessagesEnabled ||
          (this.isReplyMessagesEnabled &&
            this.isDeleteMessagesEnabled &&
            this.isForwardMessagesEnabled) ? (
            <div
              class="robin-options robin-ml-auto"
              onClick={() => this.handleOpenPopUp()}
              data-testid="options"
            >
              <IconButton
                name="openModalDot"
                onClickoutside={() => this.handleClosePopUp()}
                to-emit={false}
                to-click-away={true}
              />

              <div
                class="robin-popup-container"
                v-show={this.popUpState.opened}
              >
                <MessagePreviewPopOver
                  ref="popup-1"
                  onDelete={() => this.deleteImage()}
                  onDownload={() => this.downloadImage()}
                  onForward={() => this.openForwardMessage()}
                  onReply={() => this.replyImageMessage()}
                  data-testid="message-preview-popover"
                />
              </div>
            </div>
          ) : (
            ''
          )}
        </header>

        <div class="robin-body">
          <div class="robin-wrapper robin-w-100 robin-h-100 robin-flex robin-flex-column robin-flex-align-center robin-flex-space-between">
            <div class="robin-image-preview">
              <VLazyImage
                class="robin-uploaded-image"
                src={this.imagePreview}
              />
            </div>

            <div class="robin-image-row robin-overflow-x-auto robin-flex robin-flex-align-center robin-mt-16">
              {this.images.map((image, index) => {
                <VLazyImage
                  key={index}
                  src={image.content.attachment}
                  nativeOnClick={() => this.onSelectChange(index)}
                  class={
                    index === this.imageSelected && this.images.length > 1
                      ? 'robin-uploaded-image selected'
                      : 'robin-uploaded-image not-selected'
                  }
                />;
              })}
            </div>
          </div>
        </div>

        {this.forwardMessage ? (
          <ForwardMessage
            onClosemodal={() => this.onCloseForwardMessagePopup()}
            selected-messages={this.selectedMessages}
          />
        ) : (
          ''
        )}
      </div>
    );
  }
});
</script>
