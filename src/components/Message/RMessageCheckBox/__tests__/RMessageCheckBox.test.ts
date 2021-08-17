import { mount } from '@vue/test-utils'
import RMessageCheckBox from '../RMessageCheckBox.vue'

describe('RMessageCheckBox', () => {
  it('When props is passed check if props exist in component', () => {
    const wrapper = mount(RMessageCheckBox, {
      propsData: {
        color: '#15AE73'
      }
    } as any)

    expect(wrapper.vm.$props.color).toBe('#15AE73')
  })
})
