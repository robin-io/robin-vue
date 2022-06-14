import { render } from '@testing-library/vue'
import Content from '../Content.vue'

describe('Content component', () => {
  test('should render slot', () => {
    const { queryByText } = render(Content, {
      slots: {
        default: 'Here is a text'
      }
    })

    expect(queryByText('Here is a text')).toBeInTheDocument()
  })

  test('should render styles', () => {
    const { getByTestId } = render(Content, {
      props: {
        as: 'label',
        color: '#000',
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 2,
        textWrap: 'wrap',
        wordBreak: 'normal',
        maxWidth: '100%',
        textAlign: 'center'
      }
    })

    const el = getByTestId('label') as HTMLElement

    expect(el.style.color).toBe('rgb(0, 0, 0)')
    expect(el.style.fontSize).toBeDefined()
    expect(el.style.fontWeight).toBe('600')
    expect(el.style.lineHeight).toBe('0.125rem')
    expect(el.style.wordBreak).toBe('normal')
    expect(el.style.whiteSpace).toBe('wrap')
    expect(el.style.maxWidth).toBe('100%')
    expect(el.style.textAlign).toBe('center')
  })
})
