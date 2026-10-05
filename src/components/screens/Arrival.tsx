'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { copy, trackingSteps } from '@/config/treat'
import { formatClock, minutesLater } from '@/lib/format'
import { buzz, playBite } from '@/lib/feedback'
import type { Order } from '@/lib/order'
import { CENTER, dishArt, DishPlate, SIZE, TAU, type Bite } from '../dishes'
import { Star } from '../icons'
import { LogoMark } from '../Logo'
import styles from './Arrival.module.css'

type Stage = 'bag' | 'opening' | 'eating' | 'finished' | 'rating'

type Crumb = { id: number; x: number; y: number; dx: number; dy: number; color: string; size: number }

type Props = {
  order: Order
  /** Called with the stars the friend actually gave. */
  onFinished: (rating: number) => void
}

/** How much of the dish has to be eaten before the plate counts as clean. */
const CLEAN_PLATE = 0.68
const MAX_BITES = 14

/** Evenly spread points over the food, used to measure how much is left. */
function samplePoints(radius: number) {
  const points: { x: number; y: number }[] = [{ x: CENTER, y: CENTER }]
  const rings = 7
  for (let ring = 1; ring <= rings; ring++) {
    const r = (ring / rings) * radius * 0.94
    const count = Math.round(ring * 7)
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + ring
      points.push({ x: CENTER + Math.cos(a) * r, y: CENTER + Math.sin(a) * r })
    }
  }
  return points
}

export function Arrival({ order, onFinished }: Props) {
  const spec = dishArt[order.dish.art]
  const biteSize = spec.radius * 0.36
  const deliveredAt = minutesLater(order.placedAt, trackingSteps[trackingSteps.length - 1].minute)

  const [stage, setStage] = useState<Stage>('bag')
  // The host's quality check, already taken out of the edge.
  const [bites, setBites] = useState<Bite[]>(() => {
    const angle = -0.95
    return [
      {
        x: CENTER + Math.cos(angle) * spec.radius * 0.97,
        y: CENTER + Math.sin(angle) * spec.radius * 0.97,
        r: biteSize * 0.95,
        seed: 1,
      },
    ]
  })
  const [crumbs, setCrumbs] = useState<Crumb[]>([])
  const nextId = useRef(2)
  const plateButton = useRef<HTMLButtonElement>(null)
  const timers = useRef<number[]>([])

  const samples = useMemo(() => samplePoints(spec.radius), [spec.radius])
  const remaining = useMemo(
    () => samples.filter((p) => !bites.some((b) => Math.hypot(b.x - p.x, b.y - p.y) < b.r)),
    [samples, bites],
  )
  const eaten = 1 - remaining.length / samples.length
  const ownBites = bites.length - 1

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  useEffect(() => {
    if (stage !== 'eating') return
    if (eaten >= CLEAN_PLATE || ownBites >= MAX_BITES) {
      setStage('finished')
      buzz([18, 60, 18])
      later(() => setStage('rating'), 1700)
    }
  }, [stage, eaten, ownBites, later])

  useEffect(() => {
    if (stage === 'eating') plateButton.current?.focus({ preventScroll: true })
  }, [stage])

  const open = () => {
    setStage('opening')
    buzz(10)
    later(() => setStage('eating'), 750)
  }

  const bite = (x: number, y: number) => {
    // Pull taps on the rim in towards the food so every tap counts.
    const dx = x - CENTER
    const dy = y - CENTER
    const distance = Math.hypot(dx, dy)
    const limit = spec.radius * 0.92
    if (distance > limit) {
      x = CENTER + (dx / distance) * limit
      y = CENTER + (dy / distance) * limit
    }

    const id = nextId.current++
    setBites((current) => [...current, { x, y, r: biteSize * (0.9 + Math.random() * 0.2), seed: id * 7919 }])
    playBite()
    buzz(12)

    const fresh: Crumb[] = Array.from({ length: 7 }, (_, i) => {
      const a = Math.random() * TAU
      const speed = 30 + Math.random() * 50
      return {
        id: id * 100 + i,
        x: (x / SIZE) * 100,
        y: (y / SIZE) * 100,
        dx: Math.cos(a) * speed,
        dy: Math.sin(a) * speed - 20,
        color: spec.crumbs[i % spec.crumbs.length],
        size: 4 + Math.random() * 5,
      }
    })
    setCrumbs((current) => [...current, ...fresh])
    later(() => setCrumbs((current) => current.filter((c) => !fresh.includes(c))), 900)
  }

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (stage !== 'eating' || !event.isPrimary) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * SIZE
    const y = ((event.clientY - rect.top) / rect.height) * SIZE
    if (Math.hypot(x - CENTER, y - CENTER) > 200) return
    bite(x, y)
  }

  // Keyboard (Enter/Space) arrives as a click with detail 0: bite somewhere not yet eaten.
  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (stage !== 'eating' || event.detail !== 0 || remaining.length === 0) return
    const target = remaining[Math.floor(Math.random() * remaining.length)]
    bite(target.x, target.y)
  }

  const caption =
    stage === 'finished' || stage === 'rating'
      ? copy.arrival.finished
      : [...copy.arrival.captions].reverse().find(([after]) => ownBites >= after)?.[1] ?? ''

  const showPlate = stage !== 'bag'
  const showBag = stage === 'bag' || stage === 'opening'

  return (
    <main className={styles.arrival} data-stage={stage}>
      <header className={styles.head}>
        <p className={`mono ${styles.eyebrow}`}>{copy.arrival.eyebrow(formatClock(deliveredAt))}</p>
        <h1 key={showBag ? 'title-bag' : 'title-dish'} className={`display ${styles.title}`} tabIndex={-1} data-screen-heading>
          {showBag ? copy.arrival.headline : `Your ${order.dish.shortName}.`}
        </h1>
        <p key={showBag ? 'line-bag' : 'line-dish'} className={styles.dishLine} aria-hidden={showBag || undefined}>
          {copy.arrival.dishLine}
        </p>
      </header>

      <div className={styles.stage}>
        {showPlate && (
          <button
            ref={plateButton}
            type="button"
            className={styles.plate}
            onPointerDown={onPointerDown}
            onClick={onClick}
            disabled={stage !== 'eating'}
            aria-label={`Take a bite of your ${order.dish.shortName}`}
            aria-describedby="bite-caption"
          >
            <DishPlate dish={order.dish.art} bites={bites} finished={stage === 'finished' || stage === 'rating'} />
            <span className={styles.crumbs} aria-hidden="true">
              {crumbs.map((c) => (
                <i
                  key={c.id}
                  style={
                    {
                      left: `${c.x}%`,
                      top: `${c.y}%`,
                      width: c.size,
                      height: c.size,
                      background: c.color,
                      '--dx': `${c.dx}px`,
                      '--dy': `${c.dy}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </span>
          </button>
        )}

        {showBag && <Bag leaving={stage === 'opening'} />}
      </div>

      <footer className={styles.foot}>
        {stage === 'bag' ? (
          <button type="button" className="btn btn-ink" onClick={open}>
            {copy.arrival.open}
          </button>
        ) : stage === 'rating' ? (
          <Rating onDone={onFinished} />
        ) : (
          <p id="bite-caption" className={styles.caption} aria-live="polite">
            <span key={caption} className={styles.captionText}>
              {stage === 'opening' ? '' : caption}
            </span>
          </p>
        )}
      </footer>
    </main>
  )
}

/** Any rating is accepted, as long as it's five stars. */
function Rating({ onDone }: { onDone: (given: number) => void }) {
  const [given, setGiven] = useState<number | null>(null)
  const [shown, setShown] = useState(0)
  const [hover, setHover] = useState(0)
  const [note, setNote] = useState('')
  const first = useRef<HTMLButtonElement>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    first.current?.focus({ preventScroll: true })
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  const rate = (stars: number) => {
    if (given !== null) return
    setGiven(stars)
    setShown(stars)
    buzz(10)
    let at = 450
    for (let next = stars + 1; next <= 5; next++) {
      later(() => {
        setShown(next)
        buzz(8)
      }, at)
      at += 170
    }
    later(() => setNote(stars >= 5 ? copy.arrival.ratePerfect : copy.arrival.rateCorrected), stars >= 5 ? 150 : at)
    later(() => onDone(stars), at + 1700)
  }

  const lit = given === null ? hover : shown

  return (
    <div className={styles.rating}>
      <p id="rate-question" className={styles.rateQuestion}>
        {copy.arrival.rateQuestion}
      </p>
      <div className={styles.stars} role="group" aria-labelledby="rate-question" onPointerLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            ref={n === 1 ? first : undefined}
            type="button"
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            aria-pressed={given === n}
            data-on={n <= lit || undefined}
            disabled={given !== null}
            onPointerEnter={() => setHover(n)}
            onClick={() => rate(n)}
          >
            <Star size={36} />
          </button>
        ))}
      </div>
      <p className={styles.rateNote} aria-live="polite">
        {note}
      </p>
    </div>
  )
}

function Bag({ leaving }: { leaving: boolean }) {
  return (
    <div className={styles.bag} data-leaving={leaving || undefined} aria-hidden="true">
      <svg viewBox="0 0 240 280" className={styles.bagArt}>
        <defs>
          <linearGradient id="bag-paper" x1="0" x2="1">
            <stop offset="0" stopColor="#B88449" />
            <stop offset="0.18" stopColor="#D2A266" />
            <stop offset="0.82" stopColor="#CC9B5E" />
            <stop offset="1" stopColor="#A8763D" />
          </linearGradient>
        </defs>
        <ellipse cx="120" cy="272" rx="104" ry="8" fill="#7A4A00" opacity="0.25" />
        <path d="M22 54 L218 54 L230 268 L10 268 Z" fill="url(#bag-paper)" />
        <path d="M22 54 L218 54 L216 78 L24 78 Z" fill="#A9773E" opacity="0.6" />
        <path
          d="M22 30 L218 30 L218 56 L210 50 L202 56 L194 50 L186 56 L178 50 L170 56 L162 50 L154 56 L146 50 L138 56 L130 50 L122 56 L114 50 L106 56 L98 50 L90 56 L82 50 L74 56 L66 50 L58 56 L50 50 L42 56 L34 50 L26 56 L22 52 Z"
          fill="#C08F55"
        />
        <path d="M22 30 L218 30" stroke="#A9773E" strokeWidth="2" />
        <rect x="112" y="24" width="16" height="5" rx="1.5" fill="#8F969C" />
        <path d="M44 84 L36 262 M196 84 L204 262" stroke="#9E6C35" strokeOpacity="0.35" strokeWidth="2" />
        <circle cx="120" cy="168" r="46" fill="#F5B323" />
        <circle cx="120" cy="168" r="46" fill="none" stroke="#1C130C" strokeOpacity="0.15" strokeWidth="2" />
      </svg>
      <span className={styles.sticker}>
        <LogoMark size={34} />
      </span>
      <p className={`hand ${styles.bagNote}`}>{copy.arrival.bagNote}</p>
    </div>
  )
}
