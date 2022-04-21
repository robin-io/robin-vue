import { render } from '@testing-library/vue'
import AlphabetBlock from '../AlphabetBlock.vue'

describe('text prop passed into component', () => {
  test('renders in component', async () => {
    const { getByText } = render(AlphabetBlock, {
      props: {
        text: 'O'
      }
    })

    getByText('O')
  })
})
