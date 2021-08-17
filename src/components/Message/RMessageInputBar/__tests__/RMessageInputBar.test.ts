import { mount } from '@vue/test-utils'
import RMessageInputBar from '../RMessageInputBar.vue'

describe('RMessageInputBar', () => {
  it('When InputContainer is focused, check if child input becomes focused.', () => {
    const wrapper = mount(RMessageInputBar, {
      attachTo: document.body
    })
    const inputContainer = wrapper.find('.robin-input-wrapper')
    const inputContainerEl = inputContainer.element as HTMLElement
    const input = inputContainer.find('.robin-input')
    const inputEl = input.element as HTMLElement

    inputContainerEl.focus()
    expect(inputEl).toBe(document.activeElement)
  })

  it('When input is trigger in component, check if text is being entered.', async () => {
    const wrapper = mount(RMessageInputBar, {
      attachTo: document.body
    })
    const input = wrapper.find('.robin-input')
    const inputEl = input.element as HTMLElement

    inputEl.innerText = 'N'
    await input.trigger('input')
    expect(wrapper.vm.$data.text).toBe('N')
  })
})

// let input = wrapper.find('input').element
// expect(input).toBe(document.activeElement);
