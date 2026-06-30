import { css, StyleSheet } from 'aphrodite'

import style from '../utils/style'

const styles = StyleSheet.create({
  root: {
    marginBottom: 6,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 14,
    marginBottom: 2,
    color: style.textMuted,
  },
  value: {
    color: style.textColor,
  },
  track: {
    height: 6,
    background: style.bg,
    borderRadius: 3,
    overflow: 'hidden',
    border: `1px solid ${style.surfaceLight}`,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.25s ease',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
  },
})

interface IProps {
  label: string
  value: number
  max: number
  color: string
}

export default function StatBar({ label, value, max, color }: IProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.header)}>
        <span>{label}</span>
        <span className={css(styles.value)}>{value}/{max}</span>
      </div>
      <div className={css(styles.track)}>
        <div
          className={css(styles.fill)}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
