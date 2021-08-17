// CheckBox StoryBook
import RCheckBox from './RCheckBox.vue'

export default {
  component: RCheckBox,
  title: 'CheckBox',
  argTypes: {
    color: {
      control: { type: 'color' }
    }
  }
}

export const Default = () => ({
  components: { RCheckBox },
  template: '<RCheckBox />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { RCheckBox },
  props: Object.keys(argTypes),
  template: '<RCheckBox v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
