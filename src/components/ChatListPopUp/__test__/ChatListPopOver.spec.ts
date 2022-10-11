import { render } from '@testing-library/vue'
import ChatListPopUp from '../ChatListPopUp.vue'
import { conversation } from '@/data'

describe('ChatListPopUp component', () => {
  test('should render marked conversation', () => {
    const { getByText } = render(ChatListPopUp, {
      props: {
        conversation
      }
    })

    getByText('Mark As Unread')
  })

  test('should render unmarked conversation', () => {
    const { queryByText } = render(ChatListPopUp, {
      props: {
        conversation
      }
    })

    expect(queryByText('Mark As read')).not.toBeInTheDocument()
  })
})
