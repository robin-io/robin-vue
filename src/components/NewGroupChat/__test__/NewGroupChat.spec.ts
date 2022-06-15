import { render, fireEvent, waitFor } from '@testing-library/vue'
import NewGroupChat from '../NewGroupChat.vue'

describe('NewGroupChat component', () => {
  test('should upload file', async () => {
    const { getByTestId } = render(NewGroupChat)

    const inputEl = getByTestId('group-icon-upload')

    const file = new File(['(:)'], 'image.png', { type: 'image/png' })

    Object.defineProperty(inputEl, 'files', {
      value: [file]
    })

    await fireEvent.change(inputEl)

    await waitFor(() => expect(getByTestId('image')).toBeVisible())
  })
})
