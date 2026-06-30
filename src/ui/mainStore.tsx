import createLevel from '../content/createLevel'
import { generateLevel } from '../content/levels'
import Game from '../engine/game'
import { IUnitType } from '../engine/unit'
import * as units from '../engine/units'
import { debug } from '../utils'
import * as storage from './storage'

export interface IState {
  levelReached: number,
  party: IUnitType[]
  money: number,

  currentGame?: {
    game: Game,
    level: number,
    playerFaction: string,
    reward: number,
  }
}

type Listener = () => void

export default class MainStore {
  private listeners = new Set<Listener>()
  private _state: IState

  constructor() {
    this._state = this.loadProgress()
  }

  get state(): IState {
    return this._state
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(cb?: () => void) {
    this.listeners.forEach(listener => listener())
    if (cb) {
      cb()
    }
  }

  private set(partial: Partial<IState>, cb?: () => void) {
    this._state = { ...this._state, ...partial }
    this.notify(cb)
  }

  private replaceState(state: IState, cb?: () => void) {
    this._state = state
    this.notify(cb)
  }

  finishGame = (won: boolean) => {
    if (won) {
      const { money, currentGame } = this.state
      const { game, level, playerFaction, reward } = currentGame!

      this.set({
        money: money + reward,
        party: game.factionUnits[playerFaction].map(u => u.type),
        levelReached: level + 1,
        currentGame: undefined,
      }, this.save)
    } else {
      this.set({ currentGame: undefined })
    }

    debug('mainStore: finished game', won)
  }

  startGame(level: number) {
    debug('mainStore: starting new game')
    const levelDef = generateLevel(level)
    const game = createLevel(levelDef, this.state.party)
    this.set({
      currentGame: {
        game,
        level,
        playerFaction: Array.from(game.factions.keys())[0]!,
        reward: levelDef.reward,
      },
    })
  }

  purchase = (cart: IUnitType[], cost: number) => {
    debug('mainStore: purchased', cart, 'for', cost)
    this.set({
      money: this.state.money - cost,
      party: [...this.state.party, ...cart],
    }, this.save)
  }

  resetProgress = () => {
    debug('mainStore: resetting progress')
    storage.reset()
    this.replaceState(this.loadProgress())
  }

  loadProgress = (): IState => {
    return storage.load() || this.getInitialState()
  }

  private getInitialState = (): IState => {
    return {
      levelReached: 0,
      party: [units.archer, units.warrior, units.warrior, units.warrior],
      money: 8,
    }
  }

  private save = () => {
    storage.save({
      money: this.state.money,
      party: this.state.party,
      levelReached: this.state.levelReached,
    })
  }
}
