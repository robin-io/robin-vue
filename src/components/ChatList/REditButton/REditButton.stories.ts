// EditButton StoryBook
import REditButton from './REditButton.vue'

export default {
  component: REditButton,
  title: 'EditButton',
  parameters: {
    controls: {
      disable: true
    }
  }
}

export const Default = () => ({
  components: { REditButton },
  template: '<REditButton />'
})
