import { render, fireEvent, within } from '@testing-library/vue'
import AudioPlayer from '../AudioPlayer.vue'
import { audioMessage } from './AudioPlayer'

describe('AudioPlayer component', () => {
  test('should check if its playing or not', async () => {
    const { getByRole } = render(AudioPlayer, {
      props: {
        message: audioMessage,
        index: 0
      }
    })
    const button = getByRole('button')

    await fireEvent.click(button)
    await within(button).getByText(/pause/)
    await fireEvent.click(button)
    await within(button).getByText(/play_arrow/)
  })

  test('should have audio', () => {
    const { getByTestId } = render(AudioPlayer, {
      props: {
        message: audioMessage,
        index: 0
      }
    })

    const audio = getByTestId('audio-0') as HTMLAudioElement
    expect(audio.src).toBe('https://s3.us-east-2.amazonaws.com/robinapp.io/TP50I7LXnLzyw4kEcRJyXo8M2wl4Qj.mp3')
  })

  test('should toggle audio', async () => {
    const { getByTestId, getByRole } = render(AudioPlayer, {
      props: {
        message: audioMessage,
        index: 0
      }
    })
    const audio = getByTestId('audio-0') as HTMLAudioElement
    const button = getByRole('button')

    await fireEvent.click(button)
    expect(audio.muted).toBe(false)
    await fireEvent.click(button)
    expect(audio.muted).toBe(true)
  })
})
