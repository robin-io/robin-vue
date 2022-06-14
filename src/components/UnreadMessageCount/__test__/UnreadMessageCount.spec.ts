import { render } from '@testing-library/vue'
import UnreadMessageCount from '../UnreadMessageCount.vue'

describe('UnreadMessageCount component', () => {
  test('should render unread count', () => {
    const { getByTestId } = render(UnreadMessageCount, {
      props: {
        unread: 10
      }
    })

    expect(getByTestId('unread-count').innerHTML.trim()).toBe('9+')
  })
})
