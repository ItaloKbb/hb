import { css, StyleSheet } from 'aphrodite'
import { useState } from 'react'

import { IUnitType } from '../../engine/unit'
import races from '../../engine/units/races'
import Dialog from '../components/Dialog'
import Layout from '../components/layout'
import UnitGlyph from '../components/unitGlyph'
import { useMainStore, useMainStoreState } from '../mainContext'
import style from '../utils/style'

const styles = StyleSheet.create({
  unitButton: {
    cursor: 'pointer',
    padding: 8,
    background: style.surface,
    border: `1px solid ${style.surfaceLight}`,
    minWidth: 72,
    ':hover': {
      borderColor: style.gold,
      background: style.surfaceLight,
    },
  },
  unitButtonDisabled: {
    opacity: 0.4,
    cursor: 'default',
  },
  price: {
    color: style.gold,
    marginTop: 4,
  },
  description: {
    padding: '12px 0',
    color: style.textMuted,
    minHeight: 48,
    fontStyle: 'italic',
  },
  cart: {
    padding: 12,
    background: style.surface,
    border: `1px solid ${style.surfaceLight}`,
    minHeight: 64,
  },
  remaining: {
    color: style.gold,
    fontSize: 22,
    marginTop: 12,
  },
  sectionLabel: {
    color: style.gold,
    margin: '16px 0 8px',
  },
})

interface IProps {
  onCancel: () => void
}

export default function ShopDialog({ onCancel }: IProps) {
  const store = useMainStore()
  const { money } = useMainStoreState()
  const [cart, setCart] = useState<IUnitType[]>([])
  const [hoveredUnit, setHoveredUnit] = useState<IUnitType>()

  const totalCost = cart.reduce((prev, u) => prev + u.cost, 0)
  const remainingMoney = money - totalCost

  const onSelectUnit = (unit: IUnitType) => {
    if (remainingMoney >= unit.cost) {
      setCart([...cart, unit])
    }
  }

  const renderUnitButton = (unit: IUnitType, idx: number) => {
    const canAfford = remainingMoney >= unit.cost
    return (
      <div
        className={css(styles.unitButton, !canAfford && styles.unitButtonDisabled)}
        key={idx}
        onClick={() => onSelectUnit(unit)}
        onMouseOver={() => setHoveredUnit(unit)}
      >
        <Layout align="center">
          <UnitGlyph unitType={unit} wrapped={true} />
          <span className={css(styles.price)}>{unit.cost}💰</span>
        </Layout>
      </div>
    )
  }

  const onPurchase = () => {
    if (cart.length > 0) {
      store.purchase(cart, totalCost)
    }
    onCancel()
  }

  return (
    <Dialog>
      <Dialog.Title>SHOP</Dialog.Title>
      <Dialog.Content>
        <h3 className={css(styles.sectionLabel)}>Recruit</h3>
        <Layout direction="row" justify="space-around" wrap="wrap">
          {races.humans.map(renderUnitButton)}
        </Layout>
        <div className={css(styles.description)}>
          {hoveredUnit ? hoveredUnit.description : 'Hover a unit to see details'}
        </div>
        <h3 className={css(styles.sectionLabel)}>Cart</h3>
        <Layout direction="row" wrap="wrap" justify="center" classes={[styles.cart]}>
          {cart.length === 0
            ? <span style={{ color: style.textMuted }}>No units selected</span>
            : cart.map((u, idx) => (
              <span key={idx}><UnitGlyph unitType={u} wrapped={true}/></span>
            ))}
        </Layout>
        <div className={css(styles.remaining)}>
          💰 {remainingMoney} remaining
        </div>
      </Dialog.Content>
      <Dialog.Controls>
        <Dialog.Control onClick={onPurchase}>
          Confirm Purchase
        </Dialog.Control>
        <Dialog.Control onClick={onCancel}>
          Cancel
        </Dialog.Control>
      </Dialog.Controls>
    </Dialog>
  )
}
