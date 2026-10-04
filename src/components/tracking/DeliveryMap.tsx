'use client'

import { useEffect, useRef } from 'react'
import { copy, site, trackingSteps } from '@/config/treat'
import { seeded } from '@/lib/random'
import { usePrefersReducedMotion } from '@/lib/useTimeline'
import {
  actualPath,
  HOME,
  plannedPath,
  pointAt,
  RESTAURANT,
  ROUNDABOUT,
  totalLength,
  waypointDistance,
} from './route'
import styles from './DeliveryMap.module.css'

type Props = {
  index: number
  elapsed: React.RefObject<number>
  starts: number[]
  homeLabel: string
}

const LAND = '#F2E9D8'
const RIDER_SPEED = 0.092 // map units per millisecond

/* City blocks between the roads, each with a building or two. */
const XS = [-10, 70, 190, 262, 330, 410]
const YS = [-10, 70, 150, 238, 310]
const buildings = (() => {
  const rand = seeded(77)
  const out: { x: number; y: number; w: number; h: number }[] = []
  for (let i = 0; i < XS.length - 1; i++) {
    for (let j = 0; j < YS.length - 1; j++) {
      const isPark = XS[i] === 70 && YS[j] === 150
      const isLake = XS[i] === -10 && YS[j] >= 150
      if (isPark || isLake) continue
      const x0 = XS[i] + 13
      const y0 = YS[j] + 13
      const w = XS[i + 1] - XS[i] - 26
      const h = YS[j + 1] - YS[j] - 26
      if (w < 12 || h < 12) continue
      if (rand() > 0.5 && w > 60) {
        const split = w * (0.4 + rand() * 0.2)
        out.push({ x: x0, y: y0, w: split - 5, h }, { x: x0 + split + 5, y: y0, w: w - split - 5, h })
      } else {
        out.push({ x: x0, y: y0, w, h })
      }
    }
  }
  return out
})()

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Where the rider is along the route at a given moment of the timeline. */
function riderDistance(elapsed: number, starts: number[], reduced: boolean) {
  let i = 0
  while (i + 1 < starts.length && elapsed >= starts[i + 1]) i++
  const step = trackingSteps[i]
  if (!step.rider) return 0

  let from = 0
  for (let j = i - 1; j >= 0; j--) {
    const previous = trackingSteps[j].rider
    if (previous) {
      from = waypointDistance[previous]
      break
    }
  }
  const to = waypointDistance[step.rider]
  if (reduced || from === to) return to

  const duration = Math.min(Math.max(Math.abs(to - from) / RIDER_SPEED, 900), step.hold * 0.94)
  const t = Math.min(1, (elapsed - starts[i]) / duration)
  return from + (to - from) * easeInOut(t)
}

export function DeliveryMap({ index, elapsed, starts, homeLabel }: Props) {
  const rider = useRef<SVGGElement>(null)
  const trail = useRef<SVGPathElement>(null)
  const reduced = usePrefersReducedMotion()
  const step = trackingSteps[index]
  const riding = step.rider !== undefined
  const preparing = !riding && step.phase !== 'delivered'
  const arrived = step.phase === 'delivered'

  useEffect(() => {
    let frame = 0
    const tick = () => {
      const distance = riderDistance(elapsed.current, starts, reduced)
      const p = pointAt(distance)
      rider.current?.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`)
      trail.current?.setAttribute('stroke-dasharray', `${distance.toFixed(2)} ${totalLength + 10}`)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [elapsed, starts, reduced])

  const [promiseRd, excuseSt, somedayAve] = copy.tracking.streets

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={styles.map}
      role="img"
      aria-label={`Map showing ${site.host} on the way from the restaurant to you`}
    >
      <rect width="400" height="300" fill={LAND} />

      <g fill="#E8DBC3">
        {buildings.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={6} />
        ))}
      </g>

      {/* Park */}
      <rect x={83} y={163} width={94} height={62} rx={10} fill="#CFE0BD" />
      <g fill="#B5D19F">
        <circle cx={104} cy={182} r={8} />
        <circle cx={122} cy={204} r={9} />
        <circle cx={150} cy={184} r={7} />
        <circle cx={160} cy={208} r={8} />
      </g>

      {/* Lake */}
      <path d="M-10 166 C26 160 58 182 56 218 C54 258 26 290 -10 300 Z" fill="#C8DFE4" />

      {/* Roads: a soft edge, then the white surface. */}
      <g fill="none" strokeLinecap="square">
        <g stroke="#E0D0B2">
          <path d="M-10 70H410M-10 150H410M-10 238H410M70 -10V310M190 -10V310M330 -10V310" strokeWidth={17} />
          <path d="M262 -10V128M262 172V238M330 194H410M110 238V310" strokeWidth={10} />
          <circle cx={ROUNDABOUT.x} cy={ROUNDABOUT.y} r={ROUNDABOUT.r} strokeWidth={17} />
        </g>
        <g stroke="#FFFFFF">
          <path d="M-10 70H410M-10 150H410M-10 238H410M70 -10V310M190 -10V310M330 -10V310" strokeWidth={13} />
          <path d="M262 -10V128M262 172V238M330 194H410M110 238V310" strokeWidth={7} />
          <circle cx={ROUNDABOUT.x} cy={ROUNDABOUT.y} r={ROUNDABOUT.r} strokeWidth={13} />
        </g>
      </g>
      <circle cx={ROUNDABOUT.x} cy={ROUNDABOUT.y} r={12} fill="#CFE0BD" />

      <g className={styles.street}>
        <text x={130} y={72.6}>
          {promiseRd}
        </text>
        <text x={190} y={194} transform="rotate(-90 190 194)" dy={2.6}>
          {excuseSt}
        </text>
        <text x={130} y={240.6}>
          {somedayAve}
        </text>
      </g>

      {/* The route a sensible person would take, and the one actually taken. */}
      <path
        d={plannedPath}
        fill="none"
        stroke="#1C130C"
        strokeOpacity={0.32}
        strokeWidth={3}
        strokeDasharray="0.5 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        ref={trail}
        d={actualPath}
        pathLength={totalLength}
        fill="none"
        stroke="#1C130C"
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`0 ${totalLength + 10}`}
      />

      {/* Restaurant */}
      <g transform={`translate(${RESTAURANT.x} ${RESTAURANT.y})`}>
        {preparing && <circle r={13} className={styles.pulse} fill="#F5B323" />}
        <circle r={12.5} fill="#1C130C" stroke="#FFFCF6" strokeWidth={2.5} />
        <path d="M-6 -1.5H6A6 6 0 0 1 -6 -1.5Z" fill="#F5B323" />
        <path d="M-2.5 -5Q-1 -7 -2.5 -9M2.5 -5Q4 -7 2.5 -9" stroke="#F5B323" strokeWidth={1.3} fill="none" strokeLinecap="round" />
      </g>
      <text x={RESTAURANT.x + 17} y={RESTAURANT.y - 12} className={styles.label}>
        {copy.tracking.restaurant}
      </text>

      {/* Tea shop */}
      <g transform="translate(352 129)" className={step.stalled ? styles.teaActive : undefined}>
        <circle r={10} className={styles.teaDot} strokeWidth={2} />
        <path d="M-4.5 -3H3V2A3.5 3.5 0 0 1 -1 5.5A3.5 3.5 0 0 1 -4.5 2Z" fill="#1C130C" />
        <path d="M3 -1.5H4.5A1.8 1.8 0 0 1 4.5 2H3" stroke="#1C130C" strokeWidth={1.3} fill="none" />
      </g>
      <text x={352} y={111} textAnchor="middle" className={styles.label}>
        {copy.tracking.teaShop}
      </text>

      {/* Home */}
      <g transform={`translate(${HOME.x} ${HOME.y})`}>
        {arrived && <circle r={14} className={styles.pulse} fill="#2E7A3D" />}
        <path
          d="M0 0C-3 -7 -12 -11 -12 -20A12 12 0 1 1 12 -20C12 -11 3 -7 0 0Z"
          fill="#F5B323"
          stroke="#1C130C"
          strokeWidth={2}
        />
        <circle cy={-20} r={4.5} fill="#1C130C" />
      </g>
      <text x={HOME.x} y={HOME.y + 19} textAnchor="middle" className={`${styles.label} ${styles.home}`}>
        {homeLabel}
      </text>

      {/* Rider */}
      <g ref={rider} transform={`translate(${RESTAURANT.x} ${RESTAURANT.y})`} className={styles.rider} data-on={riding || undefined}>
        {step.stalled && <circle r={14} className={styles.pulse} fill="#D3391F" />}
        <circle r={13} fill="#1C130C" stroke="#FFFCF6" strokeWidth={3} />
        <text y={4.6} textAnchor="middle" className={styles.initial}>
          {site.hostInitial}
        </text>
        {step.bubble && (
          <g transform="translate(8 -34)" className={styles.bubble}>
            <path d="M0 0H38A9 9 0 0 1 38 18H10L4 24L5 18H0A9 9 0 0 1 0 0Z" fill="#FFFFFF" stroke="#1C130C" strokeWidth={1.5} />
            <text x={19} y={13.5} textAnchor="middle">
              {step.bubble}
            </text>
          </g>
        )}
      </g>
    </svg>
  )
}
