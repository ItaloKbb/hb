import { memo, useRef } from 'react'

import transform from '../utils/transform'
import * as iso from './iso'
import { useStageStore } from './stageContext'
import Tile from './tile'

function Map() {
  const store = useStageStore()
  const storeRef = useRef(store)
  storeRef.current = store

  const cells = store.state.game.map.cells.map((c, idx) => {
    const { x, y } = iso.projectHex(c.pos)
    return (
      <g
        transform={transform.translate(x, y).string()}
        key={idx}
        onMouseOver={() => storeRef.current.hover(c)}
        onClick={() => storeRef.current.selectCell(c)}
      >
        <Tile terrain={c.terrain}/>
      </g>
    )
  })

  return <g>{cells}</g>
}

export default memo(Map, () => true)
