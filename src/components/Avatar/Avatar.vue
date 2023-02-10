<template>
  <div class="robin-image">
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      v-if="imgUrl == '' && getContactName == ''"
    >
      <circle cx="25" cy="25" r="24" fill="#F4F6F8" stroke="#236BF8" stroke-opacity="0.2" />
      <path
        d="M28.1903 25.1128C29.1958 24.3217 29.9297 23.2368 30.29 22.0092C30.6503 20.7815 30.6189 19.4721 30.2003 18.263C29.7817 17.054 28.9967 16.0055 27.9544 15.2634C26.9122 14.5213 25.6646 14.1226 24.3851 14.1226C23.1057 14.1226 21.8581 14.5213 20.8158 15.2634C19.7736 16.0055 18.9886 17.054 18.57 18.263C18.1514 19.4721 18.12 20.7815 18.4803 22.0092C18.8405 23.2368 19.5745 24.3217 20.58 25.1128C18.857 25.8031 17.3536 26.948 16.2302 28.4255C15.1067 29.9031 14.4052 31.6577 14.2005 33.5026C14.1857 33.6372 14.1976 33.7735 14.2354 33.9036C14.2733 34.0337 14.3364 34.1551 14.4211 34.2608C14.5923 34.4743 14.8413 34.6111 15.1133 34.641C15.3854 34.6709 15.6581 34.5916 15.8716 34.4204C16.0851 34.2492 16.2219 34.0002 16.2518 33.7282C16.477 31.7233 17.433 29.8716 18.9372 28.527C20.4413 27.1823 22.3881 26.439 24.4057 26.439C26.4232 26.439 28.37 27.1823 29.8741 28.527C31.3783 29.8716 32.3343 31.7233 32.5595 33.7282C32.5874 33.9802 32.7076 34.213 32.897 34.3815C33.0864 34.5501 33.3316 34.6426 33.5851 34.641H33.698C33.9668 34.6101 34.2125 34.4741 34.3816 34.2628C34.5507 34.0515 34.6294 33.7819 34.6005 33.5128C34.3949 31.6628 33.6896 29.9036 32.5604 28.4238C31.4311 26.944 29.9204 25.7995 28.1903 25.1128ZM24.3851 24.3846C23.5737 24.3846 22.7805 24.144 22.1059 23.6932C21.4312 23.2424 20.9054 22.6017 20.5949 21.852C20.2843 21.1024 20.2031 20.2775 20.3614 19.4817C20.5197 18.6859 20.9104 17.9548 21.4842 17.3811C22.0579 16.8073 22.7889 16.4166 23.5848 16.2583C24.3806 16.1 25.2055 16.1813 25.9551 16.4918C26.7048 16.8023 27.3455 17.3281 27.7963 18.0028C28.2471 18.6774 28.4877 19.4706 28.4877 20.282C28.4877 21.3701 28.0555 22.4136 27.2861 23.183C26.5167 23.9524 25.4732 24.3846 24.3851 24.3846Z"
        fill="#566BA0"
      />
    </svg>

    <div class="robin-default-profile" v-if="imgUrl == '' && getContactName != ''">
      <message-content as="span" :font-size="16" color="#000">
        {{ renderContactName() }}
      </message-content>
    </div>

    <img
      v-if="imgUrl != ''"
      :src="imgUrl"
      alt="profile"
      class="robin-image"
      loading="lazy"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import Content from '../Content/Content.vue'

const ComponentProps = Vue.extend({
  props: {
    imgUrl: {
      type: String as PropType<string>,
      default: ''
    },
    senderToken: {
      type: String as PropType<string>,
      default: ''
    }
  }
})

@Component({
  name: 'Avatar',
  components: {
    'message-content': Content
  }
})
export default class Avatar extends ComponentProps {
  get getContactName (): string {
    const index = this.$robin_users.findIndex(
      (user: any) => user.userToken === this.senderToken
    ) as number
    const user = this.$robin_users[index] as any

    if (user) {
      return user.userName && user.userName !== '' ? user.userName.trim().split(' ') : ''
    }

    return ''
  }

  renderContactName () {
    let name = '' as string

    if (this.getContactName.length > 1) {
      name =
        this.getContactName[0][0] +
        (this.getContactName[1].trim() !== '' ? this.getContactName[1][0] : '')
    }

    if (this.getContactName.length < 2) {
      name = this.getContactName[0][0]
    }

    return name
  }
}
</script>
