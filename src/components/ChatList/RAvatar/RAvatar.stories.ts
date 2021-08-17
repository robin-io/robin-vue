// Avatar StoryBook
import RAvatar from './RAvatar.vue'

export default {
  component: RAvatar,
  title: 'Avatar',
  parameters: {
    actions: { disable: true }
  },
  argTypes: {
    imgUrl: {
      control: { type: 'text' }
    }
  }
}

export const Default = (_arg: any, { argTypes }: any) => ({
  components: { RAvatar },
  props: Object.keys(argTypes),
  template: '<RAvatar v-bind="$props" />'
})
