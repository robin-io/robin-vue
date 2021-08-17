import { mount } from '@vue/test-utils'
import RUnreadMessageCount from '../RUnreadMessageCount.vue'

describe('RUnreadMessageCount', () => {
  it('When props is passed check if props exist in component', () => {
    const wrapper = mount(RUnreadMessageCount, {
      propsData: {
        count: 100,
        backgroundColor: '#15AE73'
      }
    } as any)

    expect(wrapper.vm.$props.count).toBe(100)
    expect(wrapper.vm.$props.backgroundColor).toBe('#15AE73')
  })

  it('When props (count) is passed check if they are rendered in component', () => {
    const wrapper = mount(RUnreadMessageCount, {
      propsData: {
        count: 100
      }
    } as any)
    const div = wrapper.find('div')

    expect(div.text()).toBe('100')
  })
})
