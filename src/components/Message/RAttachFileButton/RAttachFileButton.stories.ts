// AttachFileButton StoryBook
import RAttachFileButton from './RAttachFileButton.vue'

export default {
  component: RAttachFileButton,
  title: 'AttachFileButton',
  argTypes: {
    color: {
      control: { type: 'color' }
    }
  }
}

export const Default = () => ({
  components: { RAttachFileButton },
  template: '<RAttachFileButton />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { RAttachFileButton },
  props: Object.keys(argTypes),
  template: '<RAttachFileButton v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
