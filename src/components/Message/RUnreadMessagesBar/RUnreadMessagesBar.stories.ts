// UnreadMessageBar StoryBook
import RUnreadMessageBar from './RUnreadMessagesBar.vue'

export default {
  component: RUnreadMessageBar,
  title: 'UnreadMessageBar',
  argTypes: {
    number: {
      control: { type: 'number' }
    }
  }
}

export const Default = () => ({
  components: { RUnreadMessageBar },
  template: '<RUnreadMessageBar />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { RUnreadMessageBar },
  props: Object.keys(argTypes),
  template: '<RUnreadMessageBar v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
