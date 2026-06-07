import { beforeEach, describe, expect, it, vi } from 'vitest'

import Faction from '../faction'
import Game from '../game'
import Hex from '../hex'
import HexMap from '../map'
import Unit from '../unit'
import { warrior } from '../units'

interface TestContext {
  game: Game
  factionA: Faction
  factionB: Faction
  map: HexMap
}

function createGame(): TestContext {
  const factionA = new Faction('Greens', '#00A000')
  const factionB = new Faction('Reds', '#A00000')
  const map = new HexMap(2, [])
  const game = new Game({ factions: [factionA, factionB], map })

  return { game, factionA, factionB, map }
}

function addWarrior(
  game: Game,
  factionId: string,
  pos: Hex,
): Unit {
  game.addUnit({ factionId, pos, type: warrior })
  return game.map.cellAt(pos).thing as Unit
}

describe('Game', () => {
  let ctx: TestContext

  beforeEach(() => {
    ctx = createGame()
  })

  describe('constructor', () => {
    it('registers factions by id', () => {
      expect(ctx.game.factions.size).toBe(2)
      expect(ctx.game.factions.get(ctx.factionA.id)).toBe(ctx.factionA)
      expect(ctx.game.factions.get(ctx.factionB.id)).toBe(ctx.factionB)
    })

    it('starts with no things on an empty map', () => {
      expect(ctx.game.things.size).toBe(0)
    })

    it('indexes things already placed on map cells', () => {
      const unit = new Unit(ctx.game, {
        factionId: ctx.factionA.id,
        pos: new Hex(0, 0),
        type: warrior,
      })
      ctx.map.cellAt(new Hex(0, 0)).thing = unit

      const game = new Game({
        factions: [ctx.factionA, ctx.factionB],
        map: ctx.map,
      })

      expect(game.things.has(unit.id)).toBe(true)
    })
  })

  describe('currentFaction', () => {
    it('returns the first faction at the start of the game', () => {
      expect(ctx.game.currentFaction).toBe(ctx.factionA)
    })
  })

  describe('addUnit', () => {
    it('places the unit on the map and in things', () => {
      const unit = addWarrior(ctx.game, ctx.factionA.id, new Hex(0, 0))

      expect(ctx.game.things.get(unit.id)).toBe(unit)
      expect(ctx.game.map.cellAt(new Hex(0, 0)).thing).toBe(unit)
    })
  })

  describe('removeThing', () => {
    it('removes the unit from things and the map cell', () => {
      const unit = addWarrior(ctx.game, ctx.factionA.id, new Hex(0, 0))

      ctx.game.removeThing(unit)

      expect(ctx.game.things.has(unit.id)).toBe(false)
      expect(ctx.game.map.cellAt(new Hex(0, 0)).thing).toBeUndefined()
    })
  })

  describe('moveThing', () => {
    it('relocates the unit to a new cell', () => {
      const unit = addWarrior(ctx.game, ctx.factionA.id, new Hex(0, 0))
      const destination = new Hex(1, 0)

      ctx.game.moveThing(unit, destination)

      expect(ctx.game.map.cellAt(new Hex(0, 0)).thing).toBeUndefined()
      expect(ctx.game.map.cellAt(destination).thing).toBe(unit)
    })
  })

  describe('factionUnits', () => {
    it('groups units by faction id', () => {
      addWarrior(ctx.game, ctx.factionA.id, new Hex(0, 0))
      addWarrior(ctx.game, ctx.factionA.id, new Hex(1, 0))
      addWarrior(ctx.game, ctx.factionB.id, new Hex(-1, 0))

      const grouped = ctx.game.factionUnits

      expect(grouped[ctx.factionA.id]).toHaveLength(2)
      expect(grouped[ctx.factionB.id]).toHaveLength(1)
    })
  })

  describe('checkGameOver', () => {
    it('returns undefined while multiple factions have units', () => {
      addWarrior(ctx.game, ctx.factionA.id, new Hex(0, 0))
      addWarrior(ctx.game, ctx.factionB.id, new Hex(1, 0))

      expect(ctx.game.checkGameOver()).toBeUndefined()
    })

    it('returns the winning faction when only one faction has units', () => {
      addWarrior(ctx.game, ctx.factionA.id, new Hex(0, 0))

      expect(ctx.game.checkGameOver()).toBe(ctx.factionA.id)
    })

    it('returns undefined when every faction is eliminated', () => {
      expect(ctx.game.checkGameOver()).toBeUndefined()
    })
  })

  describe('endTurn', () => {
    it('advances to the next faction', async () => {
      await ctx.game.endTurn()

      expect(ctx.game.currentFaction).toBe(ctx.factionB)
    })

    it('increments epoch after every faction has played', async () => {
      await ctx.game.endTurn()
      await ctx.game.endTurn()

      expect(ctx.game.epoch).toBe(1)
      expect(ctx.game.currentFaction).toBe(ctx.factionA)
    })

    it('resets units of the new current faction via tickTurn', async () => {
      const unit = addWarrior(ctx.game, ctx.factionB.id, new Hex(0, 0))
      unit.actionPerformed = true
      unit.mp = 0

      await ctx.game.endTurn()

      expect(unit.actionPerformed).toBe(false)
      expect(unit.mp).toBe(warrior.mp)
    })
  })

  describe('listen / emit', () => {
    it('notifies subscribers when an event is emitted', async () => {
      const handler = vi.fn().mockResolvedValue(undefined)
      ctx.game.listen('test:event', handler)

      await ctx.game.emit('test:event', { value: 42 })

      expect(handler).toHaveBeenCalledWith({ value: 42 })
    })

    it('stops notifying after unsubscribe', async () => {
      const handler = vi.fn().mockResolvedValue(undefined)
      const unsubscribe = ctx.game.listen('test:event', handler)

      unsubscribe()
      await ctx.game.emit('test:event', { value: 42 })

      expect(handler).not.toHaveBeenCalled()
    })

    it('awaits all async listeners', async () => {
      const order: string[] = []
      ctx.game.listen('test:event', async () => {
        order.push('first')
      })
      ctx.game.listen('test:event', async () => {
        order.push('second')
      })

      await ctx.game.emit('test:event', null)

      expect(order).toEqual(['first', 'second'])
    })
  })
})
