import { css, StyleSheet } from 'aphrodite'
import { PureComponent } from 'react'

import style from '../utils/style'
import * as iso from './iso'

export type OverlayState = 'selected' | 'hover' | 'target'
  | 'moveTarget' | 'areaOfEffect'

interface IProps {
  state: OverlayState[]
}

const styles = StyleSheet.create({
  base: {
    pointerEvents: 'none',
  },
  fill: {
    strokeWidth: 0,
  },
  stroke: {
    fill: 'none',
    strokeWidth: 1.4,
  },
  selectedFill: {
    fill: style.overlay.selected,
    opacity: 0.75,
  },
  selectedStroke: {
    stroke: style.overlay.selectedStroke,
    strokeWidth: 1.8,
  },
  hoverFill: {
    fill: style.overlay.hover,
  },
  hoverStroke: {
    stroke: style.overlay.hoverStroke,
    strokeWidth: 1.2,
  },
  targetFill: {
    fill: style.overlay.target,
  },
  targetStroke: {
    stroke: style.overlay.targetStroke,
    strokeWidth: 1.4,
  },
  moveFill: {
    fill: style.overlay.moveTarget,
  },
  moveStroke: {
    stroke: style.overlay.moveStroke,
    strokeWidth: 1,
    strokeDasharray: '3 2',
  },
  areaFill: {
    fill: style.overlay.areaOfEffect,
  },
  areaStroke: {
    stroke: style.overlay.targetStroke,
    strokeWidth: 1.6,
  },
})

function pickStyles(states: OverlayState[]) {
  const fill: object[] = [styles.base, styles.fill]
  const stroke: object[] = [styles.base, styles.stroke]

  if (states.includes('areaOfEffect')) {
    fill.push(styles.areaFill)
    stroke.push(styles.areaStroke)
  } else if (states.includes('target')) {
    fill.push(styles.targetFill)
    stroke.push(styles.targetStroke)
  } else if (states.includes('selected')) {
    fill.push(styles.selectedFill)
    stroke.push(styles.selectedStroke)
  } else if (states.includes('hover')) {
    fill.push(styles.hoverFill)
    stroke.push(styles.hoverStroke)
  } else if (states.includes('moveTarget')) {
    fill.push(styles.moveFill)
    stroke.push(styles.moveStroke)
  }

  return { fill, stroke }
}

export default class TileOverlay extends PureComponent<IProps> {
  render() {
    const { state, ...props } = this.props
    const { fill, stroke } = pickStyles(state)
    const points = iso.drawHex(0.93)

    const pulse = state.includes('selected')
      && !state.includes('areaOfEffect')
      && !state.includes('target')

    return (
      <g {...props}>
        <polygon points={points} className={css(...fill)} />
        <polygon
          points={points}
          className={`${css(...stroke)}${pulse ? ' overlay-selected-pulse' : ''}`}
        />
      </g>
    )
  }
}
