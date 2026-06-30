import { css, StyleSheet } from 'aphrodite'
import { cloneElement, ReactElement, ReactNode } from 'react'

import { UnitAction } from '../../engine/actions/action'
import { ICell } from '../../engine/map'
import Unit, { UnitStatus } from '../../engine/unit'
import { getTerrainConfig } from '../../engine/terrain'
import { ITrait } from '../../engine/units/traits'
import ActionGlyph from '../components/actionGlyph'
import Layout from '../components/layout'
import StatBar from '../components/statBar'
import TraitGlyph from '../components/traitGlyph'
import UnitGlyph from '../components/unitGlyph'
import { useStoreSnapshot } from '../hooks/useStoreSnapshot'
import style from '../utils/style'
import { useStageStore } from './stageContext'
import StageStore from './store'

const styles = StyleSheet.create({
  main: {
    borderLeft: style.border,
    width: 320,
    flexShrink: 0,
    background: style.panel,
  },
  container: {
    padding: 16,
  },
  sectionTitle: {
    color: style.gold,
    fontSize: 22,
    margin: '0 0 12px',
    letterSpacing: 1,
    borderBottom: `1px solid ${style.goldDark}`,
    paddingBottom: 8,
  },
  turnBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    background: style.surface,
    border: `1px solid ${style.surfaceLight}`,
    marginBottom: 12,
    fontSize: 18,
  },
  factionDot: {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '50%',
    marginRight: 6,
    verticalAlign: 'middle',
  },
  unitName: {
    fontSize: 20,
    color: style.textColor,
    marginBottom: 4,
  },
  statusLine: {
    fontSize: 14,
    color: style.textMuted,
    marginBottom: 8,
  },
  infoBox: {
    background: style.surface,
    border: `1px solid ${style.surfaceLight}`,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    padding: 8,
    marginBottom: 4,
    cursor: 'pointer',
    border: '2px solid transparent',
    borderRadius: 2,
    background: style.surface,
    ':hover': {
      background: style.surfaceLight,
    },
  },
  subtitle: {
    fontSize: 'smaller',
  },
  disabledAction: {
    cursor: 'default',
    color: style.grey,
  },
  disabledActionIcon: {
    fill: style.grey,
  },
  selectedAction: {
    borderColor: style.gold,
    background: style.surfaceLight,
  },
  endTurnButton: {
    padding: 20,
    textAlign: 'center',
    background: `linear-gradient(180deg, ${style.surfaceLight} 0%, ${style.surface} 100%)`,
    borderTop: style.border,
    cursor: 'pointer',
    color: style.gold,
    fontSize: 22,
    letterSpacing: 1,
    ':hover': {
      background: style.surfaceLight,
      color: style.textColor,
    },
  },
  unitIcon: {
    width: '30%',
    height: '1%',
  },
  hpBar: { color: style.hpColor },
  mpBar: { color: style.mpColor },
  manaBar: { color: style.manaColor },
})

function renderUnitButton(
  title: ReactNode,
  subtitle: ReactNode,
  icon: ReactElement,
  onClick?: () => void,
  selected?: boolean,
) {
  const classes = [
    styles.button,
    selected && styles.selectedAction,
    !onClick && styles.disabledAction,
  ]
  const styledIcon = cloneElement(icon, {
    classes: !onClick ? styles.disabledActionIcon : undefined,
  })

  return (
    <Layout classes={classes} direction="row" align="center" onClick={onClick}>
      {styledIcon}
      <Layout grow>
        {title}
        <div className={css(styles.subtitle)}>
          {subtitle}
        </div>
      </Layout>
    </Layout>
  )
}

function renderActionButton(
  action: UnitAction,
  selectedAction: UnitAction | undefined,
  store: StageStore,
) {
  let manaCost
  if (action.manaCost) {
    manaCost = (
      <span className={css(styles.manaBar)}>
        ({action.manaCost} mana)
      </span>
    )
  }

  const title = <span>{action.name} {manaCost}</span>
  const subtitle = action.description
  const icon = <ActionGlyph action={action} wrapped={true} />
  const onClick = action.canExecute ? () => store.selectAction(action) : undefined
  const selected = action === selectedAction

  return renderUnitButton(title, subtitle, icon, onClick, selected)
}

function renderTraitButton(trait: ITrait) {
  const title = <span>{trait.name} (passive)</span>
  const subtitle = trait.description
  const icon = <TraitGlyph trait={trait} wrapped={true} />

  return renderUnitButton(title, subtitle, icon)
}

function renderCellInfo(cell: ICell) {
  const terrain = getTerrainConfig(cell.terrain)
  return (
    <div className={css(styles.infoBox)}>
      <div className={css(styles.sectionTitle)}>{terrain.name}</div>
      <div className={css(styles.subtitle)}>{terrain.description}</div>
      <div className={css(styles.subtitle)}>Cell {cell.pos.toString()}</div>
    </div>
  )
}

function renderUnitInfo(unit: Unit) {
  const statuses = Array.from(unit.status.keys()).map(s => UnitStatus[s])

  return (
    <div className={css(styles.infoBox)}>
      <Layout direction="row">
        <UnitGlyph
          unitType={unit.type}
          classes={styles.unitIcon}
          wrapped={true}
        />
        <Layout grow>
          <div className={css(styles.unitName)}>{unit.type.name}</div>
          <div className={css(styles.statusLine)}>
            Status: {statuses.join(', ') || '—'} · Resist {unit.resistance}
          </div>
          <StatBar label="HP" value={unit.hp} max={unit.type.hp} color={style.hpColor} />
          <StatBar label="MP" value={unit.mp} max={unit.type.mp} color={style.mpColor} />
          {unit.type.mana > 0 && (
            <StatBar
              label="Mana"
              value={unit.mana}
              max={unit.type.mana}
              color={style.manaColor}
            />
          )}
        </Layout>
      </Layout>
    </div>
  )
}

function renderActions(
  unit: Unit,
  selectedAction: UnitAction | undefined,
  store: StageStore,
) {
  return (
    <div>
      {unit.actions.map(a => renderActionButton(a, selectedAction, store))}
    </div>
  )
}

function renderTraits(unit: Unit) {
  if (!unit.type.traits) {
    return null
  }

  return (
    <div>
      {unit.type.traits.map(t => renderTraitButton(t))}
    </div>
  )
}

export default function Sidebar() {
  const store = useStageStore()
  const { game, hover, selection } = useStoreSnapshot(store)
  const { currentFaction, epoch } = game
  const unit = (hover && hover.unit) || (selection && selection.unit)
  const cell = (hover && hover.cell) || (selection && selection.cell)
  const action = hover ? undefined : selection && selection.unit
    && selection.unit.action && selection.unit.action.action

  const cellInfo = cell && renderCellInfo(cell)
  const unitInfo = unit && renderUnitInfo(unit.unit)
  const actionsInfo = unit && renderActions(unit.unit, action, store)
  const traitsInfo = unit && renderTraits(unit.unit)

  return (
    <Layout classes={[styles.main]}>
      <div className={css(styles.container)}>
        <div className={css(styles.turnBadge)}>
          <span
            className={css(styles.factionDot)}
            style={{ background: currentFaction.color }}
          />
          Turn {epoch} — {currentFaction.name}
        </div>
        {cellInfo}
        {unitInfo}
        {actionsInfo}
        {traitsInfo}
      </div>
      <Layout grow />
      <div className={css(styles.endTurnButton)} onClick={store.endTurn}>
        End Turn
      </div>
    </Layout>
  )
}
