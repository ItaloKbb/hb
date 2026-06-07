import * as anime from 'animejs'
import * as React from 'react'

import Hex from '../../engine/hex'
import Unit from '../../engine/unit'
import UnitC from '../stageView/unit'
import transform from '../utils/transform'
import * as iso from './iso'
import { stageStoreContextTypes } from './stageContext'
import StageStore from './store'

export default class Things extends React.Component<{}, {}> {
  static contextTypes = stageStoreContextTypes

  listeners: Array<(...args: any[]) => void>
  unitRefs: { [idx: string]: SVGGElement } = {}
  store: StageStore

  constructor(props, context) {
    super(props, context)
    this.store = (context as { stageStore: StageStore }).stageStore
    this.listeners = [
      this.store.state.game.listen('unit:move', this.onUnitMove),
    ]
  }

  componentWillUnmount() {
    this.listeners.forEach(unsubscribe => unsubscribe())
  }

  setUnitRef = (id: string) => (ref: SVGGElement | null) => {
    if (ref) {
      this.unitRefs[id] = ref
    } else {
      delete this.unitRefs[id]
    }
  }

  onUnitMove = async ({ unit, path }: { unit: Unit, path: Hex[] }) => {
    const unitRef = this.unitRefs[unit.id]
    const [from, ...steps] = path
    if (!from || !unitRef) { // in case there is no movement
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

  render() {
    const things: JSX.Element[] = []
    this.store.state.game.things.forEach((t, k) => {
      if (t instanceof Unit) {
        const { x, y } = iso.projectHex(t.pos)
        const style = {
          transform: transform.translate(x, y, 'px').string(),
        }

        things.push(
          <g style={style} key={k} ref={this.setUnitRef(k)}>
            <UnitC unit={t} />
          </g>,
        )
      }
    })

    return <g>{things}</g>
  }
}
