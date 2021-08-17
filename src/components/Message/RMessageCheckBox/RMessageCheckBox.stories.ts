// MessageCheckBox StoryBook
import RMessageCheckBox from './RMessageCheckBox.vue'

export default {
  component: RMessageCheckBox,
  title: 'MessageCheckBox',
  argTypes: {
    color: {
      control: { type: 'color' }
    }
  }
}

export const Default = () => ({
  components: { RMessageCheckBox },
  template: '<RMessageCheckBox />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { RMessageCheckBox },
  props: Object.keys(argTypes),
  template: '<RMessageCheckBox v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
