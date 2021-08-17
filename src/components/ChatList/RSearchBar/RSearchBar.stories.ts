// SearchBar StoryBook
import RSearchBar from './RSearchBar.vue'

export default {
  component: RSearchBar,
  title: 'SearchBar',
  parameters: {
    controls: { disable: true }
  }
}

export const Default = () => ({
  components: { RSearchBar },
  template: '<RSearchBar />'
})
