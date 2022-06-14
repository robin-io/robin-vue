import { render, fireEvent } from '@testing-library/vue'
import MessageContent from '../MessageContent.vue'
import { groupConversation as conversation, groupMessage as message } from '@/data'

describe('MessageContent component', () => {
  test('should render reaction popup on click of popup caret', async () => {
    const { getByTestId } = render(MessageContent, {
      props: {
        message,
        conversation,
        messages: [message],
        storedMessages: [message]
      }
    })

    await fireEvent.mouseOver(getByTestId('bubble'))

    await fireEvent.click(getByTestId('popup-caret'))

    expect(getByTestId('reaction-popover')).toBeVisible()
  })

  test('should render message popup on click of popup caret', async () => {
    const { getByTestId } = render(MessageContent, {
      props: {
        message,
        conversation,
        messages: [message],
        storedMessages: [message]
      }
    })

    await fireEvent.mouseOver(getByTestId('bubble'))

    await fireEvent.click(getByTestId('popup-caret'))

    expect(getByTestId('message-popover')).toBeVisible()
  })
})
