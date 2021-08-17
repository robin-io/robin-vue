// CloseButton StoryBook
import RCloseButton from './RCloseButton.vue'

export default {
  component: RCloseButton,
  title: 'CloseButton',
  parameters: {
    controls: {
      disable: true
    }
  }
}

export const Default = () => ({
  components: { RCloseButton },
  template: '<RCloseButton />'
})
