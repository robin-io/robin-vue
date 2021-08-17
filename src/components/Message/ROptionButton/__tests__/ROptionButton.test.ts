import { mount } from '@vue/test-utils'
import ROptionButton from '../ROptionButton.vue'

describe('ROptionButton', () => {
  it('When props is passed check if props exist in component', () => {
    const wrapper = mount(ROptionButton, {
      propsData: {
        color: '#000'
      }
    } as any)

    expect(wrapper.vm.$props.color).toBe('#000')
  })

  it('When clicked should emit', () => {
    const wrapper = mount(ROptionButton)
    wrapper.trigger('click')

    expect(wrapper.emitted('options')).toBeTruthy()
  })
})
