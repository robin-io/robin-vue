import { render, fireEvent } from '@testing-library/vue'
import MessageGrid from '../MessageGrid.vue'
import { messageGrid as message, conversation } from '@/data'

describe('MessageGrid component', () => {
  test('should emit event', async () => {
    const { getByTestId, emitted } = render(MessageGrid, {
      props: {
        message,
        conversation,
        messagePopup: {
          opened: false,
          _id: ''
        }
      }
    })

    await fireEvent.click(getByTestId('bubble'))
    await fireEvent.click(getByTestId('bubble-inner'))

    expect(emitted()['open-modal']).toHaveProperty('length', 1)
    expect(emitted()['close-modal']).toHaveProperty('length', 1)
    expect(emitted()['open-preview']).toHaveProperty('length', 1)
  })
})
