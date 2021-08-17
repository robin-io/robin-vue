import { mount } from '@vue/test-utils'
import RCheckBox from '../RCheckBox.vue'

describe('RCheckBox', () => {
  it('When props is passed check if props exist in component', () => {
    const wrapper = mount(RCheckBox, {
      propsData: {
        color: '#264653'
      }
    } as any)

    expect(wrapper.vm.$props.color).toBe('#264653')
  })
})
