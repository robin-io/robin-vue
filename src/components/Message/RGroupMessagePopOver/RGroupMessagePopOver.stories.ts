// GroupMessagePopOver StoryBook
import RGroupMessagePopOver from './RGroupMessagePopOver.vue'

export default {
  component: RGroupMessagePopOver,
  title: 'GroupMessagePopOver',
  parameters: {
    controls: { disable: true }
  }
}

export const Default = () => ({
  components: { RGroupMessagePopOver },
  template: '<RGroupMessagePopOver />'
})
