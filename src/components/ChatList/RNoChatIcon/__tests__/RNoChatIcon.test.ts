import { mount } from '@vue/test-utils'
import RNoChatIcon from '../RNoChatIcon.vue'

describe('RNoChatIcon', () => {
  it('When props is passed check if props exist in component', () => {
    const wrapper = mount(RNoChatIcon, {
      propsData: {
        color: '#ffffff'
      }
    } as any)

    expect(wrapper.vm.$props.color).toBe('#ffffff')
  })
})
