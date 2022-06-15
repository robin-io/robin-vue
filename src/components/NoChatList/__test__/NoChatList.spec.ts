import { render, fireEvent } from '@testing-library/vue'
import NoChatList from '../NoChatList.vue'

describe('NoChatList component', () => {
  test('should emit on edit', async () => {
    const { getByTestId, emitted } = render(NoChatList)

    await fireEvent.click(getByTestId('edit'))

    expect(emitted().opennewchatmodal).toHaveProperty('length', 1)
  })
})
