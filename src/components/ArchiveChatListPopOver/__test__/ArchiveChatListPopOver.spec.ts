import { render, fireEvent } from '@testing-library/vue'
import ArchiveChatListPopUp from '../ArchiveChatListPopUp.vue'

describe('ArchiveChatListPopUp component', () => {
  test('emits unarchive-chat event on-click', async () => {
    const { getByTestId, emitted } = render(ArchiveChatListPopUp)
    const el = getByTestId('unarchive-chat')
    await fireEvent.click(el)
    expect(emitted()['unarchive-chat']).toHaveProperty('length', 1)
  })
})
