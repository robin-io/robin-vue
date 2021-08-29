import { mount } from '@vue/test-utils'
import RAvatar from '../RAvatar.vue'

describe('RAvatar', () => {
  it('When image url is specified, image url should be rendered in image element in component', () => {
    const wrapper = mount(RAvatar, {
      propsData: {
        imgUrl: 'https://miro.medium.com/max/730/1*VdBcLoFkYarD4XpJLf9tXw.png'
      }
    } as any)
    const img = wrapper.find('img')

    expect(img.attributes('src')).toBe('https://miro.medium.com/max/730/1*VdBcLoFkYarD4XpJLf9tXw.png')
  })
})
