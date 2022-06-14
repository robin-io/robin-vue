import { render, fireEvent } from '@testing-library/vue'
import Camera from '../Camera.vue'
import { vi } from 'vitest'
import { __setManuelGlobals } from '../__mocks__/Camera'

vi.mock('../Camera')

describe('Camera component', () => {
  beforeEach(() => {
    __setManuelGlobals()
  })

  test('should take a photo', async () => {
    const { getByTestId, emitted } = render(Camera, {
      props: {
        cameraOpened: true
      }
    })

    const cameraButton = getByTestId('camera-button') as HTMLElement
    await fireEvent.click(cameraButton)

    expect(emitted()['captured-image']).toHaveProperty('length', 1)
  })

  test('should close camera', async () => {
    const { getByTestId, emitted } = render(Camera, {
      props: {
        cameraOpened: true
      }
    })

    const closeButton = getByTestId('close-camera') as HTMLElement
    await fireEvent.click(closeButton)

    expect(emitted().close).toHaveProperty('length', 1)
  })
})
