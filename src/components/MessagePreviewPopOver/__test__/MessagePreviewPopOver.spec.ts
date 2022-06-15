import { render, fireEvent } from '@testing-library/vue'
import MessagePreviewPopOver from '../MessagePreviewPopOver.vue'

describe('MessagePreviewPopOver component', () => {
  test('should emit event', async () => {
    const { getByTestId, emitted } = render(MessagePreviewPopOver)

    await fireEvent.click(getByTestId('download-button'))
    await fireEvent.click(getByTestId('reply-button'))
    await fireEvent.click(getByTestId('forward-button'))
    await fireEvent.click(getByTestId('delete-button'))

    expect(emitted().download).toHaveProperty('length', 1)
    expect(emitted().reply).toHaveProperty('length', 1)
    expect(emitted().forward).toHaveProperty('length', 1)
    expect(emitted().delete).toHaveProperty('length', 1)
  })
})
