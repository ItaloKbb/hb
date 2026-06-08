import OpponentAi from '../../ai/opponentAi'
import { UnitAction } from '../../engine/actions/action'
import Game from '../../engine/game'
import Hex from '../../engine/hex'
import { ICell } from '../../engine/map'
import Unit from '../../engine/unit'

export interface IStageState {
  playerFaction: string
  game: Game,

  selection?: {
    cell: ICell,
    unit?: {
      unit: Unit,
      paths: { [idx: string]: Hex },
      action?: {
        action: UnitAction,
        targets: { [idx: string]: Hex },
        area?: { [idx: string]: Hex },
      },
    },
  }

  hover?: {
    cell: ICell,
    unit?: {
      unit: Unit,
      paths: { [idx: string]: Hex },
    },
  }
}

type Listener = () => void

export default class StageStore {
  private listeners = new Set<Listener>()
  private _state: IStageState

  constructor(initialState: Pick<IStageState, 'playerFaction' | 'game'>) {
    this._state = { ...initialState }
  }

  get state(): IStageState {
    return this._state
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  forceUpdate = () => {
    this.listeners.forEach(listener => listener())
  }

  private set(partial: Partial<IStageState>) {
    this._state = { ...this._state, ...partial }
    this.listeners.forEach(listener => listener())
  }

  indexCells(hexes: Hex[]): {[idx: string]: Hex} {
    const index: { [idx: string]: Hex } = {}
    hexes.forEach(h => index[h.toString()] = h)
    return index
  }

  getCellInfo(target: ICell) {
    const { thing } = target

    return {
      cell: target,
      unit: (thing && thing instanceof Unit) ? {
        unit: thing!,
        paths: this.indexCells(thing.moveTargets()),
      } : undefined,
    }
  }

  selectCell = async (cell: ICell) => {
    const { selection, playerFaction } = this.state
    const unit = selection && selection.unit
    const action = unit && unit.action

    let newSelection
    if (action && action.targets[cell.pos.toString()]) {
      await action.action.execute(cell.pos)
    } else if (
      !action && unit && unit.unit.factionId === playerFaction
      && unit.paths[cell.pos.toString()]
    ) {
      await unit.unit.move(cell.pos)
      newSelection = this.getCellInfo(cell)
    } else {
      newSelection = this.getCellInfo(cell)
    }

    this.set({ selection: newSelection, hover: undefined })
  }

  selectAction = (action: UnitAction) => {
    const { selection } = this.state
    selection!.unit!.action = {
      action,
      targets: this.indexCells(action.targets()),
    }

    this.set({ selection, hover: undefined })
  }

  hover = (cell: ICell | null) => {
    if (!cell) {
      this.set({ hover: undefined })
      return
    }

    const { selection } = this.state
    const unit = selection && selection.unit
    const action = unit && unit.action

    if (action && action.action.params.area) {
      action.area = action.targets[cell.pos.toString()]
        ? this.indexCells(cell.pos.range(action.action.params.area))
        : undefined
    }

    this.set({ selection, hover: this.getCellInfo(cell) })
  }

  endTurn = async () => {
    const { game } = this.state
    await game.endTurn()
    this.set({
      selection: undefined,
      hover: undefined,
    })

    const currentFactionId = game.currentFaction.id
    if (currentFactionId !== this.state.playerFaction) {
      const opponent = new OpponentAi(this)
      await opponent.performTurn()
    }
    this.forceUpdate()
  }
}
