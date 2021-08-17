// TextButton StoryBook
import RTextButton from './RTextButton.vue'

export default {
  component: RTextButton,
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
  components: { RTextButton },
  template: '<RTextButton />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { RTextButton },
  props: Object.keys(argTypes),
  template: '<RTextButton v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
