import { render, fireEvent, waitFor } from '@testing-library/vue'
import MessageInputBar from '../MessageInputBar.vue'
import { groupMessage as messageReply } from '@/data'

describe('MessageInputBar component', () => {
  test('should render users input', async () => {
    const { getByTestId } = render(MessageInputBar, {
      props: {
        messageReply: {}
      }
    })

    const input = getByTestId('input') as HTMLInputElement

    await fireEvent.update(input, 'Hello, Mr jameson.')

    expect(input.value).toBe('Hello, Mr jameson.')
  })

  test('should not render send button', async () => {
    const { getByTestId } = render(MessageInputBar, {
      props: {
        messageReply: {}
      }
    })

    const button = getByTestId('send-button')
    const input = getByTestId('input') as HTMLInputElement

    await fireEvent.update(input, 'Hello, Mr jameson.')

    expect(button).toBeVisible()

    await fireEvent.update(input, '')

    expect(button).not.toBeVisible()
  })

  test('should start recording', async () => {
    const { getByTestId } = render(MessageInputBar, {
      props: {
        messageReply: {}
      }
    })

    await fireEvent.click(getByTestId('record-start-button'))
    await waitFor(() => expect(getByTestId('current-time')).toBeVisible())
  })

  test('should stop recording', async () => {
    const { getByTestId } = render(MessageInputBar, {
      props: {
        messageReply: {}
      }
    })

    await fireEvent.click(getByTestId('record-start-button'))
    await waitFor(() => expect(getByTestId('current-time')).toBeVisible())
    await fireEvent.click(getByTestId('record-stop-button'))
    await waitFor(() => expect(getByTestId('current-time')).not.toBeVisible())
  })

  test('should render message reply', () => {
    const { getByText } = render(MessageInputBar, {
      props: {
        messageReply
      }
    })

    getByText('lol')
  })

  test('should open attach file popover', async () => {
    const { getByTestId } = render(MessageInputBar, {
      props: {
        messageReply: {}
      }
    })

    const button = getByTestId('attach-file-button')

    await fireEvent.click(button)

    expect(getByTestId('attach-file-popover')).toBeVisible()

    await fireEvent.click(button)

    expect(getByTestId('attach-file-popover')).not.toBeVisible()
  })
})
