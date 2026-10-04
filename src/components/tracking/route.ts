import type { Waypoint } from '@/config/treat'

/**
 * The map is a 400×300 board. The rider follows `actual`, which drifts off the
 * planned route, goes round a roundabout a couple of times and stops for tea.
 */

type Point = { x: number; y: number }
type Segment =
  | { kind: 'line'; from: Point; to: Point }
  | { kind: 'arc'; center: Point; radius: number; start: number; sweep: number }

export const RESTAURANT: Point = { x: 70, y: 70 }
export const HOME: Point = { x: 330, y: 238 }
export const TEA_SHOP: Point = { x: 330, y: 150 }
export const ROUNDABOUT = { x: 262, y: 150, r: 22 }

/** The route a sensible person would take. Drawn dashed. */
export const plannedPath = `M${RESTAURANT.x} ${RESTAURANT.y} H190 V${HOME.y} H${HOME.x}`

const LOOPS = 2.5

const segments: Segment[] = [
  { kind: 'line', from: RESTAURANT, to: { x: 190, y: 70 } },
  { kind: 'line', from: { x: 190, y: 70 }, to: { x: 190, y: 150 } },
  { kind: 'line', from: { x: 190, y: 150 }, to: { x: ROUNDABOUT.x - ROUNDABOUT.r, y: 150 } },
  // Clockwise, as roundabouts go in India. Enters west, leaves east.
  { kind: 'arc', center: ROUNDABOUT, radius: ROUNDABOUT.r, start: Math.PI, sweep: LOOPS * Math.PI * 2 },
  { kind: 'line', from: { x: ROUNDABOUT.x + ROUNDABOUT.r, y: 150 }, to: TEA_SHOP },
  { kind: 'line', from: TEA_SHOP, to: HOME },
]

const lengthOf = (s: Segment) =>
  s.kind === 'line' ? Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y) : Math.abs(s.sweep) * s.radius

const lengths = segments.map(lengthOf)
const starts = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0))
export const totalLength = lengths.reduce((a, b) => a + b, 0)

function arcPoint(s: Extract<Segment, { kind: 'arc' }>, angle: number): Point {
  return { x: s.center.x + Math.cos(angle) * s.radius, y: s.center.y + Math.sin(angle) * s.radius }
}

/** SVG path for the actual route, generated from the same segments as the motion. */
export const actualPath = (() => {
  let d = `M${RESTAURANT.x} ${RESTAURANT.y}`
  for (const s of segments) {
    if (s.kind === 'line') {
      d += ` L${s.to.x} ${s.to.y}`
      continue
    }
    // SVG arcs can't draw full circles, so draw half-turns.
    const halves = Math.round(Math.abs(s.sweep) / Math.PI)
    for (let i = 1; i <= halves; i++) {
      const end = arcPoint(s, s.start + Math.sign(s.sweep) * Math.PI * i)
      d += ` A${s.radius} ${s.radius} 0 0 ${s.sweep > 0 ? 1 : 0} ${round(end.x)} ${round(end.y)}`
    }
  }
  return d
})()

function round(n: number) {
  return Math.round(n * 100) / 100
}

export function pointAt(distance: number): Point {
  const d = Math.min(Math.max(distance, 0), totalLength)
  for (let i = segments.length - 1; i >= 0; i--) {
    if (d < starts[i] && i > 0) continue
    const s = segments[i]
    const t = lengths[i] === 0 ? 0 : (d - starts[i]) / lengths[i]
    if (s.kind === 'line') {
      return { x: s.from.x + (s.to.x - s.from.x) * t, y: s.from.y + (s.to.y - s.from.y) * t }
    }
    return arcPoint(s, s.start + s.sweep * t)
  }
  return RESTAURANT
}

/** Distance along the actual route for each place the rider heads to. */
export const waypointDistance: Record<Waypoint, number> = {
  junction: starts[2],
  roundabout: starts[4],
  teaShop: starts[5],
  nearHome: starts[5] + lengths[5] * 0.62,
  home: totalLength,
}
