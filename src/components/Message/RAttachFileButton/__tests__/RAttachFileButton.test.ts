import { mount } from '@vue/test-utils'
import RAttachFileButton from '../RAttachFileButton.vue'

describe('RAttachFileButton', () => {
  it('When props is passed check if props exist in component', () => {
    const wrapper = mount(RAttachFileButton, {
      propsData: {
        color: '#15AE73'
      }
    } as any)

    expect(wrapper.vm.$props.color).toBe('#15AE73')
  })
})
