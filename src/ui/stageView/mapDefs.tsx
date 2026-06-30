/** Shared SVG gradients, filters and animations for the battle map */
export default function MapDefs() {
  return (
    <defs>
      <radialGradient id="grad-ground-top" cx="38%" cy="28%" r="75%">
        <stop offset="0%" stopColor="#9a8268" />
        <stop offset="45%" stopColor="#6b5848" />
        <stop offset="100%" stopColor="#3a3028" />
      </radialGradient>
      <radialGradient id="grad-water-top" cx="44%" cy="26%" r="72%">
        <stop offset="0%" stopColor="#7ecdf0" />
        <stop offset="35%" stopColor="#3a8ec4" />
        <stop offset="75%" stopColor="#1a5890" />
        <stop offset="100%" stopColor="#0a2848" />
      </radialGradient>
      <radialGradient id="grad-water-deep" cx="50%" cy="55%" r="50%">
        <stop offset="0%" stopColor="#1a6898" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#051828" stopOpacity="0.9" />
      </radialGradient>
      <radialGradient id="grad-forest-top" cx="40%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#68a860" />
        <stop offset="55%" stopColor="#3d6b38" />
        <stop offset="100%" stopColor="#1a3218" />
      </radialGradient>
      <radialGradient id="grad-wall-top" cx="34%" cy="24%" r="76%">
        <stop offset="0%" stopColor="#b0b0bc" />
        <stop offset="50%" stopColor="#7a7a86" />
        <stop offset="100%" stopColor="#3a3a42" />
      </radialGradient>
      <radialGradient id="grad-pit-depth" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stopColor="#4a1828" />
        <stop offset="35%" stopColor="#1a0818" />
        <stop offset="70%" stopColor="#080410" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>
      <radialGradient id="grad-pit-glow" cx="50%" cy="60%" r="40%">
        <stop offset="0%" stopColor="#ff6030" stopOpacity="0.35" />
        <stop offset="50%" stopColor="#cc2810" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#000" stopOpacity="0" />
      </radialGradient>

      <linearGradient id="wall-ground-s" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4a3d32" />
        <stop offset="100%" stopColor="#4a3d32" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="wall-ground-w" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5a4a3a" />
        <stop offset="100%" stopColor="#5a4a3a" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="wall-ground-e" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2a2218" />
        <stop offset="100%" stopColor="#2a2218" stopOpacity="0" />
      </linearGradient>

      <linearGradient id="wall-water-s" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#143a5c" />
        <stop offset="100%" stopColor="#143a5c" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="wall-water-w" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a5080" />
        <stop offset="100%" stopColor="#1a5080" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="wall-water-e" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0a1828" />
        <stop offset="100%" stopColor="#0a1828" stopOpacity="0" />
      </linearGradient>

      <linearGradient id="wall-forest-s" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a3218" />
        <stop offset="100%" stopColor="#1a3218" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="wall-forest-w" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2a4a28" />
        <stop offset="100%" stopColor="#2a4a28" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="wall-forest-e" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0e1e0c" />
        <stop offset="100%" stopColor="#0e1e0c" stopOpacity="0" />
      </linearGradient>

      <linearGradient id="wall-stone-s" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4a4a54" />
        <stop offset="100%" stopColor="#4a4a54" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="wall-stone-w" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5a5a64" />
        <stop offset="100%" stopColor="#5a5a64" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="wall-stone-e" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2e2e34" />
        <stop offset="100%" stopColor="#2e2e34" stopOpacity="0" />
      </linearGradient>

      <filter id="unitShadow" x="-80%" y="-80%" width="260%" height="260%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.65" />
      </filter>
      <filter id="unitGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#e8dcc8" floodOpacity="0.35" />
        <feDropShadow dx="0" dy="0" stdDeviation="0.5" floodColor="#fff" floodOpacity="0.2" />
      </filter>
      <filter id="selectedRing" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <pattern id="hex-noise" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="0.5" fill="#000" opacity="0.07" />
        <circle cx="5" cy="4" r="0.4" fill="#fff" opacity="0.05" />
        <circle cx="3" cy="6.5" r="0.35" fill="#000" opacity="0.04" />
      </pattern>
      <pattern id="water-caustics" width="16" height="16" patternUnits="userSpaceOnUse">
        <path d="M0 8 Q4 4 8 8 T16 8" stroke="#b8ecff" strokeWidth="0.5" fill="none" opacity="0.15" />
        <path d="M0 12 Q4 8 8 12 T16 12" stroke="#d0f4ff" strokeWidth="0.4" fill="none" opacity="0.1" />
      </pattern>
      <pattern id="grass-tuft" width="12" height="12" patternUnits="userSpaceOnUse">
        <path d="M2 10 Q2 6 3 4" stroke="#3a5028" strokeWidth="0.4" fill="none" opacity="0.4" />
        <path d="M6 11 Q6 7 7 5" stroke="#4a6038" strokeWidth="0.35" fill="none" opacity="0.35" />
        <path d="M10 10 Q10 6 9 4" stroke="#3a5028" strokeWidth="0.4" fill="none" opacity="0.4" />
      </pattern>
    </defs>
  )
}
