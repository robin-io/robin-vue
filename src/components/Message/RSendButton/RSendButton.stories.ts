// SendButton StoryBook
import RSendButton from './RSendButton.vue'

export default {
  component: RSendButton,
  title: 'SendButton',
  parameters: {
    controls: { disable: true }
  }
}

export const Default = () => ({
  components: { RSendButton },
  template: '<RSendButton />'
})
