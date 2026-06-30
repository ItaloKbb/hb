import { describe, expect, it } from 'vitest'

import {
  calculateReward,
  enemyBudget,
  generateLevel,
} from '../levels'

describe('level economy', () => {
  describe('calculateReward', () => {
    it('pays enough to buy a basic unit after the first victory', () => {
      expect(calculateReward(0)).toBeGreaterThanOrEqual(8)
    })

    it('keeps a minimum payout in deep runs', () => {
      expect(calculateReward(25)).toBe(10)
      expect(calculateReward(50)).toBeGreaterThanOrEqual(10)
    })

    it('scales up through the mid game', () => {
      expect(calculateReward(5)).toBeGreaterThan(calculateReward(0))
      expect(calculateReward(10)).toBeGreaterThan(calculateReward(5))
    })
  })

  describe('enemyBudget', () => {
    it('grows more slowly than the old +10 per level curve', () => {
      expect(enemyBudget(5)).toBe(55)
      expect(enemyBudget(10)).toBe(100)
    })
  })

  describe('generateLevel', () => {
    it('attaches the calculated reward to the level definition', () => {
      const level = generateLevel(3)
      expect(level.reward).toBe(calculateReward(3))
    })
  })
})
