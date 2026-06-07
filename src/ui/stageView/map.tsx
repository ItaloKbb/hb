import * as React from 'react'

import transform from '../utils/transform'
import * as iso from './iso'
import { stageStoreContextTypes } from './stageContext'
import StageStore from './store'
import Tile from './Tile'

export default class Map extends React.Component<{}, {}> {
  static contextTypes = stageStoreContextTypes

  store: StageStore

  constructor(props, context) {
    super(props, context)
    this.store = (context as { stageStore: StageStore }).stageStore
  }

  shouldComponentUpdate() {
    return false
  }

  onMouseOver = c => {
    this.store.hover(c)
  }

  onClick = c => {
    this.store.selectCell(c)
  }

  render() {
    const cells = this.store.state.game.map.cells.map((c, idx) => {
      const { x, y } = iso.projectHex(c.pos)
      return (
        <g
          transform={transform.translate(x, y).string()}
          key={idx}
          onMouseOver={() => this.onMouseOver(c)}
          onClick={() => this.onClick(c)}
        >
          <Tile terrain={c.terrain}/>
        </g>
      )
    })

    return <g>{cells}</g>
  }
}
