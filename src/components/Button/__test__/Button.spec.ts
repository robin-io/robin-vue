import { render, fireEvent } from '@testing-library/vue'
import Button from '../Button.vue'

describe('Button component', () => {
  test('Button was clicked', async () => {
    const { getByTestId, emitted } = render(Button, {
      props: {
        emit: 'clicked'
      }
    })

    const button = getByTestId('button') as HTMLElement
    await fireEvent.click(button)

    expect(emitted().clicked).toHaveProperty('length', 1)
  })

  test('should render all properties', async () => {
    const { getByTestId } = render(Button, {
      props: {
        color: '#000',
        fontSize: 15,
        fontWeight: 'bold'
      }
    })

    const button = getByTestId('button') as HTMLElement

    expect(button.style.color).toBe('rgb(0, 0, 0)')
    expect(button.style.fontSize).toBe('0.9375rem')
    expect(button.style.fontWeight).toBe('bold')
  })
})
