import { r1, seeded } from '@/lib/random'
import { CENTER, pointInDisc, TAU, type ArtProps, type DishArtSpec } from './shared'

const RADIUS = 126
const rand = seeded(2718)

/* Five jamuns: four around the edge, one in the middle. */
const balls = [
  ...Array.from({ length: 4 }, (_, i) => {
    const angle = (i / 4) * TAU + 0.5
    return { x: CENTER + Math.cos(angle) * 74, y: CENTER + Math.sin(angle) * 74, r: 34 }
  }),
  { x: CENTER + 2, y: CENTER - 2, r: 31 },
].map((b) => ({ x: r1(b.x), y: r1(b.y), r: b.r }))

const pistachio = Array.from({ length: 14 }, () => {
  const p = pointInDisc(rand, 100)
  return { x: r1(p.x), y: r1(p.y), rotate: Math.round(rand() * 180), fill: rand() > 0.5 ? '#A9CB6A' : '#7FA846' }
})

const saffron = Array.from({ length: 9 }, () => {
  const p = pointInDisc(rand, 104)
  const angle = rand() * TAU
  return {
    d: `M${r1(p.x)} ${r1(p.y)} l${r1(Math.cos(angle) * 9)} ${r1(Math.sin(angle) * 9)}`,
  }
})

/** A white bowl instead of a plate. Stays behind when the jamuns are gone. */
function Bowl({ id }: ArtProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-bowl`} cx="46%" cy="40%" r="62%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.8" stopColor="#F7F2EA" />
          <stop offset="1" stopColor="#DCD1BF" />
        </radialGradient>
        <radialGradient id={`${id}-floor`} cx="52%" cy="56%" r="55%">
          <stop offset="0" stopColor="#FBF6EE" />
          <stop offset="1" stopColor="#E3D7C4" />
        </radialGradient>
      </defs>
      <circle cx={CENTER} cy={CENTER} r={176} fill={`url(#${id}-bowl)`} />
      <circle cx={CENTER} cy={CENTER} r={175} fill="none" stroke="#6B4A22" strokeOpacity={0.12} strokeWidth={2} />
      <circle cx={CENTER} cy={CENTER} r={150} fill={`url(#${id}-floor)`} />
      <circle cx={CENTER} cy={CENTER} r={150} fill="none" stroke="#9C7A4A" strokeOpacity={0.25} strokeWidth={2} />
      <path d="M70 140 A 150 150 0 0 1 160 56" fill="none" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" />
    </>
  )
}

function Jamun({ id }: ArtProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-syrup`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#F2B451" />
          <stop offset="0.85" stopColor="#D48A26" />
          <stop offset="1" stopColor="#B86F17" />
        </radialGradient>
        <radialGradient id={`${id}-ball`} cx="36%" cy="32%" r="72%">
          <stop offset="0" stopColor="#B9622C" />
          <stop offset="0.5" stopColor="#7E2E12" />
          <stop offset="1" stopColor="#4A1709" />
        </radialGradient>
      </defs>

      <circle cx={CENTER} cy={CENTER} r={RADIUS + 20} fill={`url(#${id}-syrup)`} />
      <ellipse cx={150} cy={120} rx={46} ry={16} fill="#FFF3D1" opacity={0.35} transform="rotate(-38 150 120)" />

      {balls.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r={b.r + 4} fill="none" stroke="#F8CB72" strokeOpacity={0.55} strokeWidth={3} />
          <circle cx={b.x + 3} cy={b.y + 5} r={b.r} fill="#5A2A08" opacity={0.25} />
          <circle cx={b.x} cy={b.y} r={b.r} fill={`url(#${id}-ball)`} />
          <ellipse
            cx={b.x - b.r * 0.38}
            cy={b.y - b.r * 0.42}
            rx={b.r * 0.32}
            ry={b.r * 0.16}
            fill="#FFE2BC"
            opacity={0.5}
            transform={`rotate(-35 ${b.x - b.r * 0.38} ${b.y - b.r * 0.42})`}
          />
        </g>
      ))}

      {pistachio.map((p, i) => (
        <rect
          key={i}
          x={p.x - 5}
          y={p.y - 2}
          width={10}
          height={4}
          rx={2}
          fill={p.fill}
          transform={`rotate(${p.rotate} ${p.x} ${p.y})`}
        />
      ))}
      <g stroke="#D9480F" strokeWidth={1.4} strokeLinecap="round">
        {saffron.map((s, i) => (
          <path key={i} d={s.d} />
        ))}
      </g>
    </>
  )
}

export const jamun: DishArtSpec = {
  Base: Bowl,
  Food: Jamun,
  Silhouette: () => <circle cx={CENTER} cy={CENTER} r={RADIUS + 20} />,
  radius: RADIUS + 20,
  crumbs: ['#7E2E12', '#B9622C', '#F2B451', '#A9CB6A'],
  edge: '#4A1709',
  stain: '#D48A26',
}
