import { css, StyleSheet } from 'aphrodite'

import { MainStoreProvider, useMainStoreState } from './mainContext'
import MainView from './mainView'
import StageView from './stageView'
import style from './utils/style'

const styles = StyleSheet.create({
  main: {
    fontFamily: '"VT323", monospace',
    fontSize: 20,
    position: 'fixed',
    left: 0, top: 0, right: 0, bottom: 0,
    overflow: 'auto',
    background: `radial-gradient(ellipse at 50% 20%, ${style.surfaceLight} 0%, ${style.bg} 55%, ${style.bg} 100%)`,
    color: style.textColor,
  },
})

function AppRouter() {
  const { currentGame } = useMainStoreState()

  if (currentGame) {
    return <StageView />
  }

  return <MainView />
}

export default function App() {
  return (
    <MainStoreProvider>
      <div className={css(styles.main)}>
        <AppRouter />
      </div>
    </MainStoreProvider>
  )
}
