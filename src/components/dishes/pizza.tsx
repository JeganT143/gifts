import { r1, seeded } from '@/lib/random'
import { blobPath, CENTER, FoodShadow, Plate, pointInDisc, TAU, type ArtProps, type DishArtSpec } from './shared'

const RADIUS = 146
const rand = seeded(9031)

const cheese = blobPath(CENTER, CENTER, 121, 0.04, 26, rand)

const sauceSpots = Array.from({ length: 16 }, () => {
  const p = pointInDisc(rand, 108)
  return blobPath(p.x, p.y, 4 + rand() * 6, 0.3, 7, rand)
})

const browned = Array.from({ length: 26 }, () => {
  const p = pointInDisc(rand, 112)
  return { d: blobPath(p.x, p.y, 2.5 + rand() * 5, 0.3, 6, rand), fill: rand() > 0.6 ? '#C9822F' : '#E3A84A' }
})

const crustChar = Array.from({ length: 26 }, () => {
  const angle = rand() * TAU
  const distance = 132 + rand() * 9
  return { x: r1(CENTER + Math.cos(angle) * distance), y: r1(CENTER + Math.sin(angle) * distance), r: r1(1.5 + rand() * 3) }
})

/* Toppings are spread out so no two land on top of each other. */
function scatter(count: number, minGap: number, maxRadius: number) {
  const placed: { x: number; y: number; rotate: number }[] = []
  let guard = 0
  while (placed.length < count && guard++ < 2000) {
    const p = pointInDisc(rand, maxRadius)
    if (placed.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < minGap)) continue
    placed.push({ x: r1(p.x), y: r1(p.y), rotate: Math.round(rand() * 360) })
  }
  return placed
}

const toppings = scatter(30, 30, 104)
const paneer = toppings.slice(0, 9)
const capsicum = toppings.slice(9, 19)
const olives = toppings.slice(19, 30)

function Pizza({ id }: ArtProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-crust`} cx="50%" cy="50%" r="50%">
          <stop offset="0.82" stopColor="#E9B465" />
          <stop offset="0.93" stopColor="#D8963F" />
          <stop offset="1" stopColor="#B26D27" />
        </radialGradient>
        <radialGradient id={`${id}-cheese`} cx="44%" cy="40%" r="62%">
          <stop offset="0" stopColor="#FCEBB0" />
          <stop offset="1" stopColor="#F1C65A" />
        </radialGradient>
      </defs>

      <FoodShadow id={id} radius={RADIUS - 4} />
      <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={`url(#${id}-crust)`} />
      {crustChar.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="#8E5320" opacity={0.45} />
      ))}
      <circle cx={CENTER} cy={CENTER} r={127} fill="#C63B22" />
      <path d={cheese} fill={`url(#${id}-cheese)`} />
      {sauceSpots.map((d, i) => (
        <path key={i} d={d} fill="#CF4524" opacity={0.85} />
      ))}
      {browned.map((b, i) => (
        <path key={i} d={b.d} fill={b.fill} opacity={0.75} />
      ))}

      {paneer.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.rotate})`}>
          <rect x={-8} y={-8} width={16} height={16} rx={3} fill="#FFF7E6" stroke="#DDB06E" strokeWidth={1.2} />
          <path d="M-5 -2 L1 -6 M-2 5 L5 1" stroke="#B5722C" strokeWidth={1.6} strokeLinecap="round" />
        </g>
      ))}
      {capsicum.map((p, i) => (
        <path
          key={i}
          d="M-9 2 Q0 -9 9 2"
          transform={`translate(${p.x} ${p.y}) rotate(${p.rotate})`}
          fill="none"
          stroke="#3D8A38"
          strokeWidth={4.5}
          strokeLinecap="round"
        />
      ))}
      {olives.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill="none" stroke="#2A2320" strokeWidth={3.6} />
      ))}

      <g stroke="#7A3714" strokeOpacity={0.22} strokeWidth={2}>
        {[0, 60, 120].map((deg) => (
          <path key={deg} d={`M${CENTER - RADIUS} ${CENTER} H${CENTER + RADIUS}`} transform={`rotate(${deg} ${CENTER} ${CENTER})`} />
        ))}
      </g>
    </>
  )
}

export const pizza: DishArtSpec = {
  Base: Plate,
  Food: Pizza,
  radius: RADIUS,
  crumbs: ['#E9B465', '#F1C65A', '#C63B22', '#3D8A38'],
}
