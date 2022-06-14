/* eslint-disable */ 
import { render, fireEvent } from '@testing-library/vue'
import ForwardMessage from '../ForwardMessage.vue'

describe('ForwardMessage component', () => {
  test('Should render normal conversation', () => {
    const {getByTestId} = render(ForwardMessage)

    const conversation = getByTestId('conversation-6219fffd8ea69f0c83788f0a')

    expect(conversation).toHaveTextContent('Elvis')
  })

  test('should render group conversation', () => {
    const {getByTestId} = render(ForwardMessage)

    const conversation = getByTestId('conversation-626130780977c64eced9b7f8')

    expect(conversation).toHaveTextContent('New group')
  })
})
