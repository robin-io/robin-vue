import { render, fireEvent } from '@testing-library/vue'
import ChatHeader from '../ChatHeader.vue'
import { conversation } from '@/data'

describe('ChatHeader component', () => {
  test('should render conversation.', () => {
    const { getByText } = render(ChatHeader, {
      props: {
        conversation
      }
    })

    getByText('Enoch')
  })

  test('should emit event when delete iconbutton is clicked.', async () => {
    const { getByTestId, emitted } = render(ChatHeader, {
      props: {
        conversation
      }
    })

    const button = getByTestId('delete-button')

    await fireEvent.click(button)

    expect(emitted()['delete-selected-messages']).toHaveLength(1)
  })
})
