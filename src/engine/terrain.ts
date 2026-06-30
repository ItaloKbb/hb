import { Terrain } from './map'

export interface ITerrainConfig {
  name: string
  description: string
  walkable: boolean
  moveCost: number
  defenseBonus: number
  clustering: number
}

export const TERRAIN_CONFIG: Record<Terrain, ITerrainConfig> = {
  [Terrain.Ground]: {
    name: 'Ground',
    description: 'Open terrain, normal movement (1 MP)',
    walkable: true,
    moveCost: 1,
    defenseBonus: 0,
    clustering: 0,
  },
  [Terrain.Water]: {
    name: 'Water',
    description: 'Shallow water, costs 2 MP to cross',
    walkable: true,
    moveCost: 2,
    defenseBonus: 0,
    clustering: 0.8,
  },
  [Terrain.Forest]: {
    name: 'Forest',
    description: 'Dense trees, costs 2 MP and grants +1 resistance',
    walkable: true,
    moveCost: 2,
    defenseBonus: 1,
    clustering: 0.85,
  },
  [Terrain.Wall]: {
    name: 'Wall',
    description: 'Impassable barrier, can be jumped over',
    walkable: false,
    moveCost: Infinity,
    defenseBonus: 0,
    clustering: 0.95,
  },
  [Terrain.Pit]: {
    name: 'Pit',
    description: 'Deadly drop, impassable unless flying or jumping over',
    walkable: false,
    moveCost: Infinity,
    defenseBonus: 0,
    clustering: 0.7,
  },
}

export function getTerrainConfig(terrain: Terrain): ITerrainConfig {
  return TERRAIN_CONFIG[terrain]
}

export function getMoveCost(terrain: Terrain): number {
  return TERRAIN_CONFIG[terrain].moveCost
}

export function isWalkableTerrain(terrain: Terrain): boolean {
  return TERRAIN_CONFIG[terrain].walkable
}

export function isJumpObstacle(terrain: Terrain): boolean {
  return terrain === Terrain.Pit || terrain === Terrain.Wall
}

export function isDeployableTerrain(terrain: Terrain): boolean {
  return terrain === Terrain.Ground
}
