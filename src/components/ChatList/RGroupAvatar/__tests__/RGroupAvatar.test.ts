import { mount } from '@vue/test-utils'
import RGroupAvatar from '../RGroupAvatar.vue'

describe('RGroupAvatar', () => {
  it('When image url is specified, image url should be rendered in image element in component', () => {
    const wrapper = mount(RGroupAvatar, {
      propsData: {
        imgUrl: 'https://miro.medium.com/max/730/1*VdBcLoFkYarD4XpJLf9tXw.png'
      }
    } as any)
    const img = wrapper.find('img')

    expect(img.attributes('src')).toBe('https://miro.medium.com/max/730/1*VdBcLoFkYarD4XpJLf9tXw.png')
  })
})
