import store from 'store'

import { IUnitType } from '../engine/unit'
import { byId } from '../engine/units'
import * as units from '../engine/units'
import { debug } from '../utils'

const KEY = 'hb:gameState'

export interface IStorage {
  levelReached: number,
  party: IUnitType[]
  money: number,
}

interface IRawStorage {
  levelReached: number,
  party: string[],
  money: number,
}

function isRawStorage(data: any): data is IRawStorage {
  return data
    && typeof data.levelReached === 'number'
    && typeof data.money === 'number'
    && Array.isArray(data.party)
    && data.party.every((id: string) => typeof id === 'string')
}

function resolveUnitType(storedId: string): IUnitType | undefined {
  const unit = byId[storedId]
  if (unit) {
    return unit
  }

  // Legacy saves used camelCase(displayName) which matched export keys.
  const legacyUnit = (units as unknown as Record<string, IUnitType>)[storedId]
  if (legacyUnit) {
    debug('storage: resolved legacy unit id', storedId)
    return legacyUnit
  }

  debug('storage: unknown unit id, skipping', storedId)
  return undefined
}

export function load(): IStorage | null {
  const data = store.get(KEY)
  if (!data) {
    return null
  }

  const rawData = JSON.parse(String(data))
  if (!isRawStorage(rawData)) {
    debug('storage: invalid save data, ignoring')
    return null
  }

  debug('storage: successfully loaded storage', rawData)
  return {
    levelReached: rawData.levelReached,
    party: rawData.party
      .map(resolveUnitType)
      .filter((unit): unit is IUnitType => unit !== undefined),
    money: rawData.money,
  }
}

export function save(data: IStorage): void {
  const rawData: IRawStorage = {
    levelReached: data.levelReached,
    party: data.party.map(u => u.id),
    money: data.money,
  }
  store.set(KEY, JSON.stringify(rawData))
  debug('storage: successfully saved storage', rawData)
}

export function reset(): void {
  store.remove(KEY)
}
