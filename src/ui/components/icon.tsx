import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'

import icons from '../assets/icons'
import style from '../utils/style'
import transform from '../utils/transform'

export const ICON_SIZE = 512
const TRANSLATE_TO_CENTER = transform.translate(-ICON_SIZE / 2, -ICON_SIZE / 2)
  .string()
// tslint:disable-next-line:max-line-length
export const ICON_BBOX = `${-ICON_SIZE / 2} ${-ICON_SIZE / 2} ${ICON_SIZE} ${ICON_SIZE}`

const styles = StyleSheet.create({
  wrapper: {
    padding: 6,
    width: 52,
    height: 52,
    fill: style.textColor,
    stroke: style.goldDark,
    strokeWidth: 1.2,
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))',
    transition: 'transform 0.15s ease, filter 0.15s ease',
  },
  wrapperHover: {
    transform: 'scale(1.06)',
  },
})

interface IProps {
  icon: keyof typeof icons
  wrapped?: boolean
  classes?: any
}

export default class Icon extends React.PureComponent<IProps, {}> {
  renderIcon({ classes, icon, wrapped, ...props }: IProps) {
    const [background, ...elements] = icons[icon]
    const className = css(classes)

    return (
      <g {...props} className={css(className)}>
        <g transform={TRANSLATE_TO_CENTER}>
          <path d={background} fill="transparent" stroke="transparent" />
          <g>
            <path d={elements.join('')} />
          </g>
        </g>
      </g>
    )
  }

  renderWrappedIcon({ classes, ...props }: IProps) {
    const className = css(styles.wrapper, classes)

    return (
      <svg viewBox={ICON_BBOX} className={className}>
        {this.renderIcon(props)}
      </svg>
    )
  }

  render() {
    const { wrapped, ...props } = this.props

    return wrapped
      ? this.renderWrappedIcon(props)
      : this.renderIcon(props)
  }
}
