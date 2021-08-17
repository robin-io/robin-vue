// UnreadMessageCount StoryBook
import RUnreadMessageCount from './RUnreadMessageCount.vue'

export default {
  component: RUnreadMessageCount,
  title: 'UnreadMessageCount',
  argTypes: {
    count: {
      control: { type: 'number' }
    },
    backgroundColor: {
      control: { type: 'color' }
    }
  }
}

export const Default = () => ({
  components: { RUnreadMessageCount },
  template: '<RUnreadMessageCount />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { RUnreadMessageCount },
  props: Object.keys(argTypes),
  template: '<RUnreadMessageCount v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
