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
          translateX: [0, cTo.x - cFrom.x],
          translateY: [0, cTo.y - cFrom.y],
          easing: 'easeInOutQuad',
          duration: 100,
        }).finished
        unitRef.style.transform = transform.translate(cTo.x, cTo.y, 'px').string()
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

  const { selection } = useStoreSnapshot(store)
  const selectedUnitId = selection?.unit?.unit?.id

  const units = Array.from(store.state.game.things.entries())
    .filter((entry): entry is [string, Unit] => entry[1] instanceof Unit)
    .sort(([, a], [, b]) => {
      const pa = iso.projectHex(a.pos)
      const pb = iso.projectHex(b.pos)
      return pa.y - pb.y || pa.x - pb.x
    })

  return (
    <g>
      {units.map(([id, unit]) => {
        const { x, y } = iso.projectHex(unit.pos)
        return (
          <g
            style={{ transform: transform.translate(x, y, 'px').string() }}
            key={id}
            ref={setUnitRef(id)}
          >
            <UnitC unit={unit} selected={unit.id === selectedUnitId} />
          </g>
        )
      })}
    </g>
  )
}
