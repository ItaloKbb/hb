import anime from 'animejs'
import { useEffect, useRef } from 'react'

import Hex from '../../engine/hex'
import Unit from '../../engine/unit'
import transform from '../utils/transform'
import { useStoreSnapshot } from '../hooks/useStoreSnapshot'
import * as iso from './iso'
import { useStageStore } from './stageContext'
import UnitC from './unit'

export default function Things() {
  const store = useStageStore()
  useStoreSnapshot(store)

  const unitRefs = useRef<{ [idx: string]: SVGGElement }>({})

  useEffect(() => {
    const onUnitMove = async (payload: unknown) => {
      const { unit, path } = payload as { unit: Unit, path: Hex[] }
      const unitRef = unitRefs.current[unit.id]
      const [from, ...steps] = path
      if (!from || !unitRef) {
        return
      }

      let cFrom = iso.projectHex(from)
      for (const p of steps) {
        const cTo = iso.projectHex(p)
        await anime({
          targets: [unitRef],
          translateX: [cFrom.x, cTo.x],
          translateY: [cFrom.y, cTo.y],
          easing: 'easeInOutQuad',
          duration: 100,
        }).finished
        cFrom = cTo
      }
    }

    return store.state.game.listen('unit:move', onUnitMove)
  }, [store])

  const setUnitRef = (id: string) => (ref: SVGGElement | null) => {
    if (ref) {
      unitRefs.current[id] = ref
    } else {
      delete unitRefs.current[id]
    }
  }

  const things: JSX.Element[] = []
  store.state.game.things.forEach((t, k) => {
    if (t instanceof Unit) {
      const { x, y } = iso.projectHex(t.pos)
      const style = {
        transform: transform.translate(x, y, 'px').string(),
      }

      things.push(
        <g style={style} key={k} ref={setUnitRef(k)}>
          <UnitC unit={t} />
        </g>,
      )
    }
  })

  return <g>{things}</g>
}
