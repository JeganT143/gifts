import { r1, seeded } from '@/lib/random'
import { blobPath, CENTER, FoodShadow, Leaf, Plate, pointInDisc, TAU, type ArtProps, type DishArtSpec } from './shared'

const RADIUS = 128
const rand = seeded(1207)

const mound = blobPath(CENTER, CENTER, RADIUS - 4, 0.045, 20, rand)

/* Rice: mostly white grains with patches of saffron, like the real thing. */
const grains = Array.from({ length: 470 }, () => {
  const { x, y, angle, distance } = pointInDisc(rand, RADIUS - 10)
  const patch = 0.5 + 0.5 * Math.sin(angle * 3 + 0.8) * Math.cos(distance / 26)
  const roll = rand()
  let fill = '#FFF9EC'
  if (roll < 0.06 + patch * 0.16) fill = '#E5801F'
  else if (roll < 0.16 + patch * 0.3) fill = '#F4B13E'
  else if (roll > 0.9) fill = '#F3DFB8'
  return { x: r1(x), y: r1(y), rotate: Math.round(rand() * 180), length: r1(5.6 + rand() * 2.6), fill }
})

const onions = Array.from({ length: 30 }, () => {
  const { x, y } = pointInDisc(rand, RADIUS - 18)
  const angle = rand() * TAU
  const length = 7 + rand() * 7
  const bend = (rand() - 0.5) * 9
  const dx = Math.cos(angle) * length
  const dy = Math.sin(angle) * length
  return {
    d: `M${r1(x)} ${r1(y)} q${r1(dx / 2 - dy * 0.2 + bend)} ${r1(dy / 2 + dx * 0.2)} ${r1(dx)} ${r1(dy)}`,
    stroke: rand() > 0.4 ? '#7A3B12' : '#A85A1E',
  }
})

const leaves = Array.from({ length: 9 }, () => {
  const { x, y } = pointInDisc(rand, RADIUS - 24)
  return { x, y, size: 7 + rand() * 4, rotate: rand() * 360 }
})

const pieces = [
  { x: 160, y: 158, r: 30, rotate: -20, scale: [1.25, 0.86] },
  { x: 246, y: 176, r: 27, rotate: 35, scale: [1.2, 0.9] },
].map((piece) => ({
  ...piece,
  body: blobPath(0, 0, piece.r, 0.16, 9, rand),
  highlight: blobPath(-piece.r * 0.25, -piece.r * 0.3, piece.r * 0.42, 0.2, 7, rand),
  spots: Array.from({ length: 6 }, () => pointInDisc(rand, piece.r * 0.75, 0, 0)),
}))

const drumstick = {
  body: blobPath(0, 0, 30, 0.1, 10, rand),
  spots: Array.from({ length: 7 }, () => pointInDisc(rand, 22, 0, 0)),
}

function Biryani({ id }: ArtProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-rice`} cx="45%" cy="42%" r="60%">
          <stop offset="0" stopColor="#FBEBC6" />
          <stop offset="0.75" stopColor="#F0CF8A" />
          <stop offset="1" stopColor="#DFAF5E" />
        </radialGradient>
        <radialGradient id={`${id}-meat`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#DE6E33" />
          <stop offset="0.55" stopColor="#B23F17" />
          <stop offset="1" stopColor="#74220B" />
        </radialGradient>
        <radialGradient id={`${id}-yolk`} cx="40%" cy="38%" r="65%">
          <stop offset="0" stopColor="#FFD35C" />
          <stop offset="1" stopColor="#E8930C" />
        </radialGradient>
      </defs>

      <FoodShadow id={id} radius={RADIUS - 6} />
      <path d={mound} fill={`url(#${id}-rice)`} />

      <g stroke="#B88A4A" strokeOpacity={0.35} strokeWidth={0.6}>
        {grains.map((g, i) => (
          <ellipse
            key={i}
            cx={g.x}
            cy={g.y}
            rx={g.length / 2}
            ry={1.5}
            fill={g.fill}
            transform={`rotate(${g.rotate} ${g.x} ${g.y})`}
          />
        ))}
      </g>

      <g fill="none" strokeWidth={2.4} strokeLinecap="round">
        {onions.map((o, i) => (
          <path key={i} d={o.d} stroke={o.stroke} />
        ))}
      </g>

      {pieces.map((piece, i) => (
        <g
          key={i}
          transform={`translate(${piece.x} ${piece.y}) rotate(${piece.rotate}) scale(${piece.scale[0]} ${piece.scale[1]})`}
        >
          <path d={piece.body} fill={`url(#${id}-meat)`} />
          <path d={piece.highlight} fill="#F0915A" opacity={0.55} />
          {piece.spots.map((s, j) => (
            <circle key={j} cx={r1(s.x)} cy={r1(s.y)} r={1.6 + (j % 3)} fill="#5A1F0A" opacity={0.45} />
          ))}
        </g>
      ))}

      {/* The leg piece. Bone first, so the meat sits on top of it. */}
      <g transform="translate(182 256) rotate(160)">
        <rect x={20} y={-6} width={44} height={12} rx={6} fill="#F1E3C8" stroke="#CDB58F" strokeWidth={1.2} />
        <circle cx={64} cy={-6} r={8} fill="#F6EBD6" stroke="#CDB58F" strokeWidth={1.2} />
        <circle cx={64} cy={6} r={8} fill="#F6EBD6" stroke="#CDB58F" strokeWidth={1.2} />
        <g transform="scale(1.35 0.95)">
          <path d={drumstick.body} fill={`url(#${id}-meat)`} />
          {drumstick.spots.map((s, j) => (
            <circle key={j} cx={r1(s.x)} cy={r1(s.y)} r={1.5 + (j % 3)} fill="#5A1F0A" opacity={0.45} />
          ))}
        </g>
        <ellipse cx={-10} cy={12} rx={16} ry={7} fill="#EFAE78" opacity={0.45} />
      </g>

      {/* Half a boiled egg. */}
      <g transform="translate(262 238) rotate(-12)">
        <ellipse rx={26} ry={21} fill="#FFFDF6" stroke="#E6D9BE" strokeWidth={1.5} />
        <circle cx={1} cy={1} r={12} fill={`url(#${id}-yolk)`} />
      </g>

      {leaves.map((leaf, i) => (
        <Leaf key={i} {...leaf} />
      ))}

      {/* Lemon wedge on the side. */}
      <g transform="translate(270 118) rotate(-140)">
        <path d="M-24 0 A24 24 0 0 0 24 0Z" fill="#F7E07A" />
        <path d="M-24 0 A24 24 0 0 0 24 0" fill="none" stroke="#E2BE2B" strokeWidth={4} />
        <g stroke="#FFF6C4" strokeWidth={1.4}>
          <path d="M0 2 L-15 15" />
          <path d="M0 2 L0 20" />
          <path d="M0 2 L15 15" />
        </g>
      </g>
    </>
  )
}

export const biryani: DishArtSpec = {
  Base: Plate,
  Food: Biryani,
  radius: RADIUS,
  crumbs: ['#FFF9EC', '#F4B13E', '#E5801F', '#AE4B1F'],
}
