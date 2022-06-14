import { render } from '@testing-library/vue'
import Avatar from '../Avatar.vue'

const robinUsers = [{
  userToken: 'tMgzcqdUUDsJndIHcJyJdmpi',
  profileImage: '',
  userName: 'Mike Scoffield'
},
{
  userToken: 'FefXITDgAeTVrghcOHiimDVB',
  profileImage: '',
  userName: 'Elvis Chuks'
}]

describe('Avatar component', () => {
  test('should render image url', () => {
    const { getByTestId } = render(Avatar, {
      props: {
        imgUrl: 'https://s3.us-east-2.amazonaws.com/robinapp.io/you%21.png'
      }
    })

    const profilePicture = getByTestId('profile-picture') as HTMLImageElement
    expect(profilePicture.src).toBe('https://s3.us-east-2.amazonaws.com/robinapp.io/you%21.png')
  })

  test('should render username initials', () => {
    const { getByText } = render(Avatar, {
      props: {
        senderToken: 'FefXITDgAeTVrghcOHiimDVB',
        robinUsers
      }
    })

    getByText('EC')
  })
})
