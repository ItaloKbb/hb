import { css, StyleSheet } from 'aphrodite'
import { ReactNode } from 'react'

import style from '../utils/style'
import Layout from './layout'
import withStyle from './withStyle'

const Z_DIALOG = 1000

const styles = StyleSheet.create({
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: Z_DIALOG,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: 'rgba(4, 6, 10, 0.82)',
    backdropFilter: 'blur(3px)',
    overflow: 'auto',
  },
  main: {
    textAlign: 'center',
    position: 'relative',
    flexShrink: 0,
    maxWidth: 640,
    width: '100%',
    background: style.panel,
    border: style.border,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.65)',
  },
  controls: {
    borderTop: `1px solid ${style.goldDark}`,
  },
  control: {
    borderRight: `1px solid ${style.goldDark}`,
    padding: 16,
    cursor: 'pointer',
    color: style.gold,
    ':hover': {
      background: style.surfaceLight,
      color: style.textColor,
    },
    ':last-child': {
      borderRight: 0,
    },
  },
  content: {
    padding: 24,
    overflow: 'auto',
    color: style.textColor,
    textAlign: 'left',
  },
  title: {
    borderBottom: `1px solid ${style.goldDark}`,
    paddingBottom: 16,
    marginBottom: 0,
    color: style.gold,
    letterSpacing: 2,
  },
})

const DialogTitle = withStyle.className('DialogTitle', 'h2', styles.title)
const DialogContent = withStyle.classes(
  'DialogContent',
  props => <Layout {...props} grow />,
  styles.content,
)
const DialogControls = withStyle.classes(
  'DialogControls',
  props => <Layout {...props} direction="row" />,
  styles.controls,
)
const DialogControl = withStyle.classes(
  'DialogControl',
  props => <Layout {...props} grow />,
  styles.control,
)

function DialogRoot({ children }: { children: ReactNode }) {
  return (
    <div className={css(styles.backdrop)}>
      <div className={css(styles.main)}>
        {children}
      </div>
    </div>
  )
}

type DialogComponent = typeof DialogRoot & {
  Title: typeof DialogTitle
  Content: typeof DialogContent
  Controls: typeof DialogControls
  Control: typeof DialogControl
}

const Dialog = Object.assign(DialogRoot, {
  Title: DialogTitle,
  Content: DialogContent,
  Controls: DialogControls,
  Control: DialogControl,
}) as DialogComponent

export default Dialog
