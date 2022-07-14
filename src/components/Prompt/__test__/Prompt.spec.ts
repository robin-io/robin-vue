import { render, fireEvent } from '@testing-library/vue'
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

  test('should emit event', async () => {
    const { getByTestId, emitted } = render(Prompt)

    await fireEvent.click(getByTestId('cancel-button'))
    await fireEvent.click(getByTestId('proceed-button'))

    expect(emitted().closemodal).toHaveProperty('length', 1)
    expect(emitted().proceed).toHaveProperty('length', 1)
  })
})
