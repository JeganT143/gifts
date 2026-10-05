'use client'

import { useEffect, useMemo, useRef } from 'react'
import { copy, site, trackingSteps } from '@/config/treat'
import { buzz } from '@/lib/feedback'
import { formatAmount, formatClock, formatDay, minutesLater } from '@/lib/format'
import { displayName, orderLines, type Order } from '@/lib/order'
import { seeded } from '@/lib/random'
import { shareLink } from '@/lib/share'
import { Share } from '../icons'
import { LogoMark } from '../Logo'
import styles from './Receipt.module.css'

type Props = {
  order: Order
  notify: (message: string) => void
}

const STAMP_DELAY = 2300

export function Receipt({ order, notify }: Props) {
  const againButton = useRef<HTMLButtonElement>(null)
  const delivered = minutesLater(order.placedAt, trackingSteps[trackingSteps.length - 1].minute)
  const { items, tasted, digitalDiscount } = orderLines(order)

  useEffect(() => {
    const timer = window.setTimeout(() => buzz(35), STAMP_DELAY + 120)
    return () => window.clearTimeout(timer)
  }, [])

  const share = async () => {
    const result = await shareLink(copy.receipt.shareText, site.url)
    if (result === 'copied') notify(copy.receipt.copied)
    if (result === 'failed') notify(`Sharing isn’t available here. The link is ${site.url.replace(/^https?:\/\//, '')}`)
  }

  const again = () => {
    notify(copy.receipt.againToast)
    buzz([12, 50, 12])
    againButton.current?.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-7px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 380, easing: 'ease-out' },
    )
  }

  return (
    <main className={styles.receipt}>
      <h1 className={`display ${styles.title}`} tabIndex={-1} data-screen-heading>
        {copy.receipt.headline}
      </h1>

      <div className={styles.printer}>
        <div className={styles.slot} aria-hidden="true" />
        <div className={styles.feed}>
          <article className={styles.paper} aria-label="Receipt">
            <header className={styles.paperHead}>
              <LogoMark size={30} />
              <p className={styles.brand}>{site.brand}</p>
              <p>
                {copy.receipt.title} · #{order.orderNo}
              </p>
              <p>
                {formatDay(delivered)} · {formatClock(delivered)}
              </p>
            </header>

            <dl className={styles.pairs}>
              <div>
                <dt>{copy.receipt.billedTo}</dt>
                <dd>{displayName(order)}</dd>
              </div>
              <div>
                <dt>{copy.receipt.deliveredBy}</dt>
                <dd>{copy.receipt.deliveredByValue}</dd>
              </div>
            </dl>

            <table className={styles.lines}>
              <tbody>
                {items.map((item) => (
                  <tr key={item.label}>
                    <td>1 × {item.label}</td>
                    <td>{formatAmount(item.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <td>{copy.receipt.deliveryLine}</td>
                  <td>{formatAmount(0)}</td>
                </tr>
                <tr>
                  <td>{copy.receipt.tastedLine}</td>
                  <td>{formatAmount(-tasted)}</td>
                </tr>
                <tr>
                  <td>{copy.receipt.digitalLine}</td>
                  <td>{formatAmount(-digitalDiscount)}</td>
                </tr>
              </tbody>
            </table>

            <div className={styles.total}>
              <span>{copy.receipt.total}</span>
              <span>₹{formatAmount(0)}</span>
            </div>
            <div className={styles.paidBy}>
              <span>{copy.receipt.paidBy}</span>
              <span>₹{formatAmount(0)}</span>
            </div>

            <dl className={styles.pairs}>
              {order.rating !== undefined && (
                <div>
                  <dt>{copy.receipt.rating}</dt>
                  <dd>{copy.receipt.ratingValue(order.rating)}</dd>
                </div>
              )}
              <div>
                <dt>{copy.receipt.calories}</dt>
                <dd>0 kcal</dd>
              </div>
              <div>
                <dt>{copy.receipt.status}</dt>
                <dd>
                  <strong>{copy.receipt.statusValue}</strong>
                </dd>
              </div>
            </dl>

            <p className={styles.fine}>{copy.receipt.finePrint}</p>

            <div className={styles.signoff}>
              <p className={styles.signature}>
                <span className="hand">{site.host}</span>
                <small>{copy.receipt.signatory}</small>
              </p>
              <Stamp date={formatDay(delivered)} />
            </div>

            <Barcode value={order.orderNo} />
          </article>
        </div>
      </div>

      <p className={`hand ${styles.note}`}>
        {copy.receipt.note}
        <span>{copy.receipt.signoff}</span>
      </p>

      <div className={styles.actions}>
        <button type="button" className="btn btn-ink btn-block" onClick={share}>
          <Share />
          {copy.receipt.share}
        </button>
        <button ref={againButton} type="button" className="btn btn-line btn-block" onClick={again}>
          {copy.receipt.again}
        </button>
      </div>
    </main>
  )
}

function Barcode({ value }: { value: string }) {
  const bars = useMemo(() => {
    const rand = seeded([...value].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7))
    const out: { x: number; w: number }[] = []
    let x = 0
    while (x < 196) {
      const w = 1 + Math.floor(rand() * 3.4)
      if (out.length === 0 || rand() > 0.45) out.push({ x, w })
      x += w + 1 + Math.floor(rand() * 2)
    }
    return out
  }, [value])

  return (
    <div className={styles.barcode} aria-hidden="true">
      <svg viewBox="0 0 200 36" preserveAspectRatio="none">
        {bars.map((bar) => (
          <rect key={bar.x} x={bar.x} width={bar.w} height={36} />
        ))}
      </svg>
      <span>{value.replace(/(.)/g, '$1 ').trim()}</span>
    </div>
  )
}

function Stamp({ date }: { date: string }) {
  return (
    <svg className={styles.stamp} viewBox="0 0 220 112" aria-hidden="true">
      <defs>
        <filter id="stamp-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.35"
            result="holes"
          />
          <feComposite in="SourceGraphic" in2="holes" operator="in" />
        </filter>
      </defs>
      <g filter="url(#stamp-ink)" fill="none" stroke="#D3391F">
        <rect x="5" y="5" width="210" height="102" rx="14" strokeWidth="5" />
        <rect x="14" y="14" width="192" height="84" rx="8" strokeWidth="1.8" />
        <text x="110" y="66" textAnchor="middle" className={styles.stampText} fill="#D3391F" stroke="none">
          {copy.receipt.stamp.toUpperCase()}
        </text>
        <text x="110" y="87" textAnchor="middle" className={styles.stampDate} fill="#D3391F" stroke="none">
          {date.toUpperCase()}
        </text>
      </g>
    </svg>
  )
}
