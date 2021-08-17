// Mention StoryBook
import RMention from './RMention.vue'

export default {
  component: RMention,
  title: 'Mention',
  argTypes: {
    color: {
      control: { type: 'color' }
    }
  }
}

export const Default = () => ({
  components: { RMention },
  template: '<RMention />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { RMention },
  props: Object.keys(argTypes),
  template: '<RMention v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
