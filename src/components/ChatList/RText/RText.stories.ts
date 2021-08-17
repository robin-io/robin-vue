// Text StoryBook
import RText from './RText.vue'

export default {
  component: RText,
  title: 'Text',
  argTypes: {
    as: {
      control: {
        options: ['h1', 'h2', 'h3', 'p', 'span'],
        type: 'select'
      }
    },
    text: {
      control: { type: 'text' }
    },
    color: {
      control: { type: 'color' }
    },
    fontSize: {
      control: { type: 'number' }
    },
    fontWeight: {
      control: { type: 'text' }
    },
    lineHeight: {
      control: { type: 'number' }
    },
    textWrap: {
      control: { type: 'text' }
    },
    maxWidth: {
      control: { type: 'text' }
    }
  }
}

export const Default = () => ({
  components: { RText },
  template: '<RText />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { RText },
  props: Object.keys(argTypes),
  template: '<RText v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
