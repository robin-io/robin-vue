import { render, fireEvent } from '@testing-library/vue'
import ArchivedChatList from '../ArchivedChatList.vue'
import { archivedConversations } from './ArchivedChatList'

describe('ArchivedChatList component', () => {
  test('should emits closemodal event with data when iconbutton component is clicked', () => {
    const { getByTestId, emitted } = render(ArchivedChatList)
    const el = getByTestId('closemodal')
    fireEvent.click(el)
    expect(emitted().closemodal[0][0] === 'primary')
  })

  test('should render properties in component found in archivedconversations prop', () => {
    const { getByText, getByTestId, queryByTestId } = render(ArchivedChatList, {
      props: {
        archivedConversations
      }
    })

    getByText('Enoch')
    expect(getByTestId('regular-avatar')).toBeTruthy()
    expect(queryByTestId('group-avatar')).toBeNull()
  })

  test('should render properties in component when archivedConversations is empty', () => {
    const { getByText } = render(ArchivedChatList, {
      props: {
        archivedConversations: []
      }
    })

    getByText('No archived chat')
  })

  test('should render archive-popover on-click on archivemodal-handler', async () => {
    const { getByTestId, queryByTestId } = render(ArchivedChatList, {
      props: {
        archivedConversations
      }
    })
    const archiveHandler = getByTestId('archive-handler')

    await fireEvent.click(archiveHandler)
    expect(queryByTestId('archive-popover')).toBeVisible()
  })
})
