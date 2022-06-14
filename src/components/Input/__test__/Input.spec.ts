import { render, fireEvent } from '@testing-library/vue'
import Input from '../Input.vue'

describe('Input component', () => {
  test('should render props', () => {
    const { getByTestId } = render(Input, {
      props: {
        placeholder: 'Enter your text here',
        borderRadius: 5,
        height: 42,
        width: 'fullWidth'
      }
    })

    const input = getByTestId('input') as HTMLInputElement

    expect(input.placeholder).toBe('Enter your text here')
    expect(input.style.borderRadius).toBe('5px')
    expect(input.style.minHeight).toBe('42px')
    expect(input.style.width).toBe('100%')
  })

  test('should emit event on input', async () => {
    const { getByTestId, emitted } = render(Input)

    const input = getByTestId('input') as HTMLInputElement

    await fireEvent.update(input, 'Just typing')

    expect(input.value).toBe('Just typing')
    expect(emitted()['user-typing']).toHaveProperty('length', 1)
  })
})
