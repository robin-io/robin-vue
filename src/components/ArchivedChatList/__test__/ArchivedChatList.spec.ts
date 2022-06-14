import { render, fireEvent } from '@testing-library/vue'
import ArchivedChatList from '../ArchivedChatList.vue'
import { archivedConversations } from '@/data'

describe('ArchivedChatList component', () => {
  // test('should emits closemodal event with data when iconbutton component is clicked', () => {
  //   const { getByTestId, emitted } = render(ArchivedChatList)
  //   const el = getByTestId('closemodal')
  //   fireEvent.click(el)
  //   expect(emitted().closemodal[0][0] === 'primary')
  // })

  test('should render properties in props', () => {
    const { getByText, getByTestId, queryByTestId } = render(ArchivedChatList, {
      props: {
        archivedConversations
      }
    })

    getByText('Enoch')
    expect(getByTestId('regular-avatar')).toBeTruthy()
    expect(queryByTestId('group-avatar')).toBeNull()
  })

  test('should render properties when props is empty', () => {
    const { getByText } = render(ArchivedChatList, {
      props: {
        archivedConversations: []
      }
    })

    getByText('No archived chat')
  })

  test('should render archive popover', async () => {
    const { getByTestId, queryByTestId } = render(ArchivedChatList, {
      props: {
        archivedConversations
      }
    })
    const chatHandler = getByTestId('chat-handler')

    await fireEvent.click(chatHandler)
    expect(queryByTestId('chat-popover')).toBeVisible()
  })
})
