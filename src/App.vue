<template>
  <div class="robin-container">
    <transition name="robin-fadeIn">
      <SideContainer v-show="(!isPageLoading && !conversationOpened && screenWidth <= 1200) || (conversationOpened && screenWidth > 1200) || (!conversationOpened && screenWidth > 1200)" :key="key" />
    </transition>
    <transition name="robin-fadeIn">
      <MessageContainer v-show="(!isPageLoading && conversationOpened && screenWidth > 1200 && !profileOpen) || (!isPageLoading && conversationOpened && screenWidth <= 1200 && !profileOpen) || (!isPageLoading && conversationOpened && screenWidth > 1200 && profileOpen)" :key="key + 1" />
    </transition>
    <NoMessageSelected v-show="!isPageLoading && !conversationOpened" />
    <PageLoader v-show="isPageLoading && pageLoader" />
    <MessageImagePreviewer ref="popup-1" :conversation="currentConversation" v-show="imagePreviewOpen" @close="closeImagePreview()" :images-to-preview="imagesToPreview" />
    <ViewProfile ref="popup-2" v-show="profileOpen" @close="closeMessageViewProfile()" />
    <GroupPrompt v-show="groupPromptOpen" @close="closeGroupPrompt()" />
    <EncryptionDetails v-show="encryptionDetailsOpen" @close="closeEncryptionDetails()" />
    <audio :src="assets['notification']" ref="notification" @click="playAudio($event)">Your browser does not support the</audio>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import SideContainer from './components/SideContainer/SideContainer.vue'
import MessageContainer from './components/MessageContainer/MessageContainer.vue'
import NoMessageSelected from './components/NoMessageSelected/NoMessageSelected.vue'
import PageLoader from './components/PageLoader/PageLoader.vue'
import MessageImagePreviewer from './components/MessageImagePreviewer/MessageImagePreviewer.vue'
import ViewProfile from './components/ViewProfile/ViewProfile.vue'
import GroupPrompt from './components/GroupPrompt/GroupPrompt.vue'
import EncryptionDetails from './components/EncrytionDetails/EncryptionDetails.vue'
import Component from 'vue-class-component'
import store from './store/index'
import { Robin } from 'robin.io-js'
import EventBus from './event-bus'
import assets from '@/utils/assets.json'

const ComponentProps = Vue.extend({
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
          _id: '6200d11a9efb65bddc0124ee',
          created_at: '2022-02-07T07:58:18.13Z',
          updated_at: '2022-02-07T07:58:18.13Z',
          fullname: 'Elvis Chuks',
          user_token: 'FefXITDgAeTVrghcOHiimDVB',
          password: '$2a$14$b9wbYBQIZX30BTRJ/C8WROClya42EIUwimkkFh40S2ASISwJwzFZG',
          profile_image: '',
          email: 'elvis@acumen.com.ng'
        },
        {
          _id: '6200d36b9efb65bddc0124ef',
          created_at: '2022-02-07T08:08:11.247Z',
          updated_at: '2022-02-07T08:08:11.247Z',
          fullname: 'Mike Scoffield',
          user_token: 'tMgzcqdUUDsJndIHcJyJdmpi',
          password: '$2a$14$GwEQ2GKnxrWYQjc5DmJxv.IIPqBqygKGVPNxWdM5vf89zSnkfI4T.',
          profile_image: '',
          email: 'elvis+mike@acumen.com.ng'
        },
        {
          _id: '6200fb1b332c393f221b3735',
          created_at: '2022-02-07T10:57:31.554Z',
          updated_at: '2022-02-07T10:57:31.554Z',
          fullname: 'Sam Jam',
          user_token: 'kQrOzxpguSJETkAjsNKZRxYB',
          password: '$2a$14$MEuN/26OHUuIhJ1Ra48kj.FXnkohLoyquzBJHaZ1WpRypSYQt3tqq',
          profile_image: '',
          email: 'sam@acumen.com.ng'
        },
        {
          _id: '6200fd1a332c393f221b3736',
          created_at: '2022-02-07T11:06:02.595Z',
          updated_at: '2022-02-07T11:06:02.595Z',
          fullname: 'Sam Jam',
          user_token: 'bkElYXWxcvVMSrrMfwEJTKZP',
          password: '$2a$14$LXATppWDxQHcJEKg22P9xeWaYcI7IkbKALAU/fXJFv7BfsJfOm8Cy',
          profile_image: '',
          email: 'sam1@acumen.com.ng'
        },
        {
          _id: '620129670446dde27c27fed3',
          created_at: '2022-02-07T14:15:03.353Z',
          updated_at: '2022-02-07T14:15:03.353Z',
          fullname: 'Ndueso Solomon',
          user_token: 'HjabURcHdMJMJHYddxJTOFoS',
          password: '$2a$14$TUb3jBdK49S95vTexSAVLOKpIgYb8lLVpI.RdF82NnwTgGSQ/QLl2',
          profile_image: '',
          email: 'nduesosolomon1@gmail.com'
        },
        {
          _id: '62012ac60446dde27c27fed4',
          created_at: '2022-02-07T14:20:54.596Z',
          updated_at: '2022-02-07T14:20:54.596Z',
          fullname: 'Eshiet Ndueso',
          user_token: 'qEjnFMkyLqdYtqUDlEvEkSNr',
          password: '$2a$14$wBOwTZaTsq/S4hC3siDum.GhrPeBZvRbSrwGeA3ANIdR.JCPwuAsu',
          profile_image: '',
          email: 'nduesoeshiet1@gmail.com'
        },
        {
          _id: '62013d084a9e2979c5f794e2',
          created_at: '2022-02-07T15:38:48.669Z',
          updated_at: '2022-02-07T15:38:48.669Z',
          fullname: 'Temitope Akinlabi',
          user_token: 'rQruzbenCmMwVbOWbAnZMRpx',
          password: '$2a$14$y.KpEpSD2h1pBlQ.2OHxoezY3j2/4weQEx04ZVcw7/1MXw6l1DqSi',
          profile_image: '',
          email: 'akinthope@gmail.com'
        },
        {
          _id: '620140074a9e2979c5f794e3',
          created_at: '2022-02-07T15:51:35.227Z',
          updated_at: '2022-02-07T15:51:35.227Z',
          fullname: 'Temitope Akinlabi',
          user_token: 'eSIRdeBBVZAQnbJeTOvklSSP',
          password: '$2a$14$BTMV8hxKWsWdGWn0j7H4r.toQDE0uCl3VS1HKbORYKwblkyj2sgry',
          profile_image: '',
          email: 'akintope@gmail.com'
        },
        {
          _id: '6202322ef826fc9b64fb94bc',
          created_at: '2022-02-08T09:04:46.119Z',
          updated_at: '2022-02-08T09:04:46.119Z',
          fullname: 'precious',
          user_token: 'HVxGcOqwUwHNHAxNwinzydpG',
          password: '$2a$14$v8xQ9LtnmPPUsFGnXPvhR.mJM0j5g73lRvFJ8rxo/kiG/wy8diziW',
          profile_image: '',
          email: 'ogarpre@gmail.com'
        },
        {
          _id: '62026c8d767d7b9a2728a90c',
          created_at: '2022-02-08T13:13:49.928Z',
          updated_at: '2022-02-08T13:13:49.928Z',
          fullname: 'Iwatannaye victor ',
          user_token: 'RzfrHliRNzIToIjdHorkiFtZ',
          password: '$2a$14$CqUfnHCJGZ1CeGE9DX1f4.k6QQNzFRbu6Ifrwzgj1U0mtQV3EKfbq',
          profile_image: '',
          email: 'Iwatannayevictor@gmail.com'
        },
        {
          _id: '62026e4a767d7b9a2728a90d',
          created_at: '2022-02-08T13:21:14.552Z',
          updated_at: '2022-02-08T13:21:14.552Z',
          fullname: 'Bashir Raji ',
          user_token: 'ktYTmPzRwSyQkhNAWXeptJrG',
          password: '$2a$14$643NCT5SvXdNFh4Awo1jqu19LK0kFKOcZ5mVtVX9qqNaZOa2cWrL.',
          profile_image: '',
          email: 'bashir@acumen.com.ng'
        },
        {
          _id: '62026f44767d7b9a2728a90e',
          created_at: '2022-02-08T13:25:24.494Z',
          updated_at: '2022-02-08T13:25:24.494Z',
          fullname: 'Idorenyin Udoh',
          user_token: 'CGKKBuaoSqSAnLNBJEbIUfcF',
          password: '$2a$14$CBmPDbC5EPo9FzO07AS/JOYHjzIVGQhrykuXW4/bwlC3aQsHKLAmy',
          profile_image: '',
          email: 'idorenyinudoh10@outlook.com'
        },
        {
          _id: '62027551767d7b9a2728a90f',
          created_at: '2022-02-08T13:51:13.025Z',
          updated_at: '2022-02-08T13:51:13.025Z',
          fullname: 'Josh Anaba',
          user_token: 'rhSpCIHcjWfdRVrkbTOjOcal',
          password: '$2a$14$OcSi9GK2crXG1yDHHW53Tuw/bIBcM1LQKKswG35sKYhJEvpjyy11u',
          profile_image: '',
          email: 'josh@acumen.com.ng'
        },
        {
          _id: '620275e3767d7b9a2728a910',
          created_at: '2022-02-08T13:53:39.851Z',
          updated_at: '2022-02-08T13:53:39.851Z',
          fullname: 'Oluwaseyi Awotunde',
          user_token: 'UyQVulGYWmVdVqwNGOvWtodN',
          password: '$2a$14$ze90NUYdt7/bigJxQxQ3LeTYy56hcZlJNWlfy9t889JK2834v6S7e',
          profile_image: '',
          email: 'oluwa.seyiawotunde147@gmail.com'
        },
        {
          _id: '6202786b767d7b9a2728a911',
          created_at: '2022-02-08T14:04:27.602Z',
          updated_at: '2022-02-08T14:04:27.602Z',
          fullname: 'Adewale Aloba',
          user_token: 'tIRebagzlWbOqLEnmhVCsmaN',
          password: '$2a$14$zCNOlRttxvDBpAVEAZ18meMGu0J5w8FMhEtp09t3hXRLREI.cMfLe',
          profile_image: '',
          email: 'adewalealoba@outlook.com'
        },
        {
          _id: '62027880767d7b9a2728a912',
          created_at: '2022-02-08T14:04:48.327Z',
          updated_at: '2022-02-08T14:04:48.327Z',
          fullname: 'Raji Al-Ameen',
          user_token: 'BmAWIatHMnTwfhaCkeGhZAyW',
          password: '$2a$14$w6jw.tB/bgMzl0OwPzdhMuKxAUGbj9yfPGiiXbWhVo/kmGjJUWtNK',
          profile_image: '',
          email: 'alameenraji31@gmail.com'
        },
        {
          _id: '62027938767d7b9a2728a913',
          created_at: '2022-02-08T14:07:52.621Z',
          updated_at: '2022-02-08T14:07:52.621Z',
          fullname: 'Prudence Onyemekara',
          user_token: 'sJrQFQAxdbSXTXiVoZnPAEXG',
          password: '$2a$14$egT0OGQD3sxqdb6BFmHo2OkvI0TirP7embcrw/FkHleOtYygBJWqa',
          profile_image: '',
          email: 'prudenceonyemekara@gmail.com'
        },
        {
          _id: '62027963767d7b9a2728a914',
          created_at: '2022-02-08T14:08:35.186Z',
          updated_at: '2022-02-08T14:08:35.186Z',
          fullname: 'Sophie',
          user_token: 'dmGwdcIVWhiwmKDbgpJpcuTT',
          password: '$2a$14$aA/5Uo4Q6rA9tdeebQLaSu5GiBkhAriGJXyffMd38QF2q284lo67C',
          profile_image: '',
          email: 'sophieonyeneke@icloud.com'
        },
        {
          _id: '62027a5a767d7b9a2728a915',
          created_at: '2022-02-08T14:12:42.53Z',
          updated_at: '2022-02-08T14:12:42.53Z',
          fullname: 'Melissa O. ',
          user_token: 'mHkwmfIlfYuORbcjNpfvnvzZ',
          password: '$2a$14$rIQn7LLNaEK7HcYkEzvVlu4jUvpGNjCOMNVfM3DhGEiCikQgxz1ba',
          profile_image: '',
          email: 'okeibunomelissa@gmail.com'
        },
        {
          _id: '62027a68767d7b9a2728a916',
          created_at: '2022-02-08T14:12:56.646Z',
          updated_at: '2022-02-08T14:12:56.646Z',
          fullname: 'Veronica ',
          user_token: 'pitEmdftDLXMOSeShzTxZyCJ',
          password: '$2a$14$sJNlwlxWAJujLNjFUWv5HuJjJFd4g5jBtwRA0Tg5bZpe3x7PvEqKu',
          profile_image: '',
          email: 'veronikabee23@gmail.com'
        },
        {
          _id: '62027c5d767d7b9a2728a917',
          created_at: '2022-02-08T14:21:17.321Z',
          updated_at: '2022-02-08T14:21:17.321Z',
          fullname: 'Farawe Taiwo',
          user_token: 'HzyWdtnbrhrDbeJWtygaIUta',
          password: '$2a$14$T0w4yeRN24rshkFn9lnqGek1WZDz70Vlf3/ekJISxd58Ko0BjN2vi',
          profile_image: '',
          email: 'farawehassan@yahoo.com'
        },
        {
          _id: '62027dba767d7b9a2728a918',
          created_at: '2022-02-08T14:27:06.18Z',
          updated_at: '2022-02-08T14:27:06.18Z',
          fullname: 'Lanre Okedele',
          user_token: 'QbuVSPYNuJpzIgidJJdWtOQm',
          password: '$2a$14$DxuIG4.tpsLhdNfIS4cSluUAglxKgGqjxDeCSBz7/Olfl8E3UaGuq',
          profile_image: '',
          email: 'lanresongz@gmail.com'
        },
        {
          _id: '62028e5c767d7b9a2728a919',
          created_at: '2022-02-08T15:38:04.408Z',
          updated_at: '2022-02-08T15:38:04.408Z',
          fullname: 'Ernest Abah',
          user_token: 'sBeMEbfvmIpIUeRbyVmqZCMj',
          password: '$2a$14$IXk2lSo.tMl.KqvQKQ5lw.hqBZEtHIRJEQ7aTZVYmDche/Lq6Loji',
          profile_image: '',
          email: 'abahernesto@gmail.com'
        },
        {
          _id: '62029402767d7b9a2728a91a',
          created_at: '2022-02-08T16:02:10.102Z',
          updated_at: '2022-02-08T16:02:10.102Z',
          fullname: 'Gloria Nwandu ',
          user_token: 'lZzumWxUiEusyCdeTSguAOSH',
          password: '$2a$14$o.CXtd63cqnaMoVU9NsdquHWYXoGRs2mrkenWtsO5uludwrheygGK',
          profile_image: '',
          email: 'nwandugloria23@gmail.com'
        },
        {
          _id: '62029402767d7b9a2728a91b',
          created_at: '2022-02-08T16:02:10.17Z',
          updated_at: '2022-02-08T16:02:10.17Z',
          fullname: 'Gloria Nwandu ',
          user_token: 'WhSzdyfBjcABVIbVPMjZPVSk',
          password: '$2a$14$HVbewRXK9lN9fEDTvw787geQaD4HhlLc/mc4/zkSlT9Ld5Ca9OcdXS',
          profile_image: '',
          email: 'nwandugloria23@gmail.com'
        },
        {
          _id: '62029531767d7b9a2728a91c',
          created_at: '2022-02-08T16:07:13.004Z',
          updated_at: '2022-02-08T16:07:13.004Z',
          fullname: 'Tomi ',
          user_token: 'ZcqASggGWmUgduqpvnKJLSQN',
          password: '$2a$14$Wyys90pj.N.qXmtAdHTTyukP2BtaS/uYrdy7aJItRUnkxIVNe1qT2',
          profile_image: '',
          email: 'tomisinshimiteyi@yahoo.com '
        },
        {
          _id: '62029bbb767d7b9a2728a91d',
          created_at: '2022-02-08T16:35:07.621Z',
          updated_at: '2022-02-08T16:35:07.621Z',
          fullname: 'Enoch',
          user_token: 'clpYwBMnDGdynSarEBZOuPWZ',
          password: '$2a$14$FU7oTGQs1rgqFII3lZBzBOTCBk350ajF4HxspX.h2aW22sj8v5OyG',
          profile_image: '',
          email: 'enochchejieh@gmail.con'
        },
        {
          _id: '6202a486767d7b9a2728a91e',
          created_at: '2022-02-08T17:12:38.628Z',
          updated_at: '2022-02-08T17:12:38.628Z',
          fullname: 'Chisom Jennifer',
          user_token: 'emrsXuMJxuoaWgnPSliHeMlz',
          password: '$2a$14$X7KyFRxlcADqZ8/SkqRtPO9D/g9AZaRKx6cLpjtaVDt6Y86XgmcQy',
          profile_image: '',
          email: 'chisomjennifer@gmail.com'
        },
        {
          _id: '6202be174fa9c65ddec90769',
          created_at: '2022-02-08T19:01:43.25Z',
          updated_at: '2022-02-08T19:01:43.25Z',
          fullname: 'Chisomaga Ndumele ',
          user_token: 'MnptYQcXXUecnakxZKHMjhVe',
          password: '$2a$14$9ttxc47Mtk8pANYSfn/rwuFL24RuYjaKRcoplmPqQ2rDoMxsPWfW.',
          profile_image: '',
          email: 'emmanuellandumele@gmail.com'
        },
        {
          _id: '6202da9554a668b21635a189',
          created_at: '2022-02-08T21:03:17.652Z',
          updated_at: '2022-02-08T21:03:17.652Z',
          fullname: 'joshua egbuonu',
          user_token: 'ueWkcbLHOVwHYDUfSZaHwVCy',
          password: '$2a$14$QtCCIrbcXfzlMboWFXYhqeXVda2gpVpz9HZihLyE9thcxm7jBqFLG',
          profile_image: '',
          email: 'joshuaegbuonu@gmail.com'
        },
        {
          _id: '62049efd6cf7f45375c0987f',
          created_at: '2022-02-10T05:13:33.093Z',
          updated_at: '2022-02-10T05:13:33.093Z',
          fullname: 'David Emaye',
          user_token: 'xLXrwTmgvohYEACIfYbnxpeO',
          password: '$2a$14$4ock/W9Kl6s6J7tRH5pNnOfu2CUM3SRgTrp/fwgzOfySItpK3AxVq',
          profile_image: '',
          email: 'david@acumen.com.ng'
        },
        {
          _id: '6206517813920f7829d4c1ca',
          created_at: '2022-02-11T12:07:20.201Z',
          updated_at: '2022-02-11T12:07:20.201Z',
          fullname: 'Oluwakemi ',
          user_token: 'KalwUsziLaxLxJkfRaueBKmM',
          password: '$2a$14$vGk3YjX18vC7r/brwnxha.vOd.c1yDY7oUEQq0Y9/1qguvXWD5sPa',
          profile_image: '',
          email: 'brandykemi@gmail.com'
        },
        {
          _id: '620686b097375cb7fd00471a',
          created_at: '2022-02-11T15:54:24.746Z',
          updated_at: '2022-02-11T15:54:24.746Z',
          fullname: 'Ayo O',
          user_token: 'chnLgzwYlwIWllLSpMqsVUMg',
          password: '$2a$14$DmtepDCyCZ1H5emZLG9/yukmJ.9jj1nZRnVvDInWK7g63aUEah1ou',
          profile_image: '',
          email: 'Ayo@acumen.com.ng'
        },
        {
          _id: '6206879697375cb7fd00471b',
          created_at: '2022-02-11T15:58:14.447Z',
          updated_at: '2022-02-11T15:58:14.447Z',
          fullname: 'AyoO',
          user_token: 'VBrTrYenKHBAwnfRYHgvbrDg',
          password: '$2a$14$RBRRb..Ek5DWb.QPj7EvUOWpMbDZE.slYOc45rNVYY/YrD6lkkUWi',
          profile_image: '',
          email: 'Ayo@acumen.digital'
        },
        {
          _id: '6208246f923dd2a40fc294b4',
          created_at: '2022-02-12T21:19:43.663Z',
          updated_at: '2022-02-12T21:19:43.663Z',
          fullname: 'Kelechi Molokwu',
          user_token: 'dHckaQDdapXBwnTlMMWaWGQR',
          password: '$2a$14$4nGUugdkS6A2L98.dE4Kf./MrfSEiniYaM9BnzZ1FoUffynzpKiQ2',
          profile_image: '',
          email: 'kelechi@acumen.com.ng'
        },
        {
          _id: '620b8c2692059bb0a1d0eb92',
          created_at: '2022-02-15T11:19:02.072Z',
          updated_at: '2022-02-15T11:19:02.072Z',
          fullname: 'Ayomide',
          user_token: 'foXSeQNBYbHvbhtzHofQhxpd',
          password: '$2a$14$ao9kWcEa9FKZ57POQLalC.IsuscycnmEkQR/6DdRcb646ef8N4YyG',
          profile_image: '',
          email: 'ayo@gmail.com'
        },
        {
          _id: '620b8ff392059bb0a1d0eb93',
          created_at: '2022-02-15T11:35:15.528Z',
          updated_at: '2022-02-15T11:35:15.528Z',
          fullname: 'Test Tope',
          user_token: 'YXBnlMydHfUgcuqHMiLVppFz',
          password: '$2a$14$SbfmgKi9nPV7e0YHZ7YkjeIf/D.TQdjtqRP1hGjiSfnjViHfArimC',
          profile_image: '',
          email: 'testtope@gmail.com'
        },
        {
          _id: '6213a7e7db0c006410f81b4c',
          created_at: '2022-02-21T14:55:35.103Z',
          updated_at: '2022-02-21T14:55:35.103Z',
          fullname: 'Oluwakemi',
          user_token: 'ZhiMwfYTbcyMvneBvAajpyru',
          password: '$2a$14$3e5RD8H2XPfHgSXEb.ZfEuaUY6zNhabsCagsG3r5W.wM4asCYPWre',
          profile_image: '',
          email: 'brandykemi@icloud.com'
        },
        {
          _id: '6213ae79db0c006410f81b4d',
          created_at: '2022-02-21T15:23:37.161Z',
          updated_at: '2022-02-21T15:23:37.161Z',
          fullname: 'Jim iyke',
          user_token: 'BQECtmVAVXnfMcVGFAJcxDUi',
          password: '$2a$14$t1Z2Ag47XnNmX34.0d2cue8qZ3q8131lJV8uoeCEENNPVEIWsbUL6',
          profile_image: '',
          email: 'Jim@gmail.con'
        },
        {
          _id: '6213b6e0db0c006410f81b4e',
          created_at: '2022-02-21T15:59:28.116Z',
          updated_at: '2022-02-21T15:59:28.116Z',
          fullname: 'Ubong',
          user_token: 'feAQTkXHOBDIdMJAVoOnapkZ',
          password: '$2a$14$vlP77q6SLXaWi1uBoWQkIe5VY3PEvDRoVoWK/0Aw.XYRfKY44OqEC',
          profile_image: '',
          email: 'craejimmy@gmail.com'
        },
        {
          _id: '6213b9d8db0c006410f81b4f',
          created_at: '2022-02-21T16:12:08.02Z',
          updated_at: '2022-02-21T16:12:08.02Z',
          fullname: 'Juwon Adeyemi',
          user_token: 'kCzfVrVmucKLFVqPyLNnMCdk',
          password: '$2a$14$M3Sr1B28M9NrT325DKzrZe/VIwcspmlXTb8mHiIHOgIjpTkgFEoVG',
          profile_image: '',
          email: 'juwonadeyemi@gmail.com '
        },
        {
          _id: '6213ce87db0c006410f81b51',
          created_at: '2022-02-21T17:40:23.827Z',
          updated_at: '2022-02-21T17:40:23.827Z',
          fullname: 'Onwuegbuzie Ugonna',
          user_token: 'lTcNpxiAfRNozsTFGYxYVxfm',
          password: '$2a$14$hgB4hFtA3xBZcFZbF1UuqOhoqzKzxSdJE8EL7RbE/aVGWlJm/Qd5y',
          profile_image: '',
          email: 'ugonnaozie@gmail.com'
        },
        {
          _id: '6213d1cbdb0c006410f81b52',
          created_at: '2022-02-21T17:54:19.678Z',
          updated_at: '2022-02-21T17:54:19.678Z',
          fullname: 'Gift Obido',
          user_token: 'DDRJPYMubdIeCyjrSkVWirLP',
          password: '$2a$14$ah4dtfLR8pF/8M/8TKP1Q.OrM1NppAMHmwcsNUuVSKLTDxUZMwpKe',
          profile_image: '',
          email: 'giftobidokachi@gmail.com'
        },
        {
          _id: '6213d304db0c006410f81b53',
          created_at: '2022-02-21T17:59:32.4Z',
          updated_at: '2022-02-21T17:59:32.4Z',
          fullname: 'Mary',
          user_token: 'nNZothUYgMhOFSclMWbNLFRo',
          password: '$2a$14$Zc.3ua3aN7MQ05FPy0VA5uQVIQoKKZ/oYPQWlgaDmH1e8KTIInkvq',
          profile_image: '',
          email: 'maryadeagbo77@gmail.com'
        },
        {
          _id: '6213e8752c0d2f880ce11146',
          created_at: '2022-02-21T19:31:01.618Z',
          updated_at: '2022-02-21T19:31:01.618Z',
          fullname: 'Chukwuemeka Mba',
          user_token: 'osSlVouBPlihUmjqeExJXwrH',
          password: '$2a$14$qa36uMoUSJwSFZKcjJ9dtO8RUOKXbViIswxi5u1yh4ykBSskxYwNW',
          profile_image: '',
          email: 'emekamba10@icloud.com'
        },
        {
          _id: '6213ed492c0d2f880ce11147',
          created_at: '2022-02-21T19:51:37.765Z',
          updated_at: '2022-02-21T19:51:37.765Z',
          fullname: 'Jacob Gbenga',
          user_token: 'vmLgiMdHEpcgQfcWbsApereh',
          password: '$2a$14$X4vwaUr1QLcjB0YvCNHHxeXQ/SRelNS6bLsriNz9IE2i0Gxj0skeK',
          profile_image: '',
          email: 'jacob@acumen.com'
        },
        {
          _id: '6213ee722c0d2f880ce11148',
          created_at: '2022-02-21T19:56:34.9Z',
          updated_at: '2022-02-21T19:56:34.9Z',
          fullname: 'Odu David oluwatimilehin ',
          user_token: 'WZeUJZbfVNZXZOsogNbKAqZT',
          password: '$2a$14$8usGkZdtvadVt6Tog.YxQeTonmivergwgdH9aImFtro5K9zljT56y',
          profile_image: '',
          email: 'odu.timilehin@gmail.com'
        },
        {
          _id: '6213ef0a2c0d2f880ce11149',
          created_at: '2022-02-21T19:59:06.066Z',
          updated_at: '2022-02-21T19:59:06.066Z',
          fullname: 'Favour Felix',
          user_token: 'TiElvhbDfyQZcrCPMdkgPSgj',
          password: '$2a$14$YepdqVHttXrpCIVLdQqs0.kyvZtrhYeyRIRB3AFEhvgTJknTrBaMe',
          profile_image: '',
          email: 'favour@acumen.digital'
        },
        {
          _id: '6213ef462c0d2f880ce1114a',
          created_at: '2022-02-21T20:00:06.831Z',
          updated_at: '2022-02-21T20:00:06.831Z',
          fullname: 'Daniel Komolafe',
          user_token: 'fOqLppHdPBZMCpPmHWAYWnUx',
          password: '$2a$14$sKAndIyEFqhZOB4ehq3Mku3/hosqzAnyjaY5GDUHS1r0AT976l41a',
          profile_image: '',
          email: 'komozy2000@gmail.com'
        },
        {
          _id: '6213ef672c0d2f880ce1114b',
          created_at: '2022-02-21T20:00:39.162Z',
          updated_at: '2022-02-21T20:00:39.162Z',
          fullname: 'Collins Thomas',
          user_token: 'egFMtaRmbaOUgoMOaLmiqpJk',
          password: '$2a$14$wEsOlbudDf4JICY7Ux69k.1x9ovUTWzAf9Yr1iNpfTE.0pXSJ1fFa',
          profile_image: '',
          email: 'thomascollins582@gmail.com'
        },
        {
          _id: '6213f0512c0d2f880ce1114c',
          created_at: '2022-02-21T20:04:33.079Z',
          updated_at: '2022-02-21T20:04:33.079Z',
          fullname: 'Dungke',
          user_token: 'jzBbZJrRHNvZgZDgameBHLjq',
          password: '$2a$14$.slkzxG0AS8IeFgeuEVh7e6BeZrED0jKHyKThU2FsIJCmkvgBYfMG',
          profile_image: '',
          email: 'eshietdungke8@gmail.com'
        },
        {
          _id: '6213f47b2c0d2f880ce1114d',
          created_at: '2022-02-21T20:22:19.622Z',
          updated_at: '2022-02-21T20:22:19.622Z',
          fullname: 'Emmanuella Esezobor ',
          user_token: 'KwRdvdBCrevgEaFUIckqwjGP',
          password: '$2a$14$.xcvjyyDzL8NfXeC9bZneelQzGP0hD/fLep/tM8f9VHzDkoOJqNue',
          profile_image: '',
          email: 'emmanuella.esezobor@icloud.com'
        },
        {
          _id: '6213f59e2c0d2f880ce1114e',
          created_at: '2022-02-21T20:27:10.633Z',
          updated_at: '2022-02-21T20:27:10.633Z',
          fullname: 'oladunni',
          user_token: 'pTeNYzhGfXpPgfPitrlFSmRr',
          password: '$2a$14$BdBCTR8Hka3fUPjUib7aBefg7huvlUA0oM58q.E8tjekS16laLpD2',
          profile_image: '',
          email: 'dunnisleek@gmail.com'
        },
        {
          _id: '6213f65b2c0d2f880ce1114f',
          created_at: '2022-02-21T20:30:19.561Z',
          updated_at: '2022-02-21T20:30:19.561Z',
          fullname: 'jumoke',
          user_token: 'FYOwzzCPLkKfJVryoHoprddn',
          password: '$2a$14$es3uIK4ZxDOHYfN36SoDj.GWFmK/oENXjNjEKqPNDqoRMdbmgKvAm',
          profile_image: '',
          email: 'jumoke@acumen.com.ng'
        },
        {
          _id: '6213fb382c0d2f880ce11150',
          created_at: '2022-02-21T20:51:04.732Z',
          updated_at: '2022-02-21T20:51:04.732Z',
          fullname: 'Lanre Okedele ',
          user_token: 'EmAQSwqfeTYlCynRtsbuimIs',
          password: '$2a$14$y3aNKIwhrz8a5bz6lQSQWu96PStoOswDt0VgyyHSdVT//0YT7mE.G',
          profile_image: '',
          email: 'lanre@acumen.com.ng'
        },
        {
          _id: '6213fbc52c0d2f880ce11151',
          created_at: '2022-02-21T20:53:25.319Z',
          updated_at: '2022-02-21T20:53:25.319Z',
          fullname: 'Olusesi Barry Boluwatife',
          user_token: 'PwNJSqTahtUPMbRrNCqkOieF',
          password: '$2a$14$S2caral7CoTTcd7TSCGgM.zjmAelcRuE9selNgcayxsHM22ea47XW',
          profile_image: '',
          email: 'barryolusesi@gmail.com'
        },
        {
          _id: '621402752c0d2f880ce11152',
          created_at: '2022-02-21T21:21:57.411Z',
          updated_at: '2022-02-21T21:21:57.411Z',
          fullname: 'Solomon Eshiet ',
          user_token: 'jQCfsmctDyvXDVHtVoBFbhAu',
          password: '$2a$14$qWK3.4hpy4VBkTgSe0E8buL4.QGEQowuYP8OU5XDCpScCTUk/Y5iK',
          profile_image: '',
          email: 'eshietsolomon13@gmail.com'
        },
        {
          _id: '621436282dc9a4e040d741bb',
          created_at: '2022-02-22T01:02:32.517Z',
          updated_at: '2022-02-22T01:02:32.517Z',
          fullname: 'Testing Tester',
          user_token: 'GmStKZeaAzsYzxsdIlFvoJSa',
          password: '$2a$14$ynUAMEo0StZa7FnbipS6l.qgAObpZJL.SkvXXVKjRalPKTK0Y51ce',
          profile_image: '',
          email: 'testingtester@gmail.com'
        },
        {
          _id: '6214a2048e02cab1c99e6608',
          created_at: '2022-02-22T08:42:44.502Z',
          updated_at: '2022-02-22T08:42:44.502Z',
          fullname: 'Abolare Roheemah ',
          user_token: 'eiMbDHyCPoBVeGHueTfBtZxZ',
          password: '$2a$14$fMU4AIWsCNLtJ7XyVSaZDec93sRAqzAY6T4U2ASxULWRt6sd5xlCy',
          profile_image: '',
          email: 'roheemah@acumen.com.ng '
        },
        {
          _id: '6214ab178e02cab1c99e6609',
          created_at: '2022-02-22T09:21:27.864Z',
          updated_at: '2022-02-22T09:21:27.864Z',
          fullname: 'Ndueso Eshiet',
          user_token: 'BvVQmXgvfXKmYzWzhOOpwQDS',
          password: '$2a$14$v06WDxXUq1JTtMRsj2Kqfu9qrSfMm5O0BaN.mdI9556gUMpa4HTrG',
          profile_image: '',
          email: 'nduesosolomon1@yopmail.com'
        },
        {
          _id: '6214c3b38e02cab1c99e660a',
          created_at: '2022-02-22T11:06:27.653Z',
          updated_at: '2022-02-22T11:06:27.653Z',
          fullname: 'Johnny Bravo ',
          user_token: 'BJsWNeikcTSejxsMnLBpymdF',
          password: '$2a$14$Qt1vFzYWvMRmX5Z8oabYtu9f4eiUdvn37UusNeSgWl4Ivf3UKUrou',
          profile_image: '',
          email: 'johnnybravo@yopmail.com'
        },
        {
          _id: '6214db4f8e02cab1c99e660b',
          created_at: '2022-02-22T12:47:11.637Z',
          updated_at: '2022-02-22T12:47:11.637Z',
          fullname: 'chidinma',
          user_token: 'gTdQGyWAJmAIBEbrOooAksvL',
          password: '$2a$14$g.0DKV/8PA3LH5CKu0tOl.E2So11xVrZOdvN8bG3Ap3V5VHuhnzfm',
          profile_image: '',
          email: 'chidinmalucy123@icloud.com'
        },
        {
          _id: '62160a3db29a848f1d8d4272',
          created_at: '2022-02-23T10:19:41.148Z',
          updated_at: '2022-02-23T10:19:41.148Z',
          fullname: 'Suala Amotsuka',
          user_token: 'XtERIQdxUwbAoXVtBSCYUKRi',
          password: '$2a$14$b6zhXRlFwyH.x30bTA.K/uKmRHBctcPXkkwrYwECOj2UwGrXlZE0y',
          profile_image: '',
          email: 'tamunosiesualaamotsuka@gmail.com'
        },
        {
          _id: '6217e9fa9ad92afbda42f87b',
          created_at: '2022-02-24T20:26:34.19Z',
          updated_at: '2022-02-24T20:26:34.19Z',
          fullname: 'David Emaye',
          user_token: 'mwDdiQzHaLKagKLwOLCTPRhl',
          password: '$2a$14$CWTy5m5cV4rlgU95q7rFE.ZngrE.MjzQyDaQF1Xbf2qmj/oDGqphO',
          profile_image: '',
          email: 'emayeodavid@gmail.com'
        }
      ]
    },
    keys: {
      type: Object as PropType<any>,
      default: (): any => {
        return {
          // userToken: 'userToken',
          // userName: 'userName',
          // profileImage: 'profileImage'
          userToken: 'user_token',
          userName: 'fullname',
          profileImage: 'profile_image'
        }
      }
    }
  }
})

// eslint-disable-next-line
@Component<App>({
  name: 'RobinChatContainer',
  components: {
    SideContainer,
    MessageContainer,
    PageLoader,
    NoMessageSelected,
    MessageImagePreviewer,
    ViewProfile,
    GroupPrompt,
    EncryptionDetails
  },
  watch: {
    users: {
      handler (val) {
        this.filterUsers()
      },
      immediate: true
    },
    // currentConversation: {
    //   handler (val) {
    //     this.profileKey += 1
    //   }
    // },
    time: {
      handler (val) {
        if (this.time === 9) {
          this.connect()
          this.resetStopWatch()
        }
      }
    }
  }
})
export default class App extends ComponentProps {
  robin = null as any
  conn = null as any
  key = 0 as number
  // profileKey = 0 as number
  screenWidth = 0 as number
  messageEvent = null as any
  start = null as any
  time = 0 as number

  created (): void {
    this.filterUsers()
    this.initiateRobin()

    this.openConversation()
    this.onGroupConversationCreated()
    this.onExitGroup()
    this.onExitMessage()
    this.onConversationDelete()

    if (this.conn) {
      this.conn.onopen = () => {
        this.robin.subscribe(this.channel, this.conn)
      }

      this.conn.onclosed = () => {
        ('closed')
        this.connect()
      }
    }
  }

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)

    setInterval(() => {
      this.time += 1
    }, 60000)
  }

  get conversationOpened () {
    return store.state.conversationOpened
  }

  get isPageLoading () {
    return store.state.isPageLoading
  }

  get assets (): any {
    return assets
  }

  get currentConversation () {
    return store.state.currentConversation
  }

  get encryptionDetailsOpen () {
    return store.state.encryptionDetailsOpen
  }

  get imagesToPreview () {
    return store.state.imagesToPreview
  }

  get imagePreviewOpen () {
    return store.state.imagePreviewOpen
  }

  get profileOpen () {
    return store.state.profileOpen
  }

  get groupPromptOpen () {
    return store.state.groupPromptOpen
  }

  initiateRobin () {
    this.robin = new Robin(this.apiKey, true)
    this.connect()
    this.setPrototypes()
  }

  filterUsers (): void {
    const filteredUsers: Array<any> = []
    this.users.forEach((user) => {
      const newUser = {
        userToken: user[this.keys?.userToken],
        profileImage: user[this.keys?.profileImage],
        userName: user[this.keys?.userName]
      }
      filteredUsers.push(newUser)
    })

    Vue.prototype.$robin_users = [...filteredUsers]
  }

  setPrototypes () {
    Vue.prototype.$robin = this.robin
    Vue.prototype.$apiKey = this.apiKey
    Vue.prototype.$user_token = this.userToken
    Vue.prototype.$channel = this.channel
    Vue.prototype.$conversations = []
    Vue.prototype.$regularConversations = []
    Vue.prototype.$archivedConversations = []
    Vue.prototype.$senderName = this.userName
  }

  connect () {
    this.conn = this.robin.connect(this.userToken)

    this.conn.onmessage = (evt: any) => {
      const notification = this.$refs.notification as any

      const message = JSON.parse(evt.data)
      // (message)
      if (message.is_event !== true) {
        EventBus.$emit('new-message', message)
        this.messageEvent = message

        if (notification) {
          notification.click()
        }
      } else {
        // move new conversation to the top
        // ('new conversation')
        // EventBus.$emit('new-conversation', message)

        // check event type

        // if (message.name == "new.conversation") {
        //   EventBus.$emit('new.conversation', message.value)
        // }
        this.handleEvents(message)
      }

      this.resetStopWatch()
    }

    const WebSocket: WebSocket = this.conn

    window.onbeforeunload = function () {
      WebSocket.close()
    }

    Vue.prototype.$conn = this.conn
  }

  openConversation (): void {
    EventBus.$on('open-conversation', () => {
      store.setState('conversationOpened', true)
    })
  }

  onGroupConversationCreated (): void {
    EventBus.$on('new-group.conversation', (conversation: object) => {
      // this.conversationOpened = true
    })
  }

  handleEvents (message: any): void {
    // ('event->', message)
    switch (message.name) {
      case 'user.connect':
        // set user status to online
        // check conversations(dms)
        // if this.$userToken != message.value
        // check if reciever_token or sender_token == message.value
        // set the conversation.status as online
        EventBus.$emit('user.connect', message.value)
        break
      case 'user.disconnect':
        // set user status to offline

        // check conversations(dms)
        // if this.$userToken != message.value
        // check if reciever_token or sender_token == message.value
        // set the conversation.status as offline
        EventBus.$emit('user.disconnect', message.value)
        break
      case 'new.conversation':
        if (message.value.is_group) {
          EventBus.$emit('new-group.conversation', message.value)
        } else {
          EventBus.$emit('new.conversation', message.value)
        }
        break
      case 'message.forward':
        // loop through message.value
        // check if current conversation._id is equal to message.conversation_id
        // if it is, push message to message array
        // else update last_message and unshift
        EventBus.$emit('message.forward', message.value)
        // ('forwarded message', message.value)
        break
      case 'message.reaction':
        EventBus.$emit('message.reaction', message.value)
        break
      case 'message.remove.reaction':
        EventBus.$emit('message.remove.reaction', message.value)
        break
      case 'remove.group.participant':
        EventBus.$emit('remove.group.participant', message.value)
        break
      case 'read.reciept':
        EventBus.$emit('read.reciept', message.value)
        break
      case 'group.icon.update':
        EventBus.$emit('group.icon.update', message.value)
        break
      default:
        break
    }
  }

  onExitGroup () {
    EventBus.$on('left.group', () => {
      this.key += 1
      store.setState('conversationOpened', false)
      store.setState('profileOpen', false)
    })
  }

  onConversationDelete () {
    EventBus.$on('close-conversation', () => {
      store.setState('conversationOpened', false)
      store.setState('profileOpen', false)
    })
  }

  onExitMessage () {
    EventBus.$on('left.message', () => {
      store.setState('conversationOpened', false)
      store.setState('profileOpen', false)
    })
  }

  onResize () {
    this.screenWidth = window.innerWidth
  }

  closeImagePreview (): void {
    const popup = this.$refs['popup-1'] as any
    popup.$refs['popup-body'].classList.remove('robin-squeezeOut')
    popup.$refs['popup-body'].classList.add('robin-squeezeIn')

    window.setTimeout(() => {
      popup.$refs['popup-body'].classList.remove('robin-squeezeIn')
      popup.$refs['popup-body'].classList.add('robin-squeezeOut')

      store.setState('imagePreviewOpen', false)
      store.setState('imagesToPreview', [])
    }, 100)
  }

  closeMessageViewProfile (): void {
    const popup = this.$refs['popup-2'] as any
    popup.$refs['popup-body'].classList.remove('robin-slideInRight')
    popup.$refs['popup-body'].classList.add('robin-slideOutRight')

    window.setTimeout(() => {
      popup.$refs['popup-body'].classList.remove('robin-slideOutRight')
      popup.$refs['popup-body'].classList.add('robin-slideInRight')

      store.setState('profileOpen', false)
    }, 100)
  }

  closeGroupPrompt (): void {
    store.setState('groupPromptOpen', false)
  }

  closeEncryptionDetails (): void {
    store.setState('encryptionDetailsOpen', false)
  }

  playAudio (event: any): void {
    if (this.messageEvent) {
      if (this.messageEvent.content.receiver_token === this.$user_token) {
        event.target.play()
      }
    }
  }

  resetStopWatch (): void {
    this.time = 0
  }
}
</script>

<style>
.robin-container {
  margin: 0;
  padding: 0;
  width: 100vw;
  /* height: 100vh; */
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
  -webkit-tap-highlight-color: transparent;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Hanken Sans', sans-serif;
  font-kerning: normal;
  -moz-font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  -ms-font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  -webkit-font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  font-feature-settings: 'kern', 'liga', 'clig', 'calt';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* scroll-behavior: smooth !important; */
}
</style>
