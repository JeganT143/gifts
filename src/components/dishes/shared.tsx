import { r1 } from '@/lib/random'

/** All dishes are drawn top-down in a 400×400 box centred on (200, 200). */
export const SIZE = 400
export const CENTER = 200
export const TAU = Math.PI * 2

export type ArtProps = { id: string }

export type DishArtSpec = {
  /** The part you can't eat: plate or bowl. */
  Base: (props: ArtProps) => React.ReactNode
  /** The part bites are taken out of. */
  Food: (props: ArtProps) => React.ReactNode
  /** Radius of the edible area, used for bite placement and progress. */
  radius: number
  /** Colours for the crumbs that fly off a bite. */
  crumbs: string[]
}

/** A smooth, slightly irregular closed shape (Catmull-Rom through jittered points). */
export function blobPath(
  cx: number,
  cy: number,
  radius: number,
  variance: number,
  points: number,
  rand: () => number,
) {
  const pts: [number, number][] = []
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * TAU
    const r = radius * (1 + (rand() * 2 - 1) * variance)
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r])
  }
  const p = (i: number) => pts[(i + points) % points]
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`
  for (let i = 0; i < points; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(p2[0])} ${r1(p2[1])}`
  }
  return `${d}Z`
}

/** Random point inside a disc, evenly distributed. */
export function pointInDisc(rand: () => number, radius: number, cx = CENTER, cy = CENTER) {
  const angle = rand() * TAU
  const distance = Math.sqrt(rand()) * radius
  return { x: cx + Math.cos(angle) * distance, y: cy + Math.sin(angle) * distance, angle, distance }
}

/** The ceramic plate shared by most dishes. */
export function Plate({ id }: ArtProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-plate`} cx="46%" cy="40%" r="62%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.7" stopColor="#FBF8F2" />
          <stop offset="1" stopColor="#E4DACA" />
        </radialGradient>
        <radialGradient id={`${id}-well`} cx="50%" cy="46%" r="55%">
          <stop offset="0" stopColor="#FFFEFB" />
          <stop offset="1" stopColor="#EEE6D8" />
        </radialGradient>
      </defs>
      <circle cx={CENTER} cy={CENTER} r={196} fill={`url(#${id}-plate)`} />
      <circle cx={CENTER} cy={CENTER} r={195} fill="none" stroke="#6B4A22" strokeOpacity={0.1} strokeWidth={2} />
      <circle cx={CENTER} cy={CENTER} r={152} fill={`url(#${id}-well)`} />
      <circle cx={CENTER} cy={CENTER} r={152} fill="none" stroke="#9C7A4A" strokeOpacity={0.2} strokeWidth={1.5} />
      <path
        d="M58 136 A 152 152 0 0 1 150 42"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.95}
      />
    </>
  )
}

/** Soft contact shadow under the food. Part of the food so it disappears as you eat. */
export function FoodShadow({ id, radius }: ArtProps & { radius: number }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0.7" stopColor="#5A3A12" stopOpacity={0.22} />
          <stop offset="1" stopColor="#5A3A12" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={CENTER + 4} cy={CENTER + 10} r={radius + 12} fill={`url(#${id}-shadow)`} />
    </>
  )
}

export function Leaf({
  x,
  y,
  size,
  rotate,
  fill = '#3E8E3F',
  vein = '#2A6A2C',
}: {
  x: number
  y: number
  size: number
  rotate: number
  fill?: string
  vein?: string
}) {
  return (
    <g transform={`translate(${r1(x)} ${r1(y)}) rotate(${r1(rotate)}) scale(${r1(size / 10)})`}>
      <path d="M0 -10 C7 -5 7 5 0 10 C-7 5 -7 -5 0 -10Z" fill={fill} />
      <path d="M0 -8 L0 8" stroke={vein} strokeWidth={0.9} strokeLinecap="round" />
    </g>
  )
}
