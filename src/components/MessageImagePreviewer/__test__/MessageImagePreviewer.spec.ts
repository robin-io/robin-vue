import userEvent from '@testing-library/user-event'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import MessageImagePreviewer from '../MessageImagePreviewer.vue'

describe('MessageImagePreviewer component', () => {
  test('should render message preview popover on click', async () => {
    const { getByTestId } = render(MessageImagePreviewer)

    await fireEvent.click(getByTestId('options'))

    expect(getByTestId('message-preview-popover')).toBeVisible()

    await userEvent.click(document.body)

    await waitFor(() => expect(getByTestId('message-preview-popover')).not.toBeVisible())
  })
})
