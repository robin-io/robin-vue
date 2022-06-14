import { render } from '@testing-library/vue'
import ChatListPopOver from '../ChatListPopOver.vue'
import { conversation } from '@/data'

describe('ChatListPopOver component', () => {
  test('should render marked conversation', () => {
    const { getByText } = render(ChatListPopOver, {
      props: {
        conversation
      }
    })

    getByText('Mark As Unread')
  })

  test('should render unmarked conversation', () => {
    const { queryByText } = render(ChatListPopOver, {
      props: {
        conversation
      }
    })

    expect(queryByText('Mark As read')).not.toBeInTheDocument()
  })
})
