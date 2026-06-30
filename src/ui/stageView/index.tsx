import { css, StyleSheet } from 'aphrodite'
import { useEffect, useRef } from 'react'

import Unit from '../../engine/unit'
import Dialog from '../components/Dialog'
import Layout from '../components/layout'
import Screen from '../components/screen'
import { useStoreSnapshot } from '../hooks/useStoreSnapshot'
import { useMainStore } from '../mainContext'
import style from '../utils/style'
import { HEX_SIZE } from './iso'
import Map from './map'
import MapDefs from './mapDefs'
import Overlays from './overlays'
import { StageStoreProvider } from './stageContext'
import Sidebar from './sidebar'
import StageStore, { IStageState } from './store'
import Things from './things'

const styles = StyleSheet.create({
  mapWrapper: {
    padding: 12,
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    background: `radial-gradient(ellipse at center, ${style.surfaceLight} 0%, ${style.bg} 70%)`,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 0,
    overflow: 'auto',
    position: 'relative',
    background: style.mapVoid,
    borderRadius: 8,
    border: `2px solid ${style.goldDark}`,
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.55),
      inset 0 0 80px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(212, 168, 75, 0.12)
    `,
  },
  mapFog: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    borderRadius: 8,
    background: `
      radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%),
      linear-gradient(180deg, rgba(94,184,201,0.03) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.15) 100%)
    `,
    zIndex: 1,
  },
  mapCorner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: style.gold,
    borderStyle: 'solid',
    pointerEvents: 'none',
    zIndex: 2,
    opacity: 0.6,
  },
  cornerTL: { top: 6, left: 6, borderWidth: '2px 0 0 2px' },
  cornerTR: { top: 6, right: 6, borderWidth: '2px 2px 0 0' },
  cornerBL: { bottom: 6, left: 6, borderWidth: '0 0 2px 2px' },
  cornerBR: { bottom: 6, right: 6, borderWidth: '0 2px 2px 0' },
  svg: {
    display: 'block',
    width: '100%',
    height: '100%',
    minHeight: 480,
  },
})

export type IState = IStageState

export default function StageView() {
  const mainStore = useMainStore()
  const currentGame = mainStore.state.currentGame!

  const stageStoreRef = useRef<StageStore | null>(null)
  if (!stageStoreRef.current) {
    stageStoreRef.current = new StageStore({
      playerFaction: currentGame.playerFaction,
      game: currentGame.game,
    })
  }
  const stageStore = stageStoreRef.current

  useStoreSnapshot(stageStore)

  const svgRef = useRef<SVGSVGElement>(null)
  const mapRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const map = mapRef.current
    const svg = svgRef.current
    if (!map || !svg) {
      return
    }

    const { x, y, width, height } = map.getBBox()
    svg.setAttribute(
      'viewBox',
      `${x - HEX_SIZE} ${y - HEX_SIZE} ${width + HEX_SIZE * 2} ${height + HEX_SIZE * 2}`,
    )
  }, [])

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      const { game, playerFaction, selection } = stageStore.state
      const unit = selection && selection.unit && selection.unit.unit
      const action = selection && selection.unit && selection.unit.action
      const int = parseInt(e.key, 10) - 1

      if (e.key === ' ' && !action) {
        const isAval = (u: Unit) => u.canPerformAction || u.mp > 0

        const playerUnits = game.factionUnits[playerFaction]
        const currentUnitIndex = playerUnits.findIndex(u =>
          u.id === (unit && unit.id),
        )
        const nextAvailableUnit = playerUnits.find(
          (u, i) => isAval(u) && i > currentUnitIndex,
        ) || playerUnits.find(isAval)
        if (nextAvailableUnit) {
          stageStore.selectCell(game.map.cellAt(nextAvailableUnit.pos))
          e.preventDefault()
        }
      } else if (
        unit && unit.factionId === playerFaction && unit.actions[int]
        && unit.canPerformAction
      ) {
        stageStore.selectAction(unit.actions[int])
      }
    }

    document.addEventListener('keypress', onKeyPress)
    return () => document.removeEventListener('keypress', onKeyPress)
  }, [stageStore])

  const winningFaction = stageStore.state.game.checkGameOver()
  let dialog
  if (winningFaction) {
    const { playerFaction } = stageStore.state
    const playerWon = winningFaction === playerFaction

    dialog = (
      <Dialog>
        <Dialog.Title>{playerWon ? 'VICTORY' : 'GAME OVER'}</Dialog.Title>
        <Dialog.Content>
          {playerWon ? 'YOU WON' : 'YOU LOST'}
        </Dialog.Content>
        <Dialog.Controls>
          <Dialog.Control onClick={() => mainStore.finishGame(playerWon)}>
            OK
          </Dialog.Control>
        </Dialog.Controls>
      </Dialog>
    )
  }

  return (
    <StageStoreProvider store={stageStore}>
      <Screen direction="row">
        {dialog}
        <Layout justify="center" grow classes={[styles.mapWrapper]}>
          <div className={css(styles.mapContainer)}>
            <svg
              ref={svgRef}
              className={css(styles.svg)}
              preserveAspectRatio="xMidYMid meet"
              onMouseOut={() => stageStore.hover(null)}
            >
              <MapDefs />
              <g ref={mapRef}>
                <Map />
              </g>
              <g style={{ pointerEvents: 'none' }}>
                <Overlays />
                <Things />
              </g>
            </svg>
            <div className={css(styles.mapFog)} />
            <div className={css(styles.mapCorner, styles.cornerTL)} />
            <div className={css(styles.mapCorner, styles.cornerTR)} />
            <div className={css(styles.mapCorner, styles.cornerBL)} />
            <div className={css(styles.mapCorner, styles.cornerBR)} />
          </div>
        </Layout>
        <Sidebar />
      </Screen>
    </StageStoreProvider>
  )
}
