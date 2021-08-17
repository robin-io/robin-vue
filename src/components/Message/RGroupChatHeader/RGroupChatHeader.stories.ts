// GroupHeader StoryBook
import RGroupChatHeader from './RGroupChatHeader.vue'

export default {
  component: RGroupChatHeader,
  title: 'Header'
}

export const Default = () => ({
  components: { RGroupChatHeader },
  template: '<RGroupChatHeader />'
})

Default.parameters = {
  controls: { disable: true }
}
