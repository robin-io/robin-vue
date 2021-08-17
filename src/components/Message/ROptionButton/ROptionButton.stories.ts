// OptionButton StoryBook
import ROptionButton from './ROptionButton.vue'

export default {
  component: ROptionButton,
  title: 'OptionButton',
  argTypes: {
    color: {
      control: { type: 'color' }
    }
  }
}

export const Default = () => ({
  components: { ROptionButton },
  template: '<ROptionButton />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { ROptionButton },
  props: Object.keys(argTypes),
  template: '<ROptionButton v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
