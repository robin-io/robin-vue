import { render } from '@testing-library/vue'
import SvgIcon from '../SvgIcon.vue'

describe('SvgIcon component', () => {
  test('should render icon based on name', () => {
    const { getByTestId } = render(SvgIcon, {
      props: {
        name: 'comment'
      }
    })

    expect(getByTestId('icon')).toBeTruthy()
  })

  test('should fail to render due to invalid icon name', () => {
    const { queryByTestId } = render(SvgIcon, {
      props: {
        name: 'invalid-name'
      }
    })

    expect(queryByTestId('icon')).toBeFalsy()
  })
})
