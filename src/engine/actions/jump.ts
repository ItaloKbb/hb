import Hex from '../hex'
import { isJumpObstacle } from '../terrain'
import { UnitAction } from './action'

function jumpIntermediates(from: Hex, to: Hex): Hex[] {
  return from.neighbors.filter(n => n.isNeighbor(to))
}

export default class Jump extends UnitAction {
  name = 'Jump'
  description = 'Jump over a pit or wall to a cell beyond it'

  params = {}

  performAction(target: Hex) {
    return {
      targets: [{
        unitId: this.unit.id, newPosition: target,
      }],
    }
  }

  targets() {
    const { pos } = this.unit
    return pos.range(2, 2)
      .filter(this.game.map.isIn)
      .filter(dest => {
        if (!this.unit.canWalkOn(this.game.map.cellAt(dest))) {
          return false
        }

        return jumpIntermediates(pos, dest).some(hex => {
          return isJumpObstacle(this.game.map.cellAt(hex).terrain)
        })
      })
  }
}
