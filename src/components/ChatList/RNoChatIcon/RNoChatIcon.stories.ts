// NoChatIcon StoryBook
import RNoChatIcon from './RNoChatIcon.vue'

export default {
  component: RNoChatIcon,
  title: 'NoChatRNoChatIcon',
  argTypes: {
    color: {
      control: { type: 'color' }
    }
  }
}

export const Default = () => ({
  components: { RNoChatIcon },
  template: '<RNoChatIcon />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { RNoChatIcon },
  props: Object.keys(argTypes),
  template: '<RNoChatIcon v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
