// RGroupAvatar StoryBook
import RGroupAvatar from './RGroupAvatar.vue'

export default {
  component: RGroupAvatar,
  title: 'GroupAvatar',
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
  components: { RGroupAvatar },
  props: Object.keys(argTypes),
  template: '<RGroupAvatar v-bind="$props" />'
})
