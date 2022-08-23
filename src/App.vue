<script lang="tsx">
import {
  ref,
  onMounted,
  nextTick,
  PropType,
  defineComponent,
  watchEffect,
  watch,
  computed,
  reactive,
  useSlots
} from 'vue-demi';
import { Robin } from 'robin.io-js';
import SideContainer from './components/SideContainer/SideContainer.vue';
import store from './store/index';
import useEmitter from './utilities/index';
import { Hashmap } from './utilities/types';
import assets from './asset-url.json';
import PrimaryChatListVue from './components/PrimaryChatList/PrimaryChatList.vue';

export default defineComponent({
  name: 'RobinChat',
  props: {
    userToken: {
      type: String as PropType<string>,
      default: 'clpYwBMnDGdynSarEBZOuPWZ'
    },
    apiKey: {
      type: String as PropType<string>,
      default: 'NT-XmIzEmWUlsrQYypZOFRlogDFvQUsaEuxMfZf'
    },
    pageLoader: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    channel: {
      type: String as PropType<string>,
      default: 'private_chat'
    },
    userName: {
      type: String as PropType<string>,
      default: 'Enoch Chejieh'
    },
    users: {
      type: Array as PropType<Array<any>>,
      default: (): Array<any> => [
        {
          _id: '621436282dc9a4e040d741bb',
          created_at: '2022-02-22T01:02:32.517Z',
          updated_at: '2022-02-22T01:02:32.517Z',
          fullname: 'Testing Tester',
          user_token: 'GmStKZeaAzsYzxsdIlFvoJSa',
          password:
            '$2a$14$ynUAMEo0StZa7FnbipS6l.qgAObpZJL.SkvXXVKjRalPKTK0Y51ce',
          profile_image: '',
          email: 'testingtester@gmail.com'
        }
      ]
    },
    logo: {
      type: String as PropType<string>,
      default: ''
    },
    features: {
      type: Array as PropType<Array<string>>,
      default: () => ['create-chat', 'voice-recorder']
    },
    useDefaultProfileDetails: {
      type: Boolean,
      default: true
    },
    keys: {
      type: Object as PropType<any>,
      default: (): any => {
        return {
          userToken: 'user_token',
          userName: 'fullname',
          profileImage: 'profile_image'
        };
      }
    },
    imageUrl: {
      type: String as PropType<string>,
      default: ''
    }
  },
  components: {
    SideContainer
    // MessageContainer,
    // PageLoader,
    // NoMessageSelected,
    // MessageImagePreviewer,
    // ViewProfile,
    // GroupPrompt,
    // EncryptionDetails
  },
  setup(props) {
    const slots = useSlots();
    const robin = ref(null as null | Robin);
    const conn = ref(null as null | WebSocket);
    const messageEvent = ref(null as null | Record<string, any>);
    const key = ref(0);
    const time = ref(0);
    const screenWidth = ref(0);
    const popup = reactive({
      popup1: ref(null),
      popup2: ref(null)
    });

    const notification = ref(null as null | HTMLAudioElement);
    const popupOne = ref(null as null | HTMLDivElement);
    const popupTwo = ref(null as null | HTMLDivElement);

    const currentConversation = computed(() => store.state.currentConversation);

    const { emit, listen } = useEmitter();

    const filterUsers = () => {
      const filteredUsers: Array<any> = [];
      props.users.forEach((user) => {
        const newUser = {
          userToken: user[props.keys?.userToken],
          profileImage: user[props.keys?.profileImage],
          userName: user[props.keys?.userName]
        };
        filteredUsers.push(newUser);
      });

      store.setState('robin_users', [...filteredUsers]);
    };

    watchEffect(() => {
      if (props.users.length) {
        filterUsers();
      }
    });

    listen('open-conversation', () => {
      openConversation();
    });
    listen('left.group', () => {
      leaveGroup();
    });

    listen('close-conversation', () => {
      closeConversation();
    });

    listen('left.message', () => {
      leaveMessage();
    });

    listen('open-profile', () => {
      openProfile();
    });

    watch([time, currentConversation], ([time, currentConversation], []) => {
      if (time) {
        if (time === 9) {
          connect();
          resetStopWatch();
        }
      }

      if (currentConversation) {
        closeMessageViewProfile();
      }
    });

    onMounted(() => {
      nextTick(() => {
        onResize();
      });
      window.addEventListener('resize', onResize);

      setInterval(() => {
        time.value += 1;
      }, 60000);
    });

    const initiateRobin = () => {
      robin.value = new Robin(props.apiKey, true);
      connect();
      setGlobals();
    };

    const connect = () => {
      conn.value = robin.value?.connect(props.userToken) as WebSocket;

      conn.value.onmessage = (evt: any) => {
        const message = JSON.parse(evt.data);
        if (message.is_event !== true) {
          emit('new-message', message);
          messageEvent.value = message;

          if (notification.value) {
            notification.value.click();
          }
        } else {
          handleEvents(message);
        }

        resetStopWatch();
      };

      const WebSocket = conn.value as WebSocket;

      window.onbeforeunload = function () {
        WebSocket.close();
      };

      store.setState('conn', conn.value);
    };

    const setGlobals = () => {
      store.setState('robin', robin.value);
      store.setState('api_key', props.apiKey);
      store.setState('user_token', props.userToken);
      store.setState('channel', props.channel);
      store.setState('conversations', []);
      store.setState('sender_name', props.userName);
      store.setState('logo', props.logo);
    };

    const openConversation = () => {
      store.setState('conversationOpened', true);
    };

    const leaveMessage = () => {
      store.setState('conversationOpened', false);
      store.setState('profileOpen', false);
    };

    const leaveGroup = () => {
      key.value += 1;
      store.setState('conversationOpened', false);
      store.setState('profileOpen', false);
    };

    const closeConversation = () => {
      store.setState('conversationOpened', false);
      store.setState('profileOpen', false);
    };

    const openProfile = () => {
      emit('open-profile');
    };

    const onResize = () => {
      screenWidth.value = window.innerWidth;
    };

    const handleEvents = (message: Hashmap): void => {
      switch (message.name) {
        case 'user.connect':
          emit('user.connect', message.value);

          break;
        case 'user.disconnect':
          emit('user.disconnect', message.value);

          break;
        case 'new.conversation':
          if (message.value.is_group) {
            emit('new-group.conversation', message.value);
          } else {
            emit('new.conversation', message.value);
          }
          break;
        case 'message.forward':
          emit('message.forward', message.value);

          break;
        case 'message.reaction':
          emit('message.reaction', message.value);

          break;
        case 'message.remove.reaction':
          emit('message.remove.reaction', message.value);

          break;
        case 'remove.group.participant':
          emit('remove.group.participant', message.value);

          break;
        case 'read.reciept':
          emit('read.reciept', message.value);

          break;
        case 'group.icon.update':
          emit('group.icon.update', message.value);

          break;
        default:
          break;
      }
    };

    const closeImagePreview = (): void => {
      // const { popup1 } = popup as any
      // popup1.value.popupBody.classList.remove('robin-squeezeOut')
      // popup1.value.popupBody.classList.add('robin-squeezeIn')
      // window.setTimeout(() => {
      //   popup1.value.popupBody.classList.remove('robin-squeezeIn')
      //   popup1.value.popupBody.classList.add('robin-squeezeOut')
      //   store.setState('imagePreviewOpen', false)
      //   store.setState('imagesToPreview', [])
      // }, 100)
    };

    const closeMessageViewProfile = (): void => {
      // const { popup2 } = popup as any
      // popup2.value.popupBody.classList.remove('robin-slideInRight')
      // popup2.value.popupBody.classList.add('robin-slideOutRight')
      // window.setTimeout(() => {
      //   popup2.value.popupBody.classList.remove('robin-slideOutRight')
      //   popup2.value.popupBody.classList.add('robin-slideInRight')
      //   store.setState('profileOpen', false)
      // }, 100)
    };

    const resetStopWatch = () => {
      time.value = 0;
    };

    const playAudio = (event: any): void => {
      if (messageEvent) {
        if (
          messageEvent.value?.content.receiver_token === store.state.user_token
        ) {
          event.target.play();
        }
      }
    };

    filterUsers();
    initiateRobin();

    store.setState(
      'forwardMessagesEnabled',
      props.features.includes('forward-messages')
    );
    store.setState(
      'deleteMessagesEnabled',
      props.features.includes('delete-messages')
    );
    store.setState(
      'archiveChatEnabled',
      props.features.includes('archive-chat')
    );
    store.setState('createChatEnabled', props.features.includes('create-chat'));
    store.setState(
      'replyMessagesEnabled',
      props.features.includes('reply-messages')
    );
    store.setState(
      'voiceRecorderEnabled',
      props.features.includes('voice-recorder')
    );
    store.setState(
      'messageReactionViewEnabled',
      props.features.includes('message-reaction.view')
    );
    store.setState(
      'messageReactionDeleteEnabled',
      props.features.includes('message-reaction.delete')
    );
    store.setState('useDefaultProfileDetails', props.useDefaultProfileDetails);

    if (conn.value) {
      conn.value.onopen = () => {
        robin.value?.subscribe(props.channel, conn.value as WebSocket);
      };

      conn.value.onclose = () => {
        connect();
      };
    }

    return {
      slots,
      playAudio
    };
  },
  render() {
    // if (isVue2) {
    //   return (
    //     <div class="robin-container">
    //       <SideContainer>
    //         {{
    //           chatListHeader: () => this.slots['chat-list-header']?.(),
    //         }}
    //       </SideContainer>
    //       <audio
    //         src={assets['notification']}
    //         onClick={(event) => this.playAudio(event)}
    //       >
    //         Your browser does not support the audio feature
    //       </audio>
    //     </div>
    //   );
    // } else {
    return (
      <div class="robin-container">
        <SideContainer>
          {{
            chatListHeader: () => this.slots['chat-list-header']?.()
          }}
        </SideContainer>
        <audio
          src={assets['notification']}
          onClick={(event) => this.playAudio(event)}
        >
          Your browser does not support the audio feature
        </audio>
      </div>
    );
    // }
  }
});
</script>

<style>
.robin-container {
  margin: 0;
  padding: 0;
  width: 100vw;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  overflow: hidden;
  transition: 100ms;
}

.robin-container *,
.robin-container *::before,
.robin-container *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  font-family: 'Hanken Sans', sans-serif;
  margin: 0;
  padding: 0;
  font-kerning: normal;
  -moz-font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  -ms-font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  -webkit-font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media (min-width: 768px) {
  .robin-container ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  .robin-container ::-webkit-scrollbar-track {
    border-radius: 24px;
  }

  .robin-container ::-webkit-scrollbar-thumb {
    width: 2px;
    background-color: #d6d6d6;
    border-radius: 24px;
    -webkit-border-radius: 24px;
    -moz-border-radius: 24px;
    -ms-border-radius: 24px;
    -o-border-radius: 24px;
  }
}
</style>
