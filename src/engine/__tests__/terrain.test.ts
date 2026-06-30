import { describe, expect, it } from 'vitest'

import createLevel from '../../content/createLevel'
import { cellsInMap, generateLevel, terrainBudget } from '../../content/levels'
import Jump from '../actions/jump'
import Faction from '../faction'
import Game from '../game'
import Hex from '../hex'
import HexMap, { Terrain } from '../map'
import { getMoveCost, isJumpObstacle } from '../terrain'
import Unit from '../unit'
import { horseman, warrior } from '../units'

const DEPLOY_SAFE_RADIUS = 2

function createMapWithTerrain(
  terrainByPos: Record<string, Terrain>,
  size = 3,
): HexMap {
  const cells = Object.entries(terrainByPos).map(([key, terrain]) => {
    const [q, r] = key.split(',').map(Number)
    return { pos: new Hex(q!, r!), terrain }
  })
  return new HexMap(size, cells)
}

function addWarriorOnMap(
  game: Game,
  factionId: string,
  pos: Hex,
): Unit {
  game.addUnit({ factionId, pos, type: warrior })
  return game.map.cellAt(pos).thing as Unit
}

describe('terrain', () => {
  describe('terrainBudget', () => {
    it('includes pits from level 0', () => {
      const budget = terrainBudget(0, 5)
      expect(budget.get(Terrain.Pit)).toBeGreaterThan(0)
      expect(budget.has(Terrain.Water)).toBe(false)
    })

    it('adds water from level 2', () => {
      expect(terrainBudget(1, 5).has(Terrain.Water)).toBe(false)
      expect(terrainBudget(2, 5).get(Terrain.Water)).toBeGreaterThan(0)
    })

    it('adds forest from level 4', () => {
      expect(terrainBudget(3, 6).has(Terrain.Forest)).toBe(false)
      expect(terrainBudget(4, 6).get(Terrain.Forest)).toBeGreaterThan(0)
    })

    it('adds walls from level 6', () => {
      expect(terrainBudget(5, 7).has(Terrain.Wall)).toBe(false)
      expect(terrainBudget(6, 7).get(Terrain.Wall)).toBeGreaterThan(0)
    })

    it('keeps special terrain under the map cap', () => {
      const mapSize = 10
      const total = cellsInMap(mapSize)
      const budget = terrainBudget(20, mapSize)
      let sum = 0
      budget.forEach(count => { sum += count })
      expect(sum).toBeLessThanOrEqual(Math.floor(total * 0.35) + budget.size)
    })
  })

  describe('movement costs', () => {
    it('charges extra MP to cross water', async () => {
      const faction = new Faction('Greens', '#00A000')
      const map = createMapWithTerrain({
        '0,0': Terrain.Ground,
        '1,0': Terrain.Water,
      })
      const game = new Game({ factions: [faction], map })
      const unit = addWarriorOnMap(game, faction.id, new Hex(0, 0))
      unit.mp = 3

      await unit.move(new Hex(1, 0))

      expect(unit.pos).toEqual(new Hex(1, 0))
      expect(unit.mp).toBe(1)
      expect(getMoveCost(Terrain.Water)).toBe(2)
    })

    it('limits reachable cells when forest costs more MP', () => {
      const faction = new Faction('Greens', '#00A000')
      const map = createMapWithTerrain({
        '0,0': Terrain.Ground,
        '1,0': Terrain.Forest,
        '2,0': Terrain.Ground,
      })
      const game = new Game({ factions: [faction], map })
      const unit = addWarriorOnMap(game, faction.id, new Hex(0, 0))
      unit.mp = 2

      const targets = unit.moveTargets().map(h => h.toString())
      expect(targets).toContain('1,0')
      expect(targets).not.toContain('2,0')
    })
  })

  describe('forest cover', () => {
    it('grants +1 resistance while standing on forest', () => {
      const faction = new Faction('Greens', '#00A000')
      const map = createMapWithTerrain({ '0,0': Terrain.Forest })
      const game = new Game({ factions: [faction], map })
      const unit = addWarriorOnMap(game, faction.id, new Hex(0, 0))

      expect(unit.resistance).toBe(1)
    })
  })

  describe('jump', () => {
    it('only allows jumping over pits and walls', () => {
      const faction = new Faction('Greens', '#00A000')
      const map = createMapWithTerrain({
        '0,0': Terrain.Ground,
        '1,0': Terrain.Pit,
        '2,0': Terrain.Ground,
        '0,1': Terrain.Ground,
        '1,1': Terrain.Ground,
        '2,1': Terrain.Ground,
      })
      const game = new Game({ factions: [faction], map })
      game.addUnit({
        factionId: faction.id,
        pos: new Hex(0, 0),
        type: horseman,
      })
      const unit = game.map.cellAt(new Hex(0, 0)).thing as Unit

      const jump = unit.getAction(Jump)
      const targets = jump.targets().map((h: Hex) => h.toString())

      expect(targets).toContain('2,0')
      expect(targets).not.toContain('2,1')
      expect(isJumpObstacle(Terrain.Pit)).toBe(true)
      expect(isJumpObstacle(Terrain.Wall)).toBe(true)
      expect(isJumpObstacle(Terrain.Water)).toBe(false)
    })
  })

  describe('createLevel', () => {
    it('generates multiple terrain types on higher levels', () => {
      const def = generateLevel(8)
      const game = createLevel(def, [warrior])
      const terrains = new Set(game.map.cells.map(c => c.terrain))

      expect(terrains.has(Terrain.Pit)).toBe(true)
      expect(terrains.has(Terrain.Water)).toBe(true)
      expect(terrains.has(Terrain.Forest)).toBe(true)
      expect(terrains.has(Terrain.Wall)).toBe(true)
    })

    it('keeps deploy origins on ground', () => {
      const def = generateLevel(10)
      const game = createLevel(def, [warrior, warrior])

      for (const origin of def.partyDeployOrigins) {
        for (const hex of origin.range(DEPLOY_SAFE_RADIUS)) {
          if (!game.map.isIn(hex)) {
            continue
          }
          expect(game.map.cellAt(hex).terrain).toBe(Terrain.Ground)
        }
      }
    })
  })
})
