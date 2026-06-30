import color from 'color'
import { PureComponent } from 'react'

import { Terrain } from '../../engine/map'
import * as svg from '../utils/svg'
import * as iso from './iso'

const WALL_HEIGHT = iso.HEX_SIZE * 2

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

function hexTop(stroke: string, fill: string, highlight?: string, extra?: JSX.Element) {
  return (
    <g>
      <polygon fill={fill} stroke={stroke} strokeWidth={0.4} points={iso.drawHex(1)} />
      {highlight && (
        <>
          <polygon
            fill="none"
            stroke={highlight}
            strokeWidth={0.3}
            opacity={0.45}
            points={iso.drawHex(0.94)}
          />
          <polygon
            fill={highlight}
            opacity={0.08}
            points={`${iso.HEX_POINTS.nw.x * 0.3},${iso.HEX_POINTS.nw.y * 0.3} 0,${iso.HEX_POINTS.nw.y * 0.5} ${iso.HEX_POINTS.ne.x * 0.3},${iso.HEX_POINTS.ne.y * 0.3} 0,0`}
          />
        </>
      )}
      <polygon fill="url(#hex-noise)" points={iso.drawHex(1)} opacity={0.55} />
      {extra}
    </g>
  )
}

function isoTile(
  wallGrad: { s: string, w: string, e: string },
  topFill: string,
  stroke: string,
  wallHeight: number,
  decoration?: JSX.Element,
  highlight?: string,
  topExtra?: JSX.Element,
) {
  const walls = makeWallPolygons(wallHeight)
  return (
    <g>
      <polygon points={walls.south} fill={`url(#${wallGrad.s})`} />
      <polygon points={walls.west} fill={`url(#${wallGrad.w})`} />
      <polygon points={walls.east} fill={`url(#${wallGrad.e})`} />
      {hexTop(stroke, topFill, highlight, topExtra)}
      {decoration}
    </g>
  )
}

function tree(cx: number, cy: number, scale: number, foliage: string) {
  const light = color(foliage).lighten(0.18).string()
  const dark = color(foliage).darken(0.15).string()
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      <ellipse cx={0} cy={3.5} rx={2.5} ry={0.8} fill="#000" opacity={0.2} />
      <rect x={-0.6} y={1.2} width={1.2} height={2.8} fill="#4a3520" rx={0.15} />
      <polygon points="0,-7.5 5.5,1.2 -5.5,1.2" fill={dark} />
      <polygon points="0,-5 4,0.8 -4,0.8" fill={foliage} />
      <polygon points="0,-2.5 2.5,0.5 -2.5,0.5" fill={light} />
    </g>
  )
}

const forestDecoration = (
  <g>
    {tree(iso.HEX_POINTS.nw.x * 0.52, iso.HEX_POINTS.nw.y * 0.52, 0.85, '#3a7a38')}
    {tree(iso.HEX_POINTS.ne.x * 0.48, iso.HEX_POINTS.ne.y * 0.48, 0.7, '#458a42')}
    {tree(0, -1.5, 0.95, '#2d6230')}
  </g>
)

const waterWalls = makeWallPolygons(WALL_HEIGHT * 0.45)

/** Shallow pool — sunken basin with ripples and sparkles */
const waterTile = (
  <g>
    <polygon points={waterWalls.south} fill="url(#wall-water-s)" />
    <polygon points={waterWalls.west} fill="url(#wall-water-w)" />
    <polygon points={waterWalls.east} fill="url(#wall-water-e)" />
    {/* muddy bank ring */}
    <polygon
      fill="#4a4030"
      stroke="#2a2218"
      strokeWidth={0.45}
      points={iso.drawHex(1)}
    />
    <polygon
      fill="none"
      stroke="#6a5a48"
      strokeWidth={0.3}
      opacity={0.6}
      points={iso.drawHex(0.96)}
    />
    {/* water body */}
    <polygon
      fill="url(#grad-water-top)"
      stroke="#1a4878"
      strokeWidth={0.45}
      points={iso.drawHex(0.9)}
    />
    <polygon
      fill="url(#grad-water-deep)"
      points={iso.drawHex(0.78)}
    />
    <polygon
      fill="url(#water-caustics)"
      points={iso.drawHex(0.88)}
      opacity={0.7}
    >
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0,0; 2,1; 0,0"
        dur="6s"
        repeatCount="indefinite"
      />
    </polygon>
    {/* foam ring */}
    <polygon
      fill="none"
      stroke="#d8f4ff"
      strokeWidth={0.55}
      opacity={0.45}
      points={iso.drawHex(0.89)}
    />
    {/* ripples */}
    <g opacity={0.55}>
      <ellipse cx={0} cy={0} rx={8} ry={2.4} fill="none" stroke="#e8fcff" strokeWidth={0.45}>
        <animate attributeName="rx" values="4;10;4" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.15;0.5" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx={-3} cy={2} rx={5} ry={1.5} fill="none" stroke="#b8e8ff" strokeWidth={0.35}>
        <animate attributeName="rx" values="3;7;3" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx={4} cy={-2} rx={4.5} ry={1.3} fill="none" stroke="#c8f0ff" strokeWidth={0.3}>
        <animate attributeName="rx" values="2;6;2" dur="3.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0.08;0.35" dur="3.5s" repeatCount="indefinite" />
      </ellipse>
    </g>
    {/* wave crests */}
    <path
      d="M -10 -1 Q -5 -3 0 -1 T 10 0"
      stroke="#f0fcff"
      strokeWidth={0.6}
      fill="none"
      opacity={0.5}
    >
      <animate attributeName="d"
        values="M -10 -1 Q -5 -3 0 -1 T 10 0;M -10 0 Q -5 -2 0 0 T 10 1;M -10 -1 Q -5 -3 0 -1 T 10 0"
        dur="2.8s"
        repeatCount="indefinite"
      />
    </path>
    <path
      d="M -8 3 Q -2 1 4 3 T 9 4"
      stroke="#a0d8f0"
      strokeWidth={0.45}
      fill="none"
      opacity={0.35}
    >
      <animate attributeName="d"
        values="M -8 3 Q -2 1 4 3 T 9 4;M -8 4 Q -2 2 4 4 T 9 5;M -8 3 Q -2 1 4 3 T 9 4"
        dur="3.2s"
        repeatCount="indefinite"
      />
    </path>
    {/* sparkles */}
    <circle cx={-5} cy={-2} r={0.55} fill="#fff" opacity={0.7}>
      <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx={6} cy={1} r={0.4} fill="#e0f8ff" opacity={0.6}>
      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.6s" repeatCount="indefinite" />
    </circle>
    <circle cx={-1} cy={4} r={0.35} fill="#fff" opacity={0.5}>
      <animate attributeName="opacity" values="0.15;0.65;0.15" dur="1.8s" repeatCount="indefinite" />
    </circle>
    {/* reeds at edge */}
    <g opacity={0.65} stroke="#3a5828" strokeWidth={0.45} fill="none">
      <path d={`M ${iso.HEX_POINTS.sw.x * 0.7} ${iso.HEX_POINTS.sw.y * 0.65} q 0.5 -4 1 -5`} />
      <path d={`M ${iso.HEX_POINTS.se.x * 0.65} ${iso.HEX_POINTS.se.y * 0.6} q -0.5 -3.5 -0.8 -4.5`} />
      <path d={`M ${iso.HEX_POINTS.w.x * 0.55} ${iso.HEX_POINTS.w.y * 0.5} q 0.3 -3 0.6 -4`} />
    </g>
  </g>
)

const groundGrass = (
  <polygon fill="url(#grass-tuft)" points={iso.drawHex(1)} opacity={0.6} />
)

const groundDecoration = (
  <g opacity={0.4}>
    <circle cx={-6} cy={2} r={0.65} fill="#2a2218" />
    <circle cx={5} cy={-4} r={0.5} fill="#3d3028" />
    <circle cx={-2} cy={-6} r={0.4} fill="#2a2218" />
    <rect x={3} y={2} width={1.2} height={0.6} fill="#5a4a3a" rx={0.2} transform="rotate(20 3 2)" />
  </g>
)

const forestFloor = (
  <g opacity={0.5}>
    <circle cx={-4} cy={3} r={1.2} fill="#1a3818" />
    <circle cx={5} cy={-2} r={0.9} fill="#224422" />
    <circle cx={0} cy={1} r={1.5} fill="#1a3218" />
  </g>
)

const wallDecoration = (
  <g>
    <g stroke="#6a6a74" strokeWidth={0.35} opacity={0.7}>
      <line x1={-10} y1={-4} x2={10} y2={-4} />
      <line x1={-10} y1={-1} x2={10} y2={-1} />
      <line x1={-10} y1={2} x2={10} y2={2} />
      <line x1={-10} y1={5} x2={10} y2={5} />
    </g>
    <rect x={-3} y={-2} width={2.5} height={1.8} fill="#5a5a62" opacity={0.5} rx={0.2} />
    <rect x={4} y={1} width={2} height={1.5} fill="#4a4a52" opacity={0.45} rx={0.2} />
  </g>
)

const groundTile = isoTile(
  { s: 'wall-ground-s', w: 'wall-ground-w', e: 'wall-ground-e' },
  'url(#grad-ground-top)', '#2a2218', WALL_HEIGHT, groundDecoration, '#c0a888', groundGrass,
)
const wallTile = isoTile(
  { s: 'wall-stone-s', w: 'wall-stone-w', e: 'wall-stone-e' },
  'url(#grad-wall-top)', '#2a2a30', WALL_HEIGHT * 1.55, wallDecoration, '#d0d0dc',
)
const forestTile = isoTile(
  { s: 'wall-forest-s', w: 'wall-forest-w', e: 'wall-forest-e' },
  'url(#grad-forest-top)', '#0e1e0c', WALL_HEIGHT, forestDecoration, '#80c878', forestFloor,
)

const pitOuterWalls = makeWallPolygons(WALL_HEIGHT * 1.1)
const pitInnerWalls = makeWallPolygons(WALL_HEIGHT * 0.65)

/** Crater pit — cracked rim, steep walls, glowing abyss */
const pitTile = (
  <g>
    {/* outer crater walls */}
    <polygon points={pitOuterWalls.south} fill="#3a2818" opacity={0.95} />
    <polygon points={pitOuterWalls.west} fill="#4a3220" opacity={0.95} />
    <polygon points={pitOuterWalls.east} fill="#2a1808" opacity={0.95} />
    {/* cracked earth rim */}
    <polygon
      fill="#6a5848"
      stroke="#3a3028"
      strokeWidth={0.5}
      points={iso.drawHex(1)}
    />
    <g stroke="#4a3828" strokeWidth={0.35} opacity={0.7}>
      <line x1={-8} y1={-2} x2={-4} y2={1} />
      <line x1={2} y1={-4} x2={6} y2={-1} />
      <line x1={-2} y1={4} x2={3} y2={2} />
      <line x1={-6} y1={3} x2={-3} y2={5} />
    </g>
    {/* rim rocks */}
    <g opacity={0.75}>
      <polygon points="-9,-1 -7,2 -5,-1" fill="#5a4a3a" />
      <polygon points="6,-3 9,-1 7,1" fill="#4a3a2a" />
      <polygon points="-3,5 0,7 2,4" fill="#5a4838" />
    </g>
    {/* inner ledge */}
    <polygon
      fill="#4a3828"
      stroke="#2a2018"
      strokeWidth={0.35}
      points={iso.drawHex(0.88)}
    />
    {/* inner pit walls */}
    <g transform={`translate(0, ${WALL_HEIGHT * 0.15})`}>
      <polygon points={pitInnerWalls.south} fill="#2a1008" opacity={0.9} />
      <polygon points={pitInnerWalls.west} fill="#3a1810" opacity={0.9} />
      <polygon points={pitInnerWalls.east} fill="#1a0804" opacity={0.9} />
    </g>
    {/* wall strata lines */}
    <g stroke="#1a0808" strokeWidth={0.25} opacity={0.5}>
      <line x1={-6} y1={2} x2={6} y2={2} />
      <line x1={-5} y1={4} x2={5} y2={4} />
      <line x1={-4} y1={6} x2={4} y2={6} />
    </g>
    {/* stalactite spikes */}
    <g fill="#2a1810" opacity={0.8}>
      <polygon points="-4,0 -3,3 -2,0" />
      <polygon points="1,-1 2,2 3,-1" />
      <polygon points="-1,2 0,4 1,2" />
      <polygon points="4,1 5,3 6,1" />
    </g>
    {/* abyss */}
    <polygon
      fill="url(#grad-pit-depth)"
      stroke="#0a0408"
      strokeWidth={0.35}
      points={iso.drawHex(0.58)}
    />
    <polygon
      fill="url(#grad-pit-glow)"
      points={iso.drawHex(0.45)}
    >
      <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
    </polygon>
    {/* ember core */}
    <ellipse cx={0} cy={2} rx={4} ry={1.2} fill="#ff4820" opacity={0.25}>
      <animate attributeName="opacity" values="0.15;0.4;0.15" dur="2.2s" repeatCount="indefinite" />
    </ellipse>
    <ellipse cx={0} cy={1.5} rx={2} ry={0.6} fill="#ffaa60" opacity={0.35}>
      <animate attributeName="opacity" values="0.2;0.55;0.2" dur="1.6s" repeatCount="indefinite" />
    </ellipse>
    {/* depth shadow */}
    <ellipse cx={0} cy={3} rx={9} ry={2.8} fill="#000" opacity={0.5} />
    {/* warning cracks radiating */}
    <g stroke="#ff6030" strokeWidth={0.3} opacity={0.25}>
      <line x1={0} y1={0} x2={-7} y2={-3} />
      <line x1={0} y1={0} x2={7} y2={-2} />
      <line x1={0} y1={0} x2={-5} y2={5} />
    </g>
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
