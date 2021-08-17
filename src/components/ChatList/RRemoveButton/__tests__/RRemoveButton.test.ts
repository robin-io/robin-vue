import { mount } from '@vue/test-utils'
import RRemoveButton from '../RRemoveButton.vue'

describe('RRemoveButton', () => {
  it('When clicked should emit', () => {
    const wrapper = mount(RRemoveButton)
    wrapper.trigger('click')

    expect(wrapper.emitted('remove')).toBeTruthy()
  })
})
