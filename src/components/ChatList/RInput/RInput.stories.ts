// Input StoryBook
import RInput from './RInput.vue'

export default {
  component: RInput,
  title: 'Input',
  argTypes: {
    borderRadius: {
      control: { type: 'number' }
    },
    height: {
      control: { type: 'number' }
    },
    width: {
      control: { type: 'text' }
    },
    placeholder: {
      control: { type: 'text' }
    }
  }
}

export const Default = () => ({
  components: { RInput },
  template: '<RInput />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { RInput },
  props: Object.keys(argTypes),
  template: '<RInput v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
