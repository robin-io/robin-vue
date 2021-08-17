import { mount } from '@vue/test-utils'
import REditButton from '../REditButton.vue'

describe('REditButton', () => {
  it('When clicked should emit', () => {
    const wrapper = mount(REditButton)
    wrapper.trigger('click')

    expect(wrapper.emitted('edit')).toBeTruthy()
  })
})
