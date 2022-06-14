import { render } from '@testing-library/vue'
import PrimaryChatList from '../PrimaryChatList.vue'
import { archivedConversations, conversation } from '@/data'

describe('PrimaryChatList component', () => {
  test('should render archived conversation count', () => {
    const { getByTestId } = render(PrimaryChatList, {
      props: {
        regularConversations: [conversation],
        archivedConversations
      }
    })

    expect(getByTestId('archived-conversation-count').innerHTML.trim()).toBe('1')
  })

  test('should render properties in component found in prop', () => {
    const { getByText, getByTestId, queryByTestId } = render(PrimaryChatList, {
      props: {
        regularConversations: [conversation]
      }
    })

    getByText('Enoch')
    expect(getByTestId('regular-avatar')).toBeTruthy()
    expect(queryByTestId('group-avatar')).toBeNull()
  })
})
