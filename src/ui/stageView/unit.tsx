import anime from 'animejs'
import { css, StyleSheet } from 'aphrodite'
import { useEffect, useRef } from 'react'

import { UnitAction } from '../../engine/actions/action'
import EUnit from '../../engine/unit'
import Bar from '../components/bar'
import { ICON_SIZE } from '../components/icon'
import UnitGlyph from '../components/unitGlyph'
import style from '../utils/style'
import transform from '../utils/transform'
import { HEX_SIZE, drawHex } from './iso'

const SCALE_FACTOR = HEX_SIZE / ICON_SIZE

const styles = StyleSheet.create({
  unit: {
    transform: transform.scaleY(SCALE_FACTOR).scaleX(SCALE_FACTOR).string(),
    strokeWidth: '2%',
    filter: 'url(#unitGlow)',
  },
  groundShadow: {
    fill: 'rgba(0, 0, 0, 0.45)',
  },
  platform: {
    opacity: 0.28,
  },
  backBarStyle: {
    stroke: style.surfaceLight,
    strokeWidth: 0.25,
    fill: 'rgba(0, 0, 0, 0.6)',
  },
})

interface IProps {
  unit: EUnit,
  selected?: boolean,
}

export default function Unit({ unit, selected }: IProps) {
  const mainRef = useRef<SVGGElement>(null)
  const factionColor = unit.faction.color

  useEffect(() => {
    const { game } = unit

    const onPerformAction = async (payload: unknown) => {
      const action = payload as UnitAction
      if (action.unit.id === unit.id && mainRef.current) {
        return await anime({
          targets: [mainRef.current],
          translateY: '-10',
          direction: 'alternate',
          duration: 350,
          easing: 'easeOutQuad',
        }).finished
      }
    }

    const onTakeDamage = async (payload: unknown) => {
      const damagedUnit = payload as EUnit
      if (damagedUnit.id === unit.id && mainRef.current) {
        await anime({
          targets: [mainRef.current],
          opacity: 0,
          direction: 'alternate',
          loop: 8,
          easing: 'easeInOutQuad',
          duration: 100,
        }).finished
      }
    }

    const unsubscribers = [
      game.listen('action:perform', onPerformAction),
      game.listen('unit:takeDamage', onTakeDamage),
    ]

    return () => unsubscribers.forEach(unsubscribe => unsubscribe())
  }, [unit])

  const barProps = {
    x: -6, height: 1, width: 12, backClasses: [styles.backBarStyle],
  }

  const unitStyle = {
    stroke: factionColor,
    fill: style.textColor,
  }

  return (
    <g>
      <ellipse
        className={css(styles.groundShadow)}
        cx={0}
        cy={10}
        rx={10}
        ry={3.2}
      />
      {selected && (
        <g filter="url(#selectedRing)">
          <polygon
            fill="none"
            stroke={style.gold}
            strokeWidth={0.7}
            opacity={0.85}
            points={drawHex(0.42)}
            transform="translate(0, 8)"
          >
            <animate
              attributeName="opacity"
              values="0.5;0.95;0.5"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </polygon>
        </g>
      )}
      <polygon
        className={css(styles.platform)}
        points={drawHex(0.38)}
        fill={factionColor}
        stroke={factionColor}
        strokeWidth={0.4}
        transform="translate(0, 7)"
      />
      <g ref={mainRef} filter="url(#unitShadow)">
        <g className={css(styles.unit)} style={unitStyle}>
          <UnitGlyph unitType={unit.type} />
        </g>
        <g transform="rotate(-90)">
          <Bar
            {...barProps}
            y={11}
            fill={style.hpColor}
            value={unit.hp / unit.type.hp}
          />
          <Bar
            {...barProps}
            y={12.2}
            fill={style.mpColor}
            value={unit.mp / unit.type.mp}
          />
          {unit.type.mana > 0 && <Bar
            {...barProps}
            y={13.4}
            fill={style.manaColor}
            value={unit.mana / unit.type.mana}
          />}
        </g>
      </g>
    </g>
  )
}
