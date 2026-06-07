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
  main: {
    textAlign: 'center',
    background: style.darkGrey,
    color: style.textColor,
    position: 'absolute',
    left: 0, top: 0, right: 0, bottom: 0,
    border: style.border,
  },
  button: {
    cursor: 'pointer',
    ':hover': {
      color: 'white',
      stroke: 'white',
    },
  },
  blockedLevel: {
    opacity: .6,
  },
  description: {
    paddingTop: 10,
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

  const renderUnitButton = (unit: IUnitType, idx: number) => (
    <div
      className={css(styles.button)}
      key={idx}
      onClick={() => onSelectUnit(unit)}
      onMouseOver={() => setHoveredUnit(unit)}
    >
      <Layout>
        <UnitGlyph unitType={unit} wrapped={true} />
        {unit.cost}💰
      </Layout>
    </div>
  )

  const onPurchase = () => {
    store.purchase(cart, totalCost)
    onCancel()
  }

  return (
    <Dialog>
      <Dialog.Title>SHOP</Dialog.Title>
      <Dialog.Content>
        <h3>Select</h3>
        <div>
          <Layout direction="row" justify="space-around">
            {races.humans.map(renderUnitButton)}
          </Layout>
        </div>
        <div className={css(styles.description)}>
          {hoveredUnit && hoveredUnit.description}
        </div>
        <h3>Selected</h3>
        <Layout direction="row" wrap="wrap" justify="center" grow>
          {cart.map((u, idx) => (
            <span key={idx}><UnitGlyph unitType={u} wrapped={true}/></span>
          ))}
        </Layout>
        <div>
          💰 {remainingMoney} Remaining
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
