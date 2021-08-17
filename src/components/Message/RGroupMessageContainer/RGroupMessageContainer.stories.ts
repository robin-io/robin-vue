// GroupMessageContainer StoryBook
import RGroupMessageContainer from './RGroupMessageContainer.vue'

export default {
  component: RGroupMessageContainer,
  title: 'GroupMessageContainer',
  parameters: {
    controls: { disable: true }
  }
}

export const Default = () => ({
  components: { RGroupMessageContainer },
  template: '<RGroupMessageContainer />'
})
