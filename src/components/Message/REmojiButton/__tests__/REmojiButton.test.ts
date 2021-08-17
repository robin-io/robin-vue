import { mount } from '@vue/test-utils'
import REmojiButton from '../REmojiButton.vue'

describe('REmojiButton', () => {
  it('When props is passed check if props exist in component', () => {
    const wrapper = mount(REmojiButton, {
      propsData: {
        color: '#15AE73'
      }
    } as any)

    expect(wrapper.vm.$props.color).toBe('#15AE73')
  })
})
