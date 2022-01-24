<template>
  <div class="robin-modal-container robin-flex robin-flex-column robin-slideInRight" ref="popup-body">
    <header class="robin-header">
      <IconButton name="remove" @close="$emit('close')" emit="close" :to-emit="true" :to-click-away="false" />
      <RText font-weight="400" :font-size="16" class="robin-ml-12">{{!currentConversation.is_group ? 'Chat' : 'Group' }} Info</RText>
    </header>

    <div class="robin-wrapper robin-slideIn">
      <div class="robin-profile">
        <RAvatar v-if="!currentConversation.is_group" class="robin-mb-8" />
        <RGroupAvatar v-else class="robin-mb-8" />

        <RText fontWeight="500" as="h3" class="robin-mb-8">{{ !currentConversation.is_group ? currentConversation.sender_name: currentConversation.name}}</RText>

        <RText color="#51545C" :fontSize="12" :text-align="'center'" as="p" class="robin-mb-8" v-show="currentConversation.is_group">200 Members</RText>

        <RText color="#51545C" :fontSize="12" :text-align="'center'" as="p" class="robin-flex" v-if="currentConversation.is_group">Created <RText :fontSize="12">{{formatRecentMessageTime(currentConversation.created_at)}}</RText>, By <RText :fontSize="12">{{getGroupCreator()}}</RText></RText>

        <RText color="#51545C" :fontSize="12" :text-align="'center'" as="p" v-show="!currentConversation.is_group">{{ currentConversation.owner_email }}</RText>
      </div>

      <!-- personal -->
      <!-- <RText color="#1F222D" :fontSize="14" as="p" class="robin-mb-13">Files</RText>
      <div class="robin-files">
        <div class="robin-upload robin-flex robin-flex-align-center">
          <img src="@/assets/default.png" />

          <div class="details robin-flex robin-flex-column robin-h-100 robin-flex-align-center">
            <RText as="span" :fontSize="14"> default.pdf </RText>

            <RText as="span" color="#7A7A7A" :fontSize="14"> 123kb </RText>
          </div>

          <IconButton name="download" class="robin-ml-auto" color="#15AE73" :to-emit="false" :to-click-away="false" />
        </div>
      </div>

      <RText color="#1F222D" :fontSize="14" as="p" class="robin-mb-13">Media</RText>

      <div class="robin-media"></div> -->

      <!-- group -->
      <!-- <RButton :fontSize="14" color="#ea8d51">Load More</RButton> -->

      <div class="robin-nav-container robin-slideIn">
        <div :class="{ active: nav == 'Media' }" @click="nav = 'Media'">Media</div>

        <div :class="{ active: nav == 'Links' }" @click="nav = 'Links'">Links</div>

        <div :class="{ active: nav == 'Docs' }" @click="nav = 'Docs'">Docs</div>
      </div>
      <RButton :font-size="12" class="robin-mt-8 robin-mb-11 robin-m-auto">See All {{ nav }}</RButton>

      <div class="robin-group-container" v-show="currentConversation.is_group">
        <RButton color="#000" class="robin-add">
          <IconButton name="addParticipant" class="robin-mr-8" />
          Add Group Participant
        </RButton>

        <div class="robin-card-container">
          <div class="robin-card robin-flex robin-flex-align-center">
            <div class="robin-card-info robin-mr-12">
              <RAvatar />
            </div>

            <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1">
              <div class="robin-flex">
                <RText :font-size="14" :line-height="18">New Name</RText>
              </div>
              <div class="robin-ml-auto">
                <IconButton name="remove2" :to-emit="true" :to-click-away="false" />
              </div>
            </div>
          </div>
          <div class="robin-card robin-flex robin-flex-align-center">
            <div class="robin-card-info robin-mr-12">
              <RAvatar />
            </div>

            <div class="robin-card-info robin-h-100 robin-h-100 robin-flex robin-flex-align-center robin-pt-4 robin-pb-4 robin-flex-1">
              <div class="robin-flex">
                <RText :font-size="14" :line-height="18">New Name</RText>
              </div>
              <div class="robin-ml-auto">
                <IconButton name="remove2" :to-emit="true" :to-click-away="false" />
              </div>
            </div>
          </div>
        </div>

        <div class="robin-see-all">
          <RButton :fontSize="14">
            See All Participants
          </RButton>
        </div>
      </div>

      <div class="robin-actions robin-mt-14">
        <RButton color="#000" v-show="!currentConversation.is_group">
          Share Contact
        </RButton>

        <RButton color="#000" v-show="currentConversation.is_group">
          Mute Notifcation
        </RButton>

        <RButton color="#000">
          Export Chat
        </RButton>

        <RButton color="#D53120">
          Clear Chat
        </RButton>

        <RButton color="#D53120" v-show="!currentConversation.is_group">
          Block Contact
        </RButton>

        <RButton color="#D53120" v-show="currentConversation.is_group">
          Exit Group
        </RButton>

        <RButton color="#D53120">
          Report {{ !currentConversation.is_group ? 'Contact' : 'Group' }}
        </RButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import moment from 'moment'
import InlineSvg from 'vue-inline-svg'
import Component from 'vue-class-component'
import RText from '@/components/ChatList/RText/RText.vue'
import RAvatar from '@/components/ChatList/RAvatar/RAvatar.vue'
import RGroupAvatar from '@/components/ChatList/RGroupAvatar/RGroupAvatar.vue'
import IconButton from '../../IconButton/IconButton.vue'
import RButton from '@/components/ChatList/RButton/RButton.vue'
import store from '../../../store/index'

// file-extension-images
import pdf from '@/assets/pdf.svg'
import doc from '@/assets/doc.svg'
import ppt from '@/assets/ppt.svg'
import xls from '@/assets/xls.svg'
import txt from '@/assets/txt.svg'
import zip from '@/assets/zip.svg'
import avi from '@/assets/avi.svg'
import psd from '@/assets/psd.svg'
import gif from '@/assets/gif.svg'
import svg from '@/assets/svg.svg'
import ai from '@/assets/ai.svg'
import mp3 from '@/assets/mp3.svg'
import mkv from '@/assets/mkv.svg'

// eslint-disable-next-line
@Component<ViewMessageProfile>({
  name: 'ViewMessageProfile',
  components: {
    IconButton,
    RButton,
    RText,
    RAvatar,
    RGroupAvatar,
    InlineSvg
  }
})
export default class ViewMessageProfile extends Vue {
  screenWidth = 0 as number
  nav = 'Media'

  images = {
    pdf: pdf,
    doc: doc,
    ppt: ppt,
    xls: xls,
    txt: txt,
    zip: zip,
    avi: avi,
    psd: psd,
    svg: svg,
    ai: ai,
    mp3: mp3,
    mkv: mkv,
    gif: gif
  } as any

  get currentConversation () {
    return store.state.currentConversation
  }

  get robinUsers () {
    return store.state.users
  }

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
  }

  onResize () {
    this.screenWidth = window.innerWidth
  }

  formatRecentMessageTime (time: string): string {
    // const datetime = new Date(time)
    const datetime = moment(time)
    return datetime.calendar(null, {
      sameDay: 'hh:mm a',
      lastDay: '[Yesterday]',
      lastWeek: 'DD/MM/YYYY',
      sameElse: 'DD/MM/YYYY'
    })
  }

  getGroupCreator () {
    const groupchatCreator = this.currentConversation.participants.find((participant: { is_moderator: any }) => participant.is_moderator) as any
    const user = this.robinUsers.find(user => user.user_token === groupchatCreator.user_token)

    if (user && user.userToken !== this.$user_token) {
      return user.userName
    } else {
      return this.$senderName
    }
  }
}
</script>

<style scoped>
.robin-modal-container {
  width: 375px;
  height: 100%;
  background-color: #fff;
  border: 1px solid #EFEFEF;
  overflow-y: auto;
}

.robin-header {
  width: 100%;
  height: 79px;
  display: flex;
  align-items: center;
  padding: 0 clamp(2%, 4vw, 1.25rem);
  border-bottom: 1px solid #f5f7fc;
}

.robin-wrapper {
  display: flex;
  flex-direction: column;
}

.robin-wrapper .robin-flex {
  display: flex !important;
}

.robin-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 1.625rem clamp(3%, 5vw, 0.875rem) 1rem clamp(3%, 5vw, 1rem);
}

.robin-profile >>> h3,
.robin-profile >>> p {
  white-space: pre-wrap !important;
  text-align: center;
}

.robin-files {
  display: grid;
  grid-template-columns: repeat(2, 50%);
  gap: 0.5rem;
}

.robin-upload {
  border: 1px solid #ecebeb;
  border-radius: 12px;
  padding: 0.5rem;
  margin-bottom: 1.813rem;
}

.robin-upload .details {
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.1rem 0px;
  margin-left: 1.063rem;
}

.robin-media {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(72px, 72px));
  gap: 0.625rem 0.875rem;
}

.robin-media + .robin-button {
  text-align: center;
  letter-spacing: 0.02em;
  margin: 1.188rem auto 0px;
  display: block;
}

.robin-nav-container {
  display: flex;
  align-items: center;
  width: 90%;
  background-color: #efefef;
  border-radius: 8.91px;
  margin: 0 auto 0.438rem;
}

.robin-nav-container div {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  color: #8d9091;
  letter-spacing: -0.08px;
  font-size: 0.813rem;
  border-right: 1px solid rgba(84, 84, 88, 0.65);
}

.robin-nav-container div:last-child {
  border-right: none;
}

.robin-nav-container div:not(.active):hover {
  background: var(--primary-color);
  height: 28px;
  border: 0.5px solid rgba(0, 0, 0, 0.04);
  border-radius: 6.93px;
  color: #fff;
  cursor: pointer;
}

.robin-nav-container div.active {
  background: var(--primary-color);
  height: 28px;
  /* border: 0.5px solid rgba(0, 0, 0, 0.04); */
  border: none;
  border-radius: 6.93px;
  color: #fff;
}

.robin-actions {
  width: 100%;
}

.robin-actions >>> .robin-button {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #FBFBFB;
  padding-left: 1rem;
}

.robin-actions >>> .robin-button:not(:last-child) {
  border-bottom: 1px solid #F5F7FC;
}

.robin-group-container >>> .robin-add.robin-button {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #FBFBFB;
  padding-left: 1rem;
  width: 100%;
}

.robin-see-all {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FBFBFB;
}

.robin-card-container {
  width: 100%;
  max-height: 500px;
  overflow-y: auto;
}

.robin-card-container .robin-card {
  box-shadow: 0px 1px 0px 2.5px rgba(69, 104, 209, 0.05);
  padding: 0.875rem 1rem 1rem;
  transition: all 0.15s;
  background-color: #fff;
}

.robin-card-container .robin-card:not(:first-child) {
  margin: 0.25rem 0;
}

@media (min-width: 768px) {
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-track {
    /* border: 1px solid #00000017; */
    border-radius: 24px;
  }

  ::-webkit-scrollbar-thumb {
    width: 2px;
    background-color: #d6d6d6;
    border-radius: 24px;
    -webkit-border-radius: 24px;
    -moz-border-radius: 24px;
    -ms-border-radius: 24px;
    -o-border-radius: 24px;
  }
}

@media (max-width: 1200px) {
  .robin-modal-container {
    width: 100%;
  }
}
</style>
