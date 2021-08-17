import { mount } from '@vue/test-utils'
import RInput from '../RInput.vue'

describe('RInput', () => {
  it('When props is passed check if props exist in component', () => {
    const wrapper = mount(RInput, {
      propsData: {
        borderRadius: 4,
        height: 44,
        width: 'fullWidth'
      }
    } as any)

    expect(wrapper.vm.$props.borderRadius).toBe(4)
    expect(wrapper.vm.$props.height).toBe(44)
    expect(wrapper.vm.$props.width).toBe('fullWidth')
  })
})
