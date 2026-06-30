import { css, StyleSheet } from 'aphrodite'

import style from '../utils/style'

const styles = StyleSheet.create({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    opacity: 0.45,
  },
  svg: {
    width: '100%',
    height: '100%',
  },
})

/** Decorative hex grid for menu backgrounds */
export default function HexPattern() {
  const hexR = 28
  const hexH = hexR * Math.sqrt(3)
  const cols = 24
  const rows = 16

  const hexes: JSX.Element[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = row % 2 === 0 ? 0 : hexR * 1.5
      const cx = col * hexR * 3 + offsetX
      const cy = row * hexH * 0.75
      hexes.push(
        <polygon
          key={`${row}-${col}`}
          points={hexPoints(cx, cy, hexR)}
          fill={(row + col) % 5 === 0 ? 'rgba(212,168,75,0.04)' : 'none'}
          stroke={style.goldDark}
          strokeWidth={0.5}
          opacity={0.2 + (row + col) % 3 * 0.1}
        >
          {(row + col) % 7 === 0 && (
            <animate
              attributeName="opacity"
              values={`${0.15 + (row % 3) * 0.05};${0.35 + (row % 3) * 0.05};${0.15 + (row % 3) * 0.05}`}
              dur={`${3 + (row % 4)}s`}
              repeatCount="indefinite"
            />
          )}
        </polygon>,
      )
    }
  }

  return (
    <div className={css(styles.root)} aria-hidden>
      <svg className={css(styles.svg)} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="menu-vignette" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor={style.bg} stopOpacity="0" />
            <stop offset="100%" stopColor={style.bg} stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <g>{hexes}</g>
        <rect width="100%" height="100%" fill="url(#menu-vignette)" />
      </svg>
    </div>
  )
}

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30)
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}
