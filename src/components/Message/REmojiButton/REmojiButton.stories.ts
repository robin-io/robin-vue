// EmojiButton StoryBook
import REmojiButton from './REmojiButton.vue'

export default {
  component: REmojiButton,
  title: 'EmojiButton',
  argTypes: {
    color: {
      control: { type: 'color' }
    }
  }
}

export const Default = () => ({
  components: { REmojiButton },
  template: '<REmojiButton />'
})

Default.parameters = {
  controls: { disable: true }
}

export const Custom = (_arg: any, { argTypes }: any) => ({
  components: { REmojiButton },
  props: Object.keys(argTypes),
  template: '<REmojiButton v-bind="$props" />'
})

Custom.storyName = 'with custom properties'
Custom.parameters = {
  controls: { hideNoControlsWarning: true },
  actions: { disable: true }
}
