import { render } from '@testing-library/vue'
import NewChatList from '../NewChatList.vue'
import { robinUsers } from '@/data'

describe('NewChatList component', () => {
  test('should render username', () => {
    const { getByText } = render(NewChatList, {
      props: {
        robinUsers
      }
    })

    getByText('Mike Scoffield')
  })
})
