import { r1, seeded } from '@/lib/random'
import { blobPath, FoodShadow, Leaf, Plate, pointInDisc, type ArtProps, type DishArtSpec } from './shared'

const RADIUS = 150
const rand = seeded(4410)

/* Two flaky parottas, one on top of the other, and a bowl of salna. */
const breads = [
  { cx: 178, cy: 220, r: 106 },
  { cx: 206, cy: 196, r: 108 },
].map((bread) => ({
  ...bread,
  outline: blobPath(bread.cx, bread.cy, bread.r, 0.05, 16, rand),
  layers: [0.84, 0.66, 0.48, 0.3].map((k) => blobPath(bread.cx + 2, bread.cy - 1, bread.r * k, 0.08, 13, rand)),
  char: Array.from({ length: 34 }, () => {
    const p = pointInDisc(rand, bread.r * 0.92, bread.cx, bread.cy)
    return { d: blobPath(p.x, p.y, 2.5 + rand() * 5.5, 0.35, 6, rand), opacity: r1(0.3 + rand() * 0.4) }
  }),
}))

const bowl = { cx: 284, cy: 124, r: 44 }
const oil = Array.from({ length: 12 }, () => {
  const p = pointInDisc(rand, 30, bowl.cx, bowl.cy)
  return { x: r1(p.x), y: r1(p.y), r: r1(1.2 + rand() * 2.8) }
})
const chunks = Array.from({ length: 5 }, () => {
  const p = pointInDisc(rand, 24, bowl.cx, bowl.cy)
  return blobPath(p.x, p.y, 4 + rand() * 3, 0.3, 6, rand)
})

function Parotta({ id }: ArtProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-bread`} cx="45%" cy="42%" r="62%">
          <stop offset="0" stopColor="#F8DC9C" />
          <stop offset="0.55" stopColor="#E8AF58" />
          <stop offset="1" stopColor="#C07A2E" />
        </radialGradient>
        <radialGradient id={`${id}-steel`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#F4F5F6" />
          <stop offset="0.6" stopColor="#C9CDD1" />
          <stop offset="1" stopColor="#8E949A" />
        </radialGradient>
        <radialGradient id={`${id}-salna`} cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#E3923A" />
          <stop offset="1" stopColor="#A4501A" />
        </radialGradient>
      </defs>

      <FoodShadow id={id} radius={112} />

      {breads.map((bread, i) => (
        <g key={i}>
          <path d={bread.outline} fill={`url(#${id}-bread)`} stroke="#B07433" strokeOpacity={0.45} strokeWidth={2} />
          <g fill="none" strokeLinecap="round">
            {bread.layers.map((d, j) => (
              <g key={j}>
                <path d={d} stroke="#9A5A22" strokeOpacity={0.5} strokeWidth={2.8} />
                <path d={d} stroke="#FFF2D2" strokeOpacity={0.6} strokeWidth={1.6} transform="translate(-2 -2)" />
              </g>
            ))}
          </g>
          {bread.char.map((spot, j) => (
            <path key={j} d={spot.d} fill="#86481A" opacity={spot.opacity} />
          ))}
        </g>
      ))}

      <circle cx={bowl.cx + 3} cy={bowl.cy + 6} r={bowl.r + 2} fill="#5A3A12" opacity={0.18} />
      <circle cx={bowl.cx} cy={bowl.cy} r={bowl.r} fill={`url(#${id}-steel)`} />
      <circle cx={bowl.cx} cy={bowl.cy} r={bowl.r - 5} fill="none" stroke="#7D838A" strokeWidth={1.5} />
      <circle cx={bowl.cx} cy={bowl.cy} r={bowl.r - 8} fill={`url(#${id}-salna)`} />
      {chunks.map((d, i) => (
        <path key={i} d={d} fill="#6E2C0E" opacity={0.75} />
      ))}
      {oil.map((drop, i) => (
        <circle key={i} cx={drop.x} cy={drop.y} r={drop.r} fill="#F7B54A" opacity={0.7} />
      ))}
      <Leaf x={bowl.cx - 12} y={bowl.cy + 10} size={8} rotate={40} fill="#2F6B2A" vein="#1F4D1C" />
      <Leaf x={bowl.cx + 14} y={bowl.cy - 8} size={7} rotate={-30} fill="#2F6B2A" vein="#1F4D1C" />
    </>
  )
}

export const parotta: DishArtSpec = {
  Base: Plate,
  Food: Parotta,
  Silhouette: () => (
    <>
      {breads.map((bread, i) => (
        <path key={i} d={bread.outline} />
      ))}
      <circle cx={bowl.cx} cy={bowl.cy} r={bowl.r} />
    </>
  ),
  radius: RADIUS,
  crumbs: ['#F6D89A', '#E7B566', '#C98A3C', '#A4501A'],
  edge: '#9C5E22',
  stain: '#D9822B',
}
