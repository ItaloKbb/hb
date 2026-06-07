import { css, StyleSheet } from 'aphrodite'
import { useState } from 'react'

import { IUnitType } from '../../engine/unit'
import Screen from '../components/screen'
import UnitGlyph from '../components/unitGlyph'
import { useMainStore, useMainStoreState } from '../mainContext'
import style from '../utils/style'
import HelpDialog from './helpDialog'
import ShopDialog from './shopDialog'

const styles = StyleSheet.create({
  main: {
    textAlign: 'center',
    border: style.border,
  },
  button: {
    cursor: 'pointer',
    ':hover': {
      color: 'white',
    },
  },
  blockedLevel: {
    opacity: .6,
  },
  unit: {
    padding: 10,
    width: 50,
    height: 50,
    fill: style.textColor,
    stroke: 'black',
  },
})

export default function MainView() {
  const store = useMainStore()
  const { levelReached, party } = useMainStoreState()
  const [showShop, setShowShop] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const onStartLevel = () => {
    store.startGame(levelReached)
  }

  const renderLevelButton = (_: unknown, levelNumber: number) => {
    const reached = levelReached === levelNumber
    return (
      <h3
        className={css(reached ? styles.button : styles.blockedLevel)}
        onClick={reached ? () => store.startGame(levelNumber) : undefined}
        key={levelNumber}
      >
        Level {levelNumber + 1}
      </h3>
    )
  }

  const renderPartyUnit = (unit: IUnitType, idx: number) => (
    <UnitGlyph unitType={unit} key={idx} wrapped={true} />
  )

  return (
    <Screen classes={[styles.main]}>
      {showShop && (
        <ShopDialog onCancel={() => setShowShop(false)} />
      )}
      {showHelp && (
        <HelpDialog onCancel={() => setShowHelp(false)} />
      )}
      <h1>Hexa Battle</h1>
      <h2 className={css(styles.button)} onClick={onStartLevel}>
        {levelReached ? 'Venture Deeper' : 'Start your adventure'}
      </h2>
      {!!levelReached && <h3>Depth reached: {levelReached}</h3>}
      <div>
        {party.map(renderPartyUnit)}
      </div>
      <h2
        onClick={() => setShowShop(true)}
        className={css(styles.button)}
      >
        Shop
      </h2>
      <h2
        onClick={() => setShowHelp(true)}
        className={css(styles.button)}
      >
        Help
      </h2>
      <h2 onClick={store.resetProgress} className={css(styles.button)}>
        Reset Progress
      </h2>
    </Screen>
  )
}
