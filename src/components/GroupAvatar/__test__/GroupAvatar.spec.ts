/* eslint-disable */ 
import { render } from '@testing-library/vue'
import GroupAvatar from '../GroupAvatar.vue'

describe('GroupAvatar component', () => {
test('should render image url', () => {
    const { getByTestId } = render(GroupAvatar, {
      props: {
        imgUrl: 'https://s3.us-east-2.amazonaws.com/robinapp.io/you%21.png'
      }
    })

    const profilePicture = getByTestId('profile-picture') as HTMLImageElement
    expect(profilePicture.src).toBe('https://s3.us-east-2.amazonaws.com/robinapp.io/you%21.png')
  })
})
