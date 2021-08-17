import { mount } from '@vue/test-utils'
import RMention from '../RMention.vue'

describe('RMention', () => {
  it('When props is passed check if props exist in component', () => {
    const wrapper = mount(RMention, {
      propsData: {
        color: '#ffffff'
      }
    } as any)

    expect(wrapper.vm.$props.color).toBe('#ffffff')
  })
})
