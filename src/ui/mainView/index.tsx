import { css, StyleSheet } from 'aphrodite'
import { useState } from 'react'

import { calculateReward } from '../../content/levels'
import { IUnitType } from '../../engine/unit'
import HexPattern from '../components/hexPattern'
import Layout from '../components/layout'
import Screen from '../components/screen'
import UnitGlyph from '../components/unitGlyph'
import { useMainStore, useMainStoreState } from '../mainContext'
import style from '../utils/style'
import HelpDialog from './helpDialog'
import ShopDialog from './shopDialog'

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  panel: {
    textAlign: 'center',
    background: style.panel,
    border: style.border,
    boxShadow: `
      0 0 60px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(212, 168, 75, 0.12),
      inset 0 1px 0 rgba(212, 168, 75, 0.2)
    `,
    padding: '36px 52px',
    maxWidth: 580,
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  dialogLayer: {
    position: 'relative',
    zIndex: 2,
  },
  title: {
    fontSize: 52,
    color: style.gold,
    margin: '0 0 4px',
    letterSpacing: 6,
    textShadow: '0 2px 12px rgba(212,168,75,0.35), 0 4px 16px rgba(0,0,0,0.6)',
  },
  titleRule: {
    width: 120,
    height: 2,
    background: `linear-gradient(90deg, transparent, ${style.gold}, transparent)`,
    margin: '0 auto 20px',
  },
  statBlock: {
    textAlign: 'center',
    minWidth: 72,
  },
  statDivider: {
    width: 1,
    background: style.surfaceLight,
    alignSelf: 'stretch',
  },
  subtitle: {
    color: style.textMuted,
    margin: '0 0 24px',
  },
  stats: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
    padding: '14px 24px',
    background: style.surface,
    border: `1px solid ${style.goldDark}`,
    boxShadow: 'inset 0 1px 0 rgba(212,168,75,0.08)',
  },
  statValue: {
    color: style.gold,
    fontSize: 28,
  },
  statLabel: {
    color: style.textMuted,
    fontSize: 16,
  },
  primaryButton: {
    cursor: 'pointer',
    display: 'inline-block',
    padding: '14px 36px',
    margin: '8px 0 16px',
    background: `linear-gradient(180deg, ${style.gold} 0%, ${style.goldDark} 100%)`,
    color: style.bg,
    fontSize: 28,
    border: `2px solid ${style.gold}`,
    boxShadow: '0 4px 16px rgba(212,168,75,0.25), 0 4px 12px rgba(0,0,0,0.4)',
    letterSpacing: 1,
    ':hover': {
      filter: 'brightness(1.12)',
      boxShadow: '0 6px 20px rgba(212,168,75,0.35), 0 4px 12px rgba(0,0,0,0.4)',
    },
  },
  menuButton: {
    cursor: 'pointer',
    padding: '8px 16px',
    margin: '4px 8px',
    color: style.textColor,
    border: `1px solid transparent`,
    ':hover': {
      color: style.gold,
      borderColor: style.goldDark,
    },
  },
  partyRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    margin: '20px 0',
    padding: '18px 20px',
    background: style.surface,
    border: `1px solid ${style.surfaceLight}`,
    boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.25)',
  },
  unitSlot: {
    padding: 6,
    background: style.bg,
    border: `1px solid ${style.goldDark}`,
    borderRadius: 4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  unitIcon: {
    width: 56,
    height: 56,
    fill: style.textColor,
    stroke: style.goldDark,
  },
  menuRow: {
    marginTop: 16,
    borderTop: `1px solid ${style.surfaceLight}`,
    paddingTop: 16,
  },
})

export default function MainView() {
  const store = useMainStore()
  const { levelReached, party, money } = useMainStoreState()
  const [showShop, setShowShop] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const onStartLevel = () => {
    store.startGame(levelReached)
  }

  const nextReward = calculateReward(levelReached)

  const renderPartyUnit = (unit: IUnitType, idx: number) => (
    <div key={idx} className={css(styles.unitSlot)}>
      <UnitGlyph unitType={unit} wrapped={true} classes={styles.unitIcon} />
    </div>
  )

  return (
    <Screen classes={[styles.screen]}>
      <HexPattern />
      <div className={css(styles.dialogLayer)}>
        {showShop && (
          <ShopDialog onCancel={() => setShowShop(false)} />
        )}
        {showHelp && (
          <HelpDialog onCancel={() => setShowHelp(false)} />
        )}
      </div>
      <div className={css(styles.panel)}>
        <h1 className={css(styles.title)}>HEXA BATTLE</h1>
        <div className={css(styles.titleRule)} />
        <p className={css(styles.subtitle)}>
          {levelReached
            ? `Depth reached: ${levelReached}`
            : 'Assemble your party and descend into the dungeon'}
        </p>

        <div className={css(styles.stats)}>
          <div className={css(styles.statBlock)}>
            <div className={css(styles.statValue)}>{money}💰</div>
            <div className={css(styles.statLabel)}>Gold</div>
          </div>
          <div className={css(styles.statDivider)} />
          <div className={css(styles.statBlock)}>
            <div className={css(styles.statValue)}>{nextReward}💰</div>
            <div className={css(styles.statLabel)}>Next reward</div>
          </div>
          <div className={css(styles.statDivider)} />
          <div className={css(styles.statBlock)}>
            <div className={css(styles.statValue)}>{party.length}</div>
            <div className={css(styles.statLabel)}>Party</div>
          </div>
        </div>

        <div
          className={css(styles.primaryButton)}
          onClick={onStartLevel}
        >
          {levelReached ? 'Venture Deeper' : 'Start Adventure'}
        </div>

        <div className={css(styles.partyRow)}>
          {party.map(renderPartyUnit)}
        </div>

        <Layout direction="row" justify="center" classes={[styles.menuRow]}>
          <span className={css(styles.menuButton)} onClick={() => setShowShop(true)}>
            Shop
          </span>
          <span className={css(styles.menuButton)} onClick={() => setShowHelp(true)}>
            Help
          </span>
          <span className={css(styles.menuButton)} onClick={store.resetProgress}>
            Reset
          </span>
        </Layout>
      </div>
    </Screen>
  )
}
