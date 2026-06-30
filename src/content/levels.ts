import Hex from '../engine/hex'
import { Terrain } from '../engine/map'
import { IUnitType } from '../engine/unit'
import races from '../engine/units/races'

export interface ILevelDefinition {
  map: {
    size: number,
    terrains: Map<Terrain, number>,
  }

  opponents: Map<IUnitType, number>

  partyDeployOrigins: Hex[]

  reward: number
}

const STARTING_ENEMY_VALUE = 10
const ENEMY_VALUE_PER_LEVEL = 9
const MIN_MAP_SIZE = 5
const MAX_MAP_SIZE = 10
const MAX_SPECIAL_TERRAIN_RATIO = 0.35
const REWARD_DIVISOR = 22
const MIN_REWARD = 10

export function cellsInMap(size: number): number {
  if (size === 1) {
    return 1
  }

  return cellsInMap(size - 1) + (size - 1) * 6
}

export function terrainBudget(level: number, mapSize: number): Map<Terrain, number> {
  const total = cellsInMap(mapSize)
  const terrains = new Map<Terrain, number>()

  terrains.set(
    Terrain.Pit,
    Math.floor(total * (0.06 + Math.min(level, 8) * 0.01)),
  )

  if (level >= 2) {
    terrains.set(
      Terrain.Water,
      Math.floor(total * (0.04 + Math.min(level - 2, 5) * 0.01)),
    )
  }

  if (level >= 4) {
    terrains.set(
      Terrain.Forest,
      Math.floor(total * (0.04 + Math.min(level - 4, 5) * 0.01)),
    )
  }

  if (level >= 6) {
    terrains.set(
      Terrain.Wall,
      Math.floor(total * (0.02 + Math.min(level - 6, 4) * 0.005)),
    )
  }

  let sum = 0
  terrains.forEach(count => { sum += count })
  const maxSpecial = Math.floor(total * MAX_SPECIAL_TERRAIN_RATIO)
  if (sum > maxSpecial) {
    const ratio = maxSpecial / sum
    terrains.forEach((count, terrain) => {
      terrains.set(terrain, Math.max(1, Math.floor(count * ratio)))
    })
  }

  return terrains
}

function weightedRandomPick(items: number[]): number {
  const sum = items.reduce((a, b) => a + b, 0)
  const draw = Math.random() * sum

  let acc = 0
  for (const [i, value] of Array.from(items.entries())) {
    acc += value
    if (acc > draw) {
      return i
    }
  }

  throw new Error('Unreachable')
}

// this is greedy and more optimal solutions could be found, but it's not
// a huge deal
function pickOpponents(value: number): IUnitType[] {
  const bag: IUnitType[] = []
  let remainingValue = value

  while (remainingValue > 0) {
    const monsters = races.monsters.filter(m => m.cost <= remainingValue)
    if (monsters.length === 0) {
      break
    }

    // the probability of picking a monster is the inverse of its cost
    const probabilities = monsters.map(m => 1 / m.cost)
    const pickedMonster = monsters[weightedRandomPick(probabilities)]

    bag.push(pickedMonster)
    remainingValue -= pickedMonster.cost
  }

  return bag
}

export function enemyBudget(level: number): number {
  return STARTING_ENEMY_VALUE + level * ENEMY_VALUE_PER_LEVEL
}

/**
 * Reward scales with enemy strength and tapers slowly in very deep runs,
 * but never drops below MIN_REWARD so the player can keep reinforcing.
 */
export function calculateReward(level: number): number {
  const enemyValue = enemyBudget(level)
  const levelFactor = Math.max(20 - level, 1)
  return Math.max(
    MIN_REWARD,
    Math.floor(enemyValue * levelFactor / REWARD_DIVISOR),
  )
}

/**
 * each level N is defined by the following equation:
 * - enemy_sum_cost: 10 + N * 9
 * - reward: max(10, enemy_sum_cost * max(20 - N, 1) / 22)
 * - map_size: min(floor(5 + N / 3), 10)
 */
export function generateLevel(number: number): ILevelDefinition {
  const enemyValue = enemyBudget(number)
  const reward = calculateReward(number)
  const mapSize = Math.min(MIN_MAP_SIZE + Math.floor(number / 3), MAX_MAP_SIZE)

  return {
    map: {
      size: mapSize,
      terrains: terrainBudget(number, mapSize),
    },

    opponents: pickOpponents(enemyValue).reduce(
      (acc: Map<IUnitType, number>, unit) => {
        const units = acc.get(unit) || 0
        acc.set(unit, units + 1)
        return acc
      },
      new Map(),
    ),

    partyDeployOrigins: [
      new Hex(mapSize, 0),
      new Hex(-mapSize, 0),
    ],

    reward,
  }
}
