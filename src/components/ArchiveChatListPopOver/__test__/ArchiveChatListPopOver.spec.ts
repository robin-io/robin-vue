import { render, fireEvent } from '@testing-library/vue'
import ArchiveChatListPopOver from '../ArchiveChatListPopOver.vue'

describe('ArchiveChatListPopOver component', () => {
  test('emits unarchive-chat event on-click', async () => {
    const { getByTestId, emitted } = render(ArchiveChatListPopOver)
    const el = getByTestId('unarchive-chat')
    await fireEvent.click(el)
    expect(emitted()['unarchive-chat']).toHaveProperty('length', 1)
  })
})
