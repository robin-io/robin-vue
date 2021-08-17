// PersonalHeader StoryBook
import RPersonalHeader from './RPersonalChatHeader.vue'

export default {
  component: RPersonalHeader,
  title: 'Header'
}

export const Default = () => ({
  components: { RPersonalHeader },
  template: '<RPersonalHeader />'
})

Default.parameters = {
  controls: { disable: true }
}
