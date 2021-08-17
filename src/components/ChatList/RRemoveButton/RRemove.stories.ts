// RemoveButton StoryBook
import RRemoveButton from './RRemoveButton.vue'

export default {
  component: RRemoveButton,
  title: 'RemoveRRemoveButton',
  parameters: {
    controls: {
      disable: true
    }
  }
}

export const Default = () => ({
  components: { RRemoveButton },
  template: '<RRemoveButton />'
})
