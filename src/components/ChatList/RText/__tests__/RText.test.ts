import { mount } from '@vue/test-utils'
import RText from '../RText.vue'

describe('RText', () => {
  it('When props is passed check if props exist in component', () => {
    const wrapper = mount(RText, {
      propsData: {
        as: 'p',
        text: 'paragraph',
        color: '#ffffff',
        fontSize: 2,
        fontWeight: 'normal',
        lineHeight: 0,
        textWrap: 'nowrap',
        maxWidth: 'max-content'
      }
    } as any)

    expect(wrapper.vm.$props.as).toBe('p')
    expect(wrapper.vm.$props.text).toBe('paragraph')
    expect(wrapper.vm.$props.color).toBe('#ffffff')
    expect(wrapper.vm.$props.fontSize).toBe(2)
    expect(wrapper.vm.$props.fontWeight).toBe('normal')
    expect(wrapper.vm.$props.lineHeight).toBe(0)
    expect(wrapper.vm.$props.textWrap).toBe('nowrap')
    expect(wrapper.vm.$props.maxWidth).toBe('max-content')
  })

  it('When props (as) is passed check if they are rendered in component', () => {
    const wrapper = mount(RText, {
      propsData: {
        as: 'p',
        text: 'paragraph'
      }
    } as any)
    const p = wrapper.find('p')

    expect(p.exists()).toBe(true)
  })

  it('When props (text) is passed check if they are rendered in component', () => {
    const wrapper = mount(RText, {
      propsData: {
        as: 'p',
        text: 'paragraph'
      }
    } as any)
    const p = wrapper.find('p')

    expect(p.text()).toBe('paragraph')
  })
})
