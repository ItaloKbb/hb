import { css } from 'aphrodite'
import * as React from 'react'

type IProps = React.SVGProps<SVGRectElement> & {
  x: number
  y: number
  width: number
  height: number
  value: number
  backClasses?: any[],
}

export default function Bar(
  { x, y, width, height, backClasses, value, fill, ...props }: IProps,
) {
  const commonStyle = { x, y, height, rx: height / 2 }
  const progress = Math.max(0, Math.min(1, value)) * width

  return (
    <g>
      <rect {...commonStyle} width={width} className={css(backClasses)} />
      {progress > 0 && (
        <rect
          {...commonStyle}
          width={progress}
          fill={fill}
          opacity={0.95}
          {...props}
        />
      )}
      {progress > 0.5 && (
        <rect
          x={x}
          y={y + height * 0.15}
          height={height * 0.35}
          width={progress * 0.85}
          rx={height / 4}
          fill="#fff"
          opacity={0.18}
        />
      )}
    </g>
  )
}
