<script lang="tsx">
import { defineComponent, PropType, computed, ref, watch } from 'vue-demi';
import moment from 'moment';
import ReactionPopOver from '../ReactionPopOver/ReactionPopover.vue';
import Content from '../Content/Content.vue';
import SvgIcon from '../SvgIcon/SvgIcon.vue';
import IconButton from '../IconButton/IconButton.vue';
import { VLazyImage } from '@/package-compatibility';
import { Hashmap } from '@/utilities/types';
import store from '@/store/index';
import './MessageGrid.css';

export default defineComponent({
  name: 'MessageGrid',
  props: {
    groupnameColors: {
      type: Object,
      default: () => {}
    },
    message: {
      type: Array as PropType<Array<Hashmap>>,
      default: (): Array<any> => []
    },
    messagePopup: {
      type: Object,
      default: () => {}
    },
    conversation: {
      type: Object,
      default: () => {}
    },
    readReceipts: {
      type: Array as PropType<Array<string>>,
      default: () => []
    }
  },
  setup(props, context) {
    const popUpBody = ref();
    const images = ref([] as Array<Hashmap>);

    const userToken = computed(() => {
      return store.state.user_token;
    });

    const robinUsers = computed(() => {
      return store.state.robin_users;
    });

    const getSizeOfGridClass = computed(() => {
      if (props.message.length >= 4) {
        return 'robin-grid-4-by-4';
      } else if (props.message.length === 3) {
        return 'robin-grid-3-by-3';
      } else {
        return 'robin-grid-2-by-2';
      }
    });

    const isMessageReactionViewEnabled = computed(() => {
      return store.state.messageReactionViewEnabled;
    });

    watch(
      () => props.message,
      (val: Array<Hashmap>) => {
        images.value = [...val].slice(0, 4) as Array<Hashmap>;
      }
    );

    const closeModal = () => {
      context.emit('close-modal', undefined);
    };

    const openPreview = (message: any): void => {
      context.emit('open-preview', message);
      closeModal();
    };

    const formatTimeStamp = (value: any): string => {
      return moment(String(value)).format('h:mma').toUpperCase();
    };

    const validateImageClass = (index: number): string => {
      return props.message.some(
        (item: any) =>
          item.content && item.content.sender_token !== userToken.value
      )
        ? `robin-image-sender robin-grid-${index}`
        : `robin-image-receiver robin-grid-${index}`;
    };

    const validateMessageClass = (): boolean => {
      return props.message.some(
        (item: any) =>
          item.content && item.content.sender_token === userToken.value
      );
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

    const downloadImages = async (messages: any) => {
      let intervalLevel = 0;

      const interval = setInterval(() => {
        if (intervalLevel === messages.length) {
          clearInterval(interval);

          return;
        }

        const element = document.createElement('a');
        const fileDetails = getFileDetails(
          messages[intervalLevel].content.attachment
        ) as any;
        element.setAttribute(
          'href',
          messages[intervalLevel].content.attachment
        );
        element.setAttribute(
          'download',
          fileDetails.name + ' ' + fileDetails.extension
        );

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        intervalLevel += 1;
      }, 1000);
    };

    const getContactName = (sender_token: string): string => {
      const index = robinUsers.value.findIndex(
        (user: Hashmap) => user.userToken === sender_token
      ) as number;
      const user = robinUsers.value[index] as any;
      return user ? user.userName : '';
    };

    const bindPopUpBodyToState = ((element: HTMLElement) => (popUpBody.value = element)) as any

    return {
      images,
      validateMessageClass,
      closeModal,
      isMessageReactionViewEnabled,
      formatTimeStamp,
      getContactName,
      validateImageClass,
      bindPopUpBodyToState,
      downloadImages,
      openPreview
    };
  },
  render() {
    return (
      <div
        class={
          !this.validateMessageClass()
            ? 'robin-message-grid robin-grid-sender'
            : 'robin-message-grid robin-grid-receiver'
        }
        onClickSelf={() => this.$emit('open-modal')}
        data-testid="bubble"
      >
        <div class="robin-popup-container reactions" ref={this.bindPopUpBodyToState}>
          <ReactionPopOver
            v-show={
              this.messagePopup.opened && this.isMessageReactionViewEnabled
            }
            onCloseModal={() => this.closeModal()}
            id={this.message[0]._id}
            message={this.message[0]}
            onReaction={(event: string) => this.$emit('add-reaction', event)}
          />

          {!this.validateMessageClass() && this.conversation.is_group ? (
            <Content
              font-size={12}
              as="span"
              color={this.groupnameColors[this.message[0].content.sender_token]}
              line-height={20}
              class="robin-messager-name robin-mb-4"
            >
              {() => this.getContactName(this.message[0].content.sender_token)}
            </Content>
          ) : (
            ''
          )}

          <div
            class={`robin-bubble-inner robin-grid-container ${this.getSizeOfGridClass}`}
            onClick={() => this.openPreview(this.message)}
            data-testid="bubble-inner"
          >
            {this.images.map((image: Hashmap, index: any) => (
              <>
                <div
                  class={`robin-message-bubble-image ${this.validateImageClass(
                    index
                  )}`}
                  key={image._id}
                >
                  <VLazyImage
                    class="robin-uploaded-image"
                    src={image.content.attachment}
                  />
                </div>

                <span
                  class={
                    this.message.length > 4
                      ? 'robin-drop-shadow robin-flex back-drop robin-flex-column robin-flex-space-between'
                      : 'robin-drop-shadow robin-flex robin-flex-end'
                  }
                >
                  <Content
                    v-show={this.message.length > 4}
                    font-size={26}
                    color="#fff"
                    as="p"
                    class="robin-message-count"
                  >
                    {() => `${this.message.length - 4}+`}{' '}
                  </Content>
                </span>
              </>
            ))}
          </div>

          <Content
            font-size={10}
            font-weight="300"
            color="#7a7a7a"
            as="p"
            class="robin-side-text"
          >
            {() => (
              <>
                {this.formatTimeStamp(this.message[0].content.timestamp)}
                {this.message[0].is_read ? (
                  <SvgIcon name="read" v-if="message[0].is_read" />
                ) : (
                  <SvgIcon name="not-read" />
                )}
              </>
            )}
          </Content>

          <IconButton
            class="download-btn"
            onClicked={() => this.downloadImages(this.message)}
            name="downloadImage"
            to-emit={true}
            to-click-away={false}
          />
        </div>
      </div>
    );
  }
});
</script>
