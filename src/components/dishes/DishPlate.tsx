import { memo, useId } from 'react'
import type { DishArt } from '@/config/treat'
import { seeded } from '@/lib/random'
import { dishArt } from './art'
import { SIZE, TAU, type DishArtSpec } from './shared'

export type Bite = { x: number; y: number; r: number; seed: number }

/** A bite: a round chunk whose edge is a ring of shallow tooth marks. */
const BiteShape = memo(function BiteShape({ x, y, r, seed }: Bite) {
  const rand = seeded(seed)
  const teeth = 11
  const offset = rand() * TAU
  return (
    <g fill="#000">
      <circle cx={x} cy={y} r={r * 0.9} />
      {Array.from({ length: teeth }, (_, i) => {
        const angle = offset + (i / teeth) * TAU
        return (
          <circle
            key={i}
            cx={x + Math.cos(angle) * r * 0.76}
            cy={y + Math.sin(angle) * r * 0.76}
            r={r * (0.28 + rand() * 0.06)}
          />
        )
      })}
    </g>
  )
})

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
  const { Base, Food } = dishArt[dish]
  const masked = bites.length > 0

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} aria-hidden="true" focusable="false">
      <Base id={id} />
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
      </g>
    </svg>
  )
}

/* The food itself never changes once drawn, so don't re-render hundreds of grains per bite. */
const MemoFood = memo(function MemoFood({ Food, id }: { Food: DishArtSpec['Food']; id: string }) {
  return <>{Food({ id })}</>
})
