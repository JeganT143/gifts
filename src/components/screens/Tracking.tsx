'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { copy, site, trackingSteps, type Phase, type StatusContext } from '@/config/treat'
import { formatClock, minutesLater } from '@/lib/format'
import { displayName, type Order } from '@/lib/order'
import { useTimeline } from '@/lib/useTimeline'
import { DishPlate } from '../dishes'
import { Phone, Star } from '../icons'
import { DeliveryMap } from '../tracking/DeliveryMap'
import styles from './Tracking.module.css'

const STARTS = trackingSteps.map((_, i) => trackingSteps.slice(0, i).reduce((sum, step) => sum + step.hold, 0))
const TOTAL = trackingSteps.reduce((sum, step) => sum + step.hold, 0)
const PHASES: Phase[] = ['confirmed', 'preparing', 'on-the-way', 'delivered']
const PICKUP = trackingSteps.findIndex((step) => step.rider !== undefined)

type CallState = 'idle' | 'ringing' | 'declined'

type Props = {
  order: Order
  onDelivered: () => void
}

export function Tracking({ order, onDelivered }: Props) {
  const { index, elapsed } = useTimeline(STARTS, TOTAL, onDelivered)
  const step = trackingSteps[index]
  const previous = trackingSteps[Math.max(0, index - 1)]

  const context: StatusContext = useMemo(
    () => ({
      dish: order.dish.shortName,
      at: (minutes) => formatClock(minutesLater(order.placedAt, minutes)),
    }),
    [order],
  )

  const etaChange = typeof step.eta === 'number' && typeof previous.eta === 'number' ? step.eta - previous.eta : 0
  const late = etaChange > 0 || typeof step.eta === 'string'
  const etaText = typeof step.eta === 'string' ? step.eta : step.eta === 0 ? 'Here' : `${step.eta} min`
  const phase = PHASES.indexOf(step.phase)
  const history = trackingSteps.slice(0, index).reverse()

  return (
    <main className={styles.tracking}>
      <h1 className="visually-hidden" tabIndex={-1} data-screen-heading>
        Tracking order {order.orderNo}
      </h1>

      <div className={styles.mapWrap}>
        <DeliveryMap index={index} elapsed={elapsed} starts={STARTS} homeLabel={order.name || 'You'} />
        <span className={styles.live}>
          <i aria-hidden="true" />
          {copy.tracking.live}
        </span>
        <span className={`mono ${styles.orderNo}`}>#{order.orderNo}</span>
      </div>

      <section className={styles.sheet}>
        <div className={styles.etaRow}>
          <div>
            <p className={styles.etaLabel}>{copy.tracking.etaLabel}</p>
            <p className={`display ${styles.eta}`} data-late={late || undefined}>
              {etaText}
            </p>
          </div>
          {etaChange > 0 && (
            <span key={index} className={`mono ${styles.delta}`}>
              +{etaChange} min
            </span>
          )}
        </div>

        <div className={styles.status} aria-live="polite" aria-atomic="true">
          <div key={step.id} className={styles.statusInner}>
            <p className={`mono ${styles.statusTime}`}>{context.at(step.minute)}</p>
            <h2 className={styles.statusTitle}>{step.title(context)}</h2>
            <p className={styles.statusDetail}>{step.detail(context)}</p>
          </div>
        </div>

        <ol className={styles.phases} aria-label="Order progress">
          {PHASES.map((name, i) => (
            <li
              key={name}
              data-state={i < phase ? 'done' : i === phase ? 'active' : undefined}
              aria-current={i === phase ? 'step' : undefined}
            >
              <span className={styles.bar} />
              {copy.tracking.phases[name]}
            </li>
          ))}
        </ol>

        {PICKUP >= 0 && index >= PICKUP && <RiderCard stalled={Boolean(step.stalled)} />}

        <div className={styles.summary}>
          <span className={styles.summaryThumb}>
            <DishPlate dish={order.dish.art} />
          </span>
          <div>
            <p className={styles.summaryItems}>
              {[order.dish.name, ...order.addons.map((addon) => addon.label)].join(' + ')}
            </p>
            <p className={styles.summaryMeta}>
              To {displayName(order)} · {copy.tracking.paidLine}
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <section className={styles.updates} aria-label="Earlier updates">
            <ol className={styles.history}>
              {history.map((item) => (
                <li key={item.id}>
                  <time className="mono">{context.at(item.minute)}</time>
                  <div>
                    <p className={styles.historyTitle}>{item.title(context)}</p>
                    <p className={styles.historyDetail}>{item.detail(context)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </section>
    </main>
  )
}

function RiderCard({ stalled }: { stalled: boolean }) {
  const [call, setCall] = useState<CallState>('idle')
  const [message, setMessage] = useState('')
  const stalledNow = useRef(stalled)
  const timers = useRef<number[]>([])

  useEffect(() => {
    stalledNow.current = stalled
  }, [stalled])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const startCall = () => {
    setCall('ringing')
    setMessage('')
    timers.current.push(
      window.setTimeout(() => {
        setCall('declined')
        setMessage(stalledNow.current ? copy.tracking.callEating : copy.tracking.callDriving)
      }, 1600),
      window.setTimeout(() => setCall('idle'), 2600),
      window.setTimeout(() => setMessage(''), 6000),
    )
  }

  return (
    <div className={styles.riderBlock}>
      <div className={styles.rider}>
        <span className={styles.avatar} aria-hidden="true">
          {site.hostInitial}
        </span>
        <div>
          <p className={styles.riderName}>{site.host}</p>
          <p className={styles.riderMeta}>
            {copy.tracking.riderRole} · <Star /> {copy.tracking.riderRating}
          </p>
        </div>
        <button type="button" className={styles.call} onClick={startCall} disabled={call !== 'idle'} data-ringing={call === 'ringing' || undefined}>
          <Phone />
          {call === 'ringing' ? copy.tracking.calling : copy.tracking.call}
        </button>
      </div>
      <p className={styles.callMessage} role="status">
        {message}
      </p>
    </div>
  )
}
