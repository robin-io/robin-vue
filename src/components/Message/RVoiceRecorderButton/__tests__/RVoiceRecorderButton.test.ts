import { mount } from '@vue/test-utils'
import RVoiceRecorderButton from '../RVoiceRecorderButton.vue'

describe('RVoiceRecorderButton', () => {
  it('When props is passed check if props exist in component', () => {
    const wrapper = mount(RVoiceRecorderButton, {
      propsData: {
        color: '#15AE73'
      }
    } as any)

    expect(wrapper.vm.$props.color).toBe('#15AE73')
  })
})
