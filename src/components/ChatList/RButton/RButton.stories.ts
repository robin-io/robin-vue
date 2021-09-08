// TextButton StoryBook
import RButton from './RButton.vue'

export default {
  component: RButton,
  title: 'TextButton',
  argTypes: {
    color: {
      control: { type: 'color' }
    },
    fontSize: {
      control: { type: 'number' }
    },
    fontWeight: {
      control: { type: 'text' }
    },
    text: {
      control: { type: 'text' }
    },
    archived: {
      table: {
        disable: true
      }
    },
    emit: {
      table: {
        disable: true
      }
    }
  }
}

export const Default = () => ({
  components: { RButton },
  template: '<RButton />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { RButton },
  props: Object.keys(argTypes),
  template: '<RButton v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
