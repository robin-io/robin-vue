// MessageRead StoryBook
import RMessageRead from './RMessageRead.vue'

export default {
  component: RMessageRead,
  title: 'MessageRead',
  parameters: {
    controls: {
      disable: true
    }
  }
}

export const Default = () => ({
  components: { RMessageRead },
  template: '<RMessageRead />'
})
