import { IUnitType } from '../unit'
import archer from './archer'
import barbarian from './barbarian'
import bat from './bat'
import catapult from './catapult'
import cleric from './cleric'
import demon from './demon'
import dragon from './dragon'
import giant from './giant'
import horseman from './horseman'
import knight from './knight'
import mage from './mage'
import orc from './orc'
import orcArcher from './orcArcher'
import spider from './spider'
import troll from './troll'
import warrior from './warrior'

export { default as archer } from './archer'
export { default as barbarian } from './barbarian'
export { default as bat } from './bat'
export { default as catapult } from './catapult'
export { default as cleric } from './cleric'
export { default as demon } from './demon'
export { default as dragon } from './dragon'
export { default as giant } from './giant'
export { default as horseman } from './horseman'
export { default as knight } from './knight'
export { default as mage } from './mage'
export { default as orc } from './orc'
export { default as orcArcher } from './orcArcher'
export { default as spider } from './spider'
export { default as troll } from './troll'
export { default as warrior } from './warrior'

const ALL_UNITS: IUnitType[] = [
  archer,
  barbarian,
  bat,
  catapult,
  cleric,
  demon,
  dragon,
  giant,
  horseman,
  knight,
  mage,
  orc,
  orcArcher,
  spider,
  troll,
  warrior,
]

export const byId = ALL_UNITS.reduce<{ [id: string]: IUnitType }>(
  (acc, unit) => {
    acc[unit.id] = unit
    return acc
  },
  {},
)
