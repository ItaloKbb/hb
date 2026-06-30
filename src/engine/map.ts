import assert from './assert'
import Hex, { CENTER } from './hex'
import IThing from './thing'

export enum Terrain {
  Ground,
  Water,
  Wall,
  Forest,
  Pit,
}

export interface ICell {
  pos: Hex
  thing?: IThing
  terrain: Terrain
}

interface IFloodResult {
  paths: Array<[ICell, number, Hex[]]>
  found?: [ICell, number, Hex[]]
}

export interface IMap {
  cells: ICell[]

  isIn(hex: Hex): boolean

  cellAt(hex: Hex): ICell

  thingsInRange(hex: Hex, radius: number, innerRadius?: number): IThing[]

  /**
   * returns the flooded paths
   * @param from the starting position
   * @param stop determines when to stop the flooding
   * @param predicate determines if a cell can be flooded
   * @param costOf movement cost to enter a cell (defaults to 1)
   */
  flood(
    from: Hex,
    stop: (cell: ICell, cost: number, path: Hex[]) => boolean,
    predicate: (cell: ICell) => boolean,
    costOf?: (cell: ICell) => number,
  ): IFloodResult
}

/**
 * An hexagonal map of the specified radius and the central cell at [0, 0]
 */
export default class HexMap implements IMap {
  size: number

  // cells indexed by string 'q,s'
  private _cells: { [idx: string]: ICell } = {}

  constructor(size: number, cells: ICell[]) {
    this.size = size

    cells.forEach(c => {
      const idx = c.pos.toString()
      assert(this.isIn(c.pos), 'Cell out of map boundaries')
      assert(!this._cells[idx], 'Cell already assigned')
      this._cells[idx] = c
    })
  }

  isIn = (hex: Hex) => {
    return hex.distance(CENTER) <= this.size
  }

  cellAt = (hex: Hex): ICell => {
    assert(this.isIn(hex), 'Cell out of map boundaries')
    const idx = hex.toString()
    const cell = this._cells[idx]

    if (cell) {
      return cell
    }

    const defaultCell = { pos: hex, terrain: Terrain.Ground }
    this._cells[idx] = defaultCell
    return defaultCell
  }

  get cells() {
    return CENTER.range(this.size).map(this.cellAt).sort((a, b) => {
      if (a.pos.q === b.pos.q) {
        return a.pos.r > b.pos.r ? 1 : -1
      }
      return a.pos.q > b.pos.q ? 1 : -1
    })
  }

  flood(
    from: Hex,
    stop: (cell: ICell, cost: number, path: Hex[]) => boolean,
    predicate: (cell: ICell) => boolean,
    costOf: (cell: ICell) => number = () => 1,
  ): IFloodResult {
    const bag = new Map<string, [ICell, number, Hex[]]>()
    const bestCost = new Map<string, number>()
    const toProcess: Array<[Hex, number, Hex[]]> = [[from, 0, []]]
    let currentIndex = 0

    while (currentIndex < toProcess.length) {
      const [curHex, cost, path] = toProcess[currentIndex++]
      const key = curHex.toString()
      const known = bestCost.get(key)
      if (known !== undefined && known < cost) {
        continue
      }

      const curCell = this.cellAt(curHex)
      if (stop(curCell, cost, path)) {
        return {
          paths: Array.from(bag.values()),
          found: [curCell, cost, path],
        }
      }

      bestCost.set(key, cost)
      const existing = bag.get(key)
      if (!existing || existing[1] > cost) {
        bag.set(key, [curCell, cost, path])
      }

      for (const neighborHex of curHex.neighbors.filter(this.isIn)) {
        const neighbor = this.cellAt(neighborHex)
        if (!predicate(neighbor)) {
          continue
        }

        const newCost = cost + costOf(neighbor)
        const nKey = neighborHex.toString()
        const nKnown = bestCost.get(nKey)
        if (nKnown !== undefined && nKnown <= newCost) {
          continue
        }

        toProcess.push([neighborHex, newCost, [...path, neighborHex]])
      }
    }

    return { paths: Array.from(bag.values()) }
  }

  thingsInRange(hex: Hex, radius: number, innerRadius?: number): IThing[] {
    return hex.range(radius, innerRadius)
      .filter(this.isIn)
      .map(this.cellAt)
      .filter(c => c.thing)
      .map(c => c.thing!)
  }
}
