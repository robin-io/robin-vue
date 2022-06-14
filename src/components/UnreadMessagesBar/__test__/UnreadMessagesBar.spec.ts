/* eslint-disable */ 
import { render } from '@testing-library/vue'
import UnreadMessagesBar from '../UnreadMessagesBar.vue'

describe('UnreadMessagesBar component', () => {
  test('should render unread message bar', () => {
    const {getByText, queryByText} = render(UnreadMessagesBar, {
      props: {
        number: 1
      }
    })

    getByText('1 Unread Message')
    expect(queryByText('1 Unread Messages')).toBeFalsy()
  })
})
