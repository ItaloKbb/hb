import { css, StyleSheet } from 'aphrodite'
import { useEffect, useRef } from 'react'

import Dialog from '../components/Dialog'
import Layout from '../components/layout'
import Screen from '../components/screen'
import { useStoreSnapshot } from '../hooks/useStoreSnapshot'
import { useMainStore } from '../mainContext'
import { HEX_SIZE } from './iso'
import Map from './map'
import Overlays from './overlays'
import { StageStoreProvider } from './stageContext'
import Sidebar from './sidebar'
import StageStore, { IStageState } from './store'
import Things from './things'

const styles = StyleSheet.create({
  mapContainer: {
    overflow: 'auto',
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
        const isAval = u => u.canPerformAction || u.mp > 0

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
        <Dialog.Title>GAME OVER</Dialog.Title>
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
        <Layout justify="center" grow>
          <div className={css(styles.mapContainer)}>
            <svg ref={svgRef} onMouseOut={() => stageStore.hover(null)}>
              <g ref={mapRef}>
                <Map />
              </g>
              <g style={{ pointerEvents: 'none' }}>
                <Overlays />
                <Things />
              </g>
            </svg>
          </div>
        </Layout>
        <Sidebar />
      </Screen>
    </StageStoreProvider>
  )
}
