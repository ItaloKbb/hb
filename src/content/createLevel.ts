import assert from '../engine/assert'
import Faction from '../engine/faction'
import Game from '../engine/game'
import Hex from '../engine/hex'
import HexMap, { ICell, IMap } from '../engine/map'
import {
  getTerrainConfig,
  isDeployableTerrain,
} from '../engine/terrain'
import { IUnitType } from '../engine/unit'
import { ILevelDefinition } from './levels'

const DEFAULT_CLUSTERING = 0.75
const DEPLOY_SAFE_RADIUS = 2
const REC_LIMIT = 100000

function tryUntil<T>(
  f: () => T, predicate: (item: T) => boolean, limit = REC_LIMIT,
): T | undefined {
  while (limit > 0) {
    assert(limit > 0, 'recursion exceeded. Revisit your parameters')
    const item = f()
    if (predicate(item)) {
      return item
    }

    limit--
  }

  return undefined
}

function getRandomCell(map: IMap): ICell {
  const { cells } = map
  return cells[Math.floor(Math.random() * cells.length)]!
}

function getRandomNeighbor(map: IMap, hex: Hex): Hex {
  const neighbors = hex.neighbors.filter(map.isIn)
  return neighbors[Math.floor(Math.random() * neighbors.length)]!
}

function canPlaceTerrain(cell: ICell, deployOrigins: Hex[]): boolean {
  return isDeployableTerrain(cell.terrain)
    && deployOrigins.every(origin => cell.pos.distance(origin) > DEPLOY_SAFE_RADIUS)
}

export default function createLevel(
  def: ILevelDefinition, party: IUnitType[],
): Game {
  const map = new HexMap(def.map.size, [])

  // add terrains
  def.map.terrains.forEach((amount, terrain) => {
    const clustering = getTerrainConfig(terrain).clustering || DEFAULT_CLUSTERING
    let curCell = tryUntil(
      () => getRandomCell(map),
      c => canPlaceTerrain(c, def.partyDeployOrigins),
      1000,
    )
    if (!curCell) {
      return
    }

    while (amount > 0) {
      let tempPos
      const cellFinder = Math.random() > clustering
        ? () => getRandomCell(map)
        : () => {
          tempPos = getRandomNeighbor(map, curCell!.pos)
          return map.cellAt(tempPos)
        }
      const nextCell = tryUntil(
        cellFinder,
        c => canPlaceTerrain(c, def.partyDeployOrigins),
        1000,
      )
      if (!nextCell) {
        break
      }

      curCell = nextCell
      curCell.terrain = terrain
      amount--
    }
  })

  const fa = new Faction('Greens', '#00A000')
  const fb = new Faction('Reds', '#A00000')

  const game = new Game({ factions: [fa, fb], map })

  // add friendly units
  party.forEach(unit => {
    let tempPos = def.partyDeployOrigins[0]!
    const cell = tryUntil(
      () => {
        tempPos = getRandomNeighbor(map, tempPos)
        return map.cellAt(tempPos)
      },
      c => isDeployableTerrain(c.terrain) && !c.thing,
      1000,
    )
    assert(cell, 'could not deploy party unit')

    game.addUnit({ factionId: fa.id, pos: tempPos, type: unit })
  })

  // add enemy units
  def.opponents.forEach((amount, unit) => {
    while (amount > 0) {
      let tempPos = def.partyDeployOrigins[1]!
      const cell = tryUntil(
        () => {
          tempPos = getRandomNeighbor(map, tempPos)
          return map.cellAt(tempPos)
        },
        c => isDeployableTerrain(c.terrain) && !c.thing,
        1000,
      )
      assert(cell, 'could not deploy enemy unit')

      game.addUnit({ factionId: fb.id, pos: tempPos, type: unit })
      amount--
    }
  })

  return game
}
