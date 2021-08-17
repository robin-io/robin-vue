import { mount } from '@vue/test-utils'
import RUnreadMessagesBar from '../RUnreadMessagesBar.vue'

describe('RUnreadMessagesBar', () => {
  it('When props is passed check if props exist in component', () => {
    const wrapper = mount(RUnreadMessagesBar, {
      propsData: {
        number: 1
      }
    } as any)

    expect(wrapper.vm.$props.number).toBe(1)
  })
})
