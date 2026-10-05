'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  callReplies,
  chatPrompts,
  copy,
  site,
  trackingSteps,
  type ChatPrompt,
  type Phase,
  type RiderMood,
  type StatusContext,
} from '@/config/treat'
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
const LAST_STALLED = trackingSteps.reduce((last, step, i) => (step.stalled ? i : last), -1)

const moodAt = (i: number): RiderMood =>
  trackingSteps[i].stalled ? 'stalled' : LAST_STALLED >= 0 && i > LAST_STALLED ? 'arriving' : 'riding'

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
  const title = step.title(context)

  // Like real delivery apps: the tab title follows the order.
  useEffect(() => {
    const original = document.title
    return () => {
      document.title = original
    }
  }, [])

  useEffect(() => {
    document.title = `${etaText} · ${title}`
  }, [etaText, title])

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
            <h2 className={styles.statusTitle}>{title}</h2>
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

        {PICKUP >= 0 && index >= PICKUP && <RiderCard mood={moodAt(index)} />}

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

type Message = { id: number; from: 'you' | 'host' | 'system'; text: string; seen?: boolean }

function RiderCard({ mood }: { mood: RiderMood }) {
  const [call, setCall] = useState<CallState>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping] = useState(false)
  const moodNow = useRef(mood)
  const asked = useRef(new Set<string>())
  const nextId = useRef(1)
  const timers = useRef<number[]>([])

  useEffect(() => {
    moodNow.current = mood
  }, [mood])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  const post = (from: Message['from'], text: string) => {
    const id = nextId.current++
    setMessages((current) => [...current, { id, from, text }])
    return id
  }

  const reply = (text: () => string, delay: number) => {
    setTyping(true)
    later(() => {
      setTyping(false)
      post('host', text())
    }, delay)
  }

  const send = (prompt: ChatPrompt) => {
    if (typing) return
    const key = `${prompt.id}:${moodNow.current}`
    const id = post('you', prompt.label)
    if (asked.current.has(key)) {
      // Asked the same thing twice. Left on seen.
      later(() => setMessages((current) => current.map((m) => (m.id === id ? { ...m, seen: true } : m))), 900)
      return
    }
    asked.current.add(key)
    reply(() => prompt.replies[moodNow.current], 1200 + Math.random() * 600)
  }

  const startCall = () => {
    setCall('ringing')
    later(() => {
      setCall('idle')
      post('system', copy.tracking.callDeclined)
      reply(() => callReplies[moodNow.current], 900)
    }, 1800)
  }

  return (
    <div className={styles.rider}>
      <div className={styles.riderHead}>
        <span className={styles.avatar} aria-hidden="true">
          {site.hostInitial}
        </span>
        <div>
          <p className={styles.riderName}>{site.host}</p>
          <p className={styles.riderMeta}>
            {copy.tracking.riderRole} · <Star /> {copy.tracking.riderRating}
          </p>
        </div>
        <button
          type="button"
          className={styles.call}
          onClick={startCall}
          disabled={call !== 'idle' || typing}
          data-ringing={call === 'ringing' || undefined}
        >
          <Phone />
          {call === 'ringing' ? copy.tracking.calling : copy.tracking.call}
        </button>
      </div>

      <ol className={styles.thread} aria-live="polite" aria-label={copy.tracking.chatLabel}>
        {messages.slice(-5).map((m) => (
          <li key={m.id} className={styles.message} data-from={m.from}>
            {m.from === 'system' && <Phone size={13} />}
            <span>{m.text}</span>
            {m.seen && <small className={styles.seen}>{copy.tracking.seen}</small>}
          </li>
        ))}
        {typing && (
          <li className={styles.message} data-from="host" aria-label={copy.tracking.typing}>
            <span className={styles.dots} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </li>
        )}
      </ol>

      <div className={styles.prompts} role="group" aria-label={copy.tracking.chatLabel}>
        {chatPrompts.map((prompt) => (
          <button key={prompt.id} type="button" onClick={() => send(prompt)} disabled={typing || call === 'ringing'}>
            {prompt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
