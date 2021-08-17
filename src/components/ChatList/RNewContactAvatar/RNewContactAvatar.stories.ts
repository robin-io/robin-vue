// NewContactAvatar StoryBook
import RNewContactAvatar from './RNewContactAvatar.vue'

export default {
  component: RNewContactAvatar,
  title: 'NewContactAvatar',
  parameters: {
    actions: { disable: true }
  },
  argTypes: {
    imgUrl: {
      control: { type: 'text' }
    }
  }
}

export const Default = () => ({
  components: { RNewContactAvatar },
  template: '<RNewContactAvatar  />'
})
