import color from 'color'
import { PureComponent } from 'react'

import { Terrain } from '../../engine/map'
import * as svg from '../utils/svg'
import * as iso from './iso'

const WALL_HEIGHT = iso.HEX_SIZE * 2

function makeTerrainStyle(fill: string, stroke: string) {
  return {
    tile: { fill, stroke, strokeWidth: '.05%' },
    eastWall: { fill: color(fill).darken(.7).string() },
    southWall: { fill: color(fill).darken(.6).string() },
    westWall: { fill: color(fill).darken(.5).string() },
  }
}

function makeWallPolygons(height: number) {
  return {
    south: svg.points(
      { x: iso.HEX_POINTS.sw.x, y: iso.HEX_POINTS.sw.y },
      { x: iso.HEX_POINTS.sw.x, y: iso.HEX_POINTS.sw.y + height },
      { x: iso.HEX_POINTS.se.x, y: iso.HEX_POINTS.se.y + height },
      { x: iso.HEX_POINTS.se.x, y: iso.HEX_POINTS.se.y },
    ),
    west: svg.points(
      { x: iso.HEX_POINTS.sw.x, y: iso.HEX_POINTS.sw.y },
      { x: iso.HEX_POINTS.sw.x, y: iso.HEX_POINTS.sw.y + height },
      { x: iso.HEX_POINTS.w.x, y: iso.HEX_POINTS.w.y + height },
      { x: iso.HEX_POINTS.w.x, y: iso.HEX_POINTS.w.y },
    ),
    east: svg.points(
      { x: iso.HEX_POINTS.se.x, y: iso.HEX_POINTS.se.y },
      { x: iso.HEX_POINTS.se.x, y: iso.HEX_POINTS.se.y + height },
      { x: iso.HEX_POINTS.e.x, y: iso.HEX_POINTS.e.y + height },
      { x: iso.HEX_POINTS.e.x, y: iso.HEX_POINTS.e.y },
    ),
  }
}

function makeIsometricTile(
  id: string,
  fill: string,
  stroke: string,
  wallHeight = WALL_HEIGHT,
  decoration?: JSX.Element,
) {
  const style = makeTerrainStyle(fill, stroke)
  const walls = makeWallPolygons(wallHeight)

  return (
    <g>
      <defs>
        <linearGradient id={`eastWall${id}`} x1="27%" x2="73%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={style.eastWall.fill} />
          <stop offset="30%" stopColor={style.eastWall.fill} />
          <stop offset="70%" stopColor={style.eastWall.fill} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`southWall${id}`} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={style.southWall.fill} />
          <stop offset="50%" stopColor={style.southWall.fill} />
          <stop offset="90%" stopColor={style.southWall.fill} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`westWall${id}`} x1="63%" x2="37%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={style.westWall.fill} />
          <stop offset="40%" stopColor={style.westWall.fill} />
          <stop offset="80%" stopColor={style.westWall.fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={walls.south} fill={`url(#southWall${id})`} />
      <polygon points={walls.west} fill={`url(#westWall${id})`} />
      <polygon points={walls.east} fill={`url(#eastWall${id})`} />
      <polygon style={style.tile} points={iso.drawHex(1)} />
      {decoration}
    </g>
  )
}

const forestDecoration = (
  <g fill="#1B4D1B" opacity={0.7}>
    <circle cx={iso.HEX_POINTS.nw.x * 0.6} cy={iso.HEX_POINTS.nw.y * 0.6} r={3} />
    <circle cx={iso.HEX_POINTS.ne.x * 0.6} cy={iso.HEX_POINTS.ne.y * 0.6} r={2.5} />
    <circle cx={0} cy={0} r={3.5} />
  </g>
)

const groundTile = makeIsometricTile('Ground', '#5C4B3D', 'black')
const waterTile = makeIsometricTile('Water', '#3B7CBF', '#1E4F7A')
const wallTile = makeIsometricTile('Wall', '#6B6B6B', '#3A3A3A', WALL_HEIGHT * 1.5)
const forestTile = makeIsometricTile('Forest', '#3A6B35', '#1B3A18', WALL_HEIGHT, forestDecoration)

const pitTile = (
  <g>
    <polygon fill="transparent" points={iso.drawHex(1)} />
  </g>
)

const tiles = {
  [Terrain.Ground]: groundTile,
  [Terrain.Water]: waterTile,
  [Terrain.Wall]: wallTile,
  [Terrain.Forest]: forestTile,
  [Terrain.Pit]: pitTile,
}

export interface IProps {
  terrain: Terrain,
}

export default class Tile extends PureComponent<IProps> {
  render() {
    return tiles[this.props.terrain]
  }
}
