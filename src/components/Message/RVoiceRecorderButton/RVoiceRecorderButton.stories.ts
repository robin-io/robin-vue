// VoiceRecorderButton StoryBook
import RVoiceRecorderButton from './RVoiceRecorderButton.vue'

export default {
  component: RVoiceRecorderButton,
  title: 'VoiceRecorderButton',
  argTypes: {
    color: {
      control: { type: 'color' }
    }
  }
}

export const Default = () => ({
  components: { RVoiceRecorderButton },
  template: '<RVoiceRecorderButton />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { RVoiceRecorderButton },
  props: Object.keys(argTypes),
  template: '<RVoiceRecorderButton v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
