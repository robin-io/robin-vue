// MessageInputBar StoryBook
import RMessageInputBar from './RMessageInputBar.vue'

export default {
  component: RMessageInputBar,
  title: 'MessageInputBar',
  parameters: {
    controls: { disable: true }
  }
}

export const Default = () => ({
  components: { RMessageInputBar },
  template: '<RMessageInputBar />'
})
