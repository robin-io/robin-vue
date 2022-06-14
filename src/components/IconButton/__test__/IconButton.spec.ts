import userEvent from '@testing-library/user-event'
import { render, fireEvent } from '@testing-library/vue'
import IconButton from '../IconButton.vue'

describe('IconButton component', () => {
  test('should emit event when button is clicked', async () => {
    const { getByTestId, emitted } = render(IconButton, {
      props: {
        name: 'send',
        emit: 'button-click'
      }
    })

    const button = getByTestId('button')
    await fireEvent.click(button)

    expect(emitted()['button-click']).toHaveProperty('length', 1)
  })

  test('should render element styles emit event when clicked away from button', async () => {
    const { emitted } = render(IconButton, {
      props: {
        toEmit: false,
        toClickAway: true
      }
    })

    await userEvent.click(document.body)

    expect(emitted().clickoutside).toHaveProperty('length', 1)
  })

  test('should render classname when focused/blured', async () => {
    const { getByTestId } = render(IconButton, {
      props: {
        hasFocus: true
      }
    })

    await fireEvent.focus(getByTestId('button'))

    expect(getByTestId('button')).toHaveClass('robin-button', 'fill-focused')

    await fireEvent.blur(getByTestId('button'))

    expect(getByTestId('button')).toHaveClass('robin-button')
  })
})
