import { css, StyleSheet } from 'aphrodite'
import { ReactNode } from 'react'

import style from '../utils/style'
import Layout from './layout'
import withStyle from './withStyle'

const styles = StyleSheet.create({
  main: {
    textAlign: 'center',
    position: 'absolute',
    left: 100, right: 100,
    background: style.darkGrey,
    border: style.border,
    margin: '100px 0',
  },
  backdrop: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(128, 128, 128, 0.5)',
    zIndex: 1,
    overflow: 'auto',
  },
  controls: {
    borderTop: style.border,
  },
  control: {
    borderRight: style.border,
    padding: 20,
    cursor: 'pointer',
    ':last-child': {
      borderRight: 0,
    },
  },
  content: {
    padding: 20,
    overflow: 'auto',
  },
  title: {
    borderBottom: style.border,
    paddingBottom: 20,
    marginBottom: 0,
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
      <Layout classes={[styles.main]}>
        {children}
      </Layout>
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
