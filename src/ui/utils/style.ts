const colors = {
  bg: '#0c0e14',
  surface: '#161a24',
  surfaceLight: '#222836',
  panel: '#1c2130',

  text: '#e8dcc8',
  textMuted: '#9a8f7e',

  gold: '#d4a84b',
  goldDark: '#8a6420',

  accent: '#5eb8c9',
  accentDim: '#2d6a75',

  hp: '#c94a3d',
  mp: '#4a9e3d',
  mana: '#6a8fc9',

  grey: '#5c6370',
  darkGrey: '#0c0e14',
  pink: '#e8dcc8',
  violet: '#6a8fc9',
  red: '#c94a3d',
  yellow: '#d4a84b',
  green: '#4a9e3d',
}

export default {
  ...colors,

  textColor: colors.text,
  border: `3px solid ${colors.goldDark}`,
  borderAccent: `1px solid ${colors.gold}`,

  hpColor: colors.hp,
  mpColor: colors.mp,
  manaColor: colors.mana,

  overlay: {
    selected: 'rgba(212, 168, 75, 0.35)',
    selectedStroke: colors.gold,
    hover: 'rgba(94, 184, 201, 0.2)',
    hoverStroke: colors.accent,
    moveTarget: 'rgba(232, 220, 200, 0.18)',
    moveStroke: 'rgba(232, 220, 200, 0.45)',
    target: 'rgba(201, 74, 61, 0.28)',
    targetStroke: colors.hp,
    areaOfEffect: 'rgba(201, 74, 61, 0.38)',
  },

  mapVoid: '#080a10',
}
