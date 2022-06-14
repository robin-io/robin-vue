import { render } from '@testing-library/vue'
import Prompt from '../Prompt.vue'

describe('Prompt component', () => {
  test('should render status', () => {
    const { getByText } = render(Prompt, {
      props: {
        status: 'delete message'
      }
    })

    getByText('Delete Message')
  })
})
