// MessageDelivered StoryBook
import RMessageDelivered from './RMessageDelivered.vue'

export default {
  component: RMessageDelivered,
  title: 'MessageDelivered',
  parameters: {
    controls: {
      disable: true
    }
  }
}

export const Default = () => ({
  components: { RMessageDelivered },
  template: '<RMessageDelivered />'
})
