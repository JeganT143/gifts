import { memo, useId } from 'react'
import type { DishArt } from '@/config/treat'
import { r1, seeded } from '@/lib/random'
import { dishArt } from './art'
import { blobPath, CENTER, pointInDisc, SIZE, TAU, type DishArtSpec } from './shared'

export type Bite = { x: number; y: number; r: number; seed: number }

/** The circles that make up one bite: a round chunk edged with shallow tooth marks. */
function biteCircles({ x, y, r, seed }: Bite) {
  const rand = seeded(seed)
  const teeth = 11
  const offset = rand() * TAU
  return [
    { cx: x, cy: y, r: r * 0.9 },
    ...Array.from({ length: teeth }, (_, i) => {
      const angle = offset + (i / teeth) * TAU
      return { cx: x + Math.cos(angle) * r * 0.76, cy: y + Math.sin(angle) * r * 0.76, r: r * (0.28 + rand() * 0.06) }
    }),
  ]
}

/** Cut-out used in the mask. */
const BiteShape = memo(function BiteShape(bite: Bite) {
  return (
    <g fill="#000">
      {biteCircles(bite).map((c, i) => (
        <circle key={i} {...c} />
      ))}
    </g>
  )
})

/*
 * The bitten edge of the food. Strokes straddle the bite outline; the mask
 * removes the inner half, leaving a darker rim that gives the food some depth.
 */
const BiteRim = memo(function BiteRim({ bite, color }: { bite: Bite; color: string }) {
  const circles = biteCircles(bite)
  return (
    <g fill="none" stroke={color}>
      {circles.map((c, i) => (
        <circle key={`s${i}`} {...c} strokeWidth={16} strokeOpacity={0.12} />
      ))}
      {circles.map((c, i) => (
        <circle key={`e${i}`} {...c} strokeWidth={5} strokeOpacity={0.5} />
      ))}
    </g>
  )
})

/** What's left on the plate under the food: a smear and a few crumbs. */
const residue = new Map<DishArt, { stain: string; crumbs: { x: number; y: number; r: number; fill: string }[] }>()
function residueFor(dish: DishArt, spec: DishArtSpec) {
  let found = residue.get(dish)
  if (!found) {
    const rand = seeded(dish.length * 101 + 13)
    found = {
      stain: blobPath(CENTER, CENTER, spec.radius * 0.78, 0.14, 11, rand),
      crumbs: Array.from({ length: 18 }, (_, i) => {
        const p = pointInDisc(rand, spec.radius * 0.88)
        return { x: r1(p.x), y: r1(p.y), r: r1(1.6 + rand() * 2.4), fill: spec.crumbs[i % spec.crumbs.length] }
      }),
    }
    residue.set(dish, found)
  }
  return found
}

type Props = {
  dish: DishArt
  bites?: Bite[]
  /** Fades out whatever food is left. */
  finished?: boolean
  className?: string
}

/** A dish on its plate. Purely visual; interaction lives in the parent. */
export function DishPlate({ dish, bites = [], finished = false, className }: Props) {
  const id = `d${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const spec = dishArt[dish]
  const { Base, Food } = spec
  const masked = bites.length > 0
  const leftovers = masked ? residueFor(dish, spec) : null

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} aria-hidden="true" focusable="false">
      <Base id={id} />
      {leftovers && (
        <g>
          <path d={leftovers.stain} fill={spec.stain} opacity={finished ? 0.07 : 0.16} style={{ transition: 'opacity 900ms ease' }} />
          <g opacity={finished ? 0 : 0.9} style={{ transition: 'opacity 900ms ease' }}>
            {leftovers.crumbs.map((c, i) => (
              <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={c.fill} />
            ))}
          </g>
        </g>
      )}
      {masked && (
        <mask id={`${id}-bites`} maskUnits="userSpaceOnUse" x={0} y={0} width={SIZE} height={SIZE}>
          <rect width={SIZE} height={SIZE} fill="#fff" />
          {bites.map((bite) => (
            <BiteShape key={bite.seed} {...bite} />
          ))}
        </mask>
      )}
      <g
        mask={masked ? `url(#${id}-bites)` : undefined}
        style={{ opacity: finished ? 0 : 1, transition: 'opacity 700ms ease' }}
      >
        <MemoFood Food={Food} id={id} />
        {masked && (
          <g clipPath={`url(#${id}-food)`}>
            {bites.map((bite) => (
              <BiteRim key={bite.seed} bite={bite} color={spec.edge} />
            ))}
          </g>
        )}
      </g>
      {masked && (
        <clipPath id={`${id}-food`}>
          <spec.Silhouette />
        </clipPath>
      )}
    </svg>
  )
}

/* The food itself never changes once drawn, so don't re-render hundreds of grains per bite. */
const MemoFood = memo(function MemoFood({ Food, id }: { Food: DishArtSpec['Food']; id: string }) {
  return <>{Food({ id })}</>
})
