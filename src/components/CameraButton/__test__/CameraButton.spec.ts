import { render, fireEvent } from '@testing-library/vue'
import CameraButton from '../CameraButton.vue'

describe('Camera component', () => {
  test('should emit event when button is clicked', async () => {
    const { getByTestId, emitted } = render(CameraButton, {
      props: {
        cameraOpened: true
      }
    })

    const cameraButton = getByTestId('camera-button') as HTMLElement
    await fireEvent.click(cameraButton)

    expect(emitted().clicked).toHaveProperty('length', 1)
  })
})
