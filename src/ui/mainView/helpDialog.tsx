import { css, StyleSheet } from 'aphrodite'

import Dialog from '../components/Dialog'

const styles = StyleSheet.create({
  shortcuts: {
    listStyleType: 'none',
  },
  shortcut: {
    textDecoration: 'underline',
  },
})

interface IProps {
  onCancel: () => void
}

export default function HelpDialog({ onCancel }: IProps) {
  return (
    <Dialog>
      <Dialog.Title>HELP</Dialog.Title>
      <Dialog.Content>
        <h3>Rules</h3>
        Assemble your party of heroes and venture into the dungeon. How deep
        can you go? Every time you clear a level, you carry your surviving
        units to the next level. At the end of every level you also earn
        some 💰 that you can spend in the shop to recruit more units.
        <h3>Shortcuts</h3>
        <ul className={css(styles.shortcuts)}>
          <li>
            <span className={css(styles.shortcut)}>spacebar</span>:
            select next available unit</li>
          <li>
            <span className={css(styles.shortcut)}>1-9</span>:
            select the corresponding action for the selected unit
          </li>
        </ul>
        <div>
        </div>
      </Dialog.Content>
      <Dialog.Controls>
        <Dialog.Control onClick={onCancel}>
          Back
        </Dialog.Control>
      </Dialog.Controls>
    </Dialog>
  )
}
