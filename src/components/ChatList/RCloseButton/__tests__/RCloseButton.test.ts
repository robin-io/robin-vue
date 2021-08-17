import { mount } from '@vue/test-utils'
import RCloseButton from '../RCloseButton.vue'

describe('RCloseButton', () => {
  it('When clicked should emit', () => {
    const wrapper = mount(RCloseButton)
    wrapper.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
