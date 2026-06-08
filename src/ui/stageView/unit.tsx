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
import { HEX_SIZE } from './iso'

const SCALE_FACTOR = HEX_SIZE / ICON_SIZE

const styles = StyleSheet.create({
  unit: {
    transform: transform.scaleY(SCALE_FACTOR).scaleX(SCALE_FACTOR).string(),
    strokeWidth: '2%',
  },
  backBarStyle: {
    stroke: 'black',
    strokeWidth: '.5px',
    fill: 'black',
  },
})

interface IProps {
  unit: EUnit,
}

export default function Unit({ unit }: IProps) {
  const mainRef = useRef<SVGGElement>(null)

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
    x: -5, height: 1, width: 10, backClasses: [styles.backBarStyle],
  }

  const unitStyle = {
    stroke: unit.faction.color,
  }

  return (
    <g>
      <g ref={mainRef}>
        <g className={css(styles.unit)} style={unitStyle}>
          <UnitGlyph unitType={unit.type} />
        </g>
        <g transform="rotate(-90)">
          <Bar
            {...barProps}
            y={10}
            fill={style.hpColor}
            value={unit.hp / unit.type.hp}
          />
          <Bar
            {...barProps}
            y={11}
            fill={style.mpColor}
            value={unit.mp / unit.type.mp}
          />
          {unit.type.mana > 0 && <Bar
            {...barProps}
            y={12}
            fill={style.manaColor}
            value={unit.mana / unit.type.mana}
          />}
        </g>
      </g>
    </g>
  )
}
