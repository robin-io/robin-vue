import { render, fireEvent } from '@testing-library/vue'
import MessagePopOver from '../MessagePopOver.vue'

describe('MessagePopOver component', () => {
  test('should emit event', async () => {
    const { getByTestId, emitted } = render(MessagePopOver)

    await fireEvent.click(getByTestId('reply-button'))
    await fireEvent.click(getByTestId('forward-button'))
    await fireEvent.click(getByTestId('select-button'))
    await fireEvent.click(getByTestId('delete-button'))

    expect(emitted()['reply-message']).toHaveProperty('length', 1)
    expect(emitted()['forward-message']).toHaveProperty('length', 1)
    expect(emitted()['select-message']).toHaveProperty('length', 2)
    expect(emitted()['close-modal']).toHaveProperty('length', 1)
  })
})
