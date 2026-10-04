'use client'

import { useEffect, useRef, useState } from 'react'
import { addons, copy, type Dish } from '@/config/treat'
import { formatRupees } from '@/lib/format'
import { cleanTypedName } from '@/lib/name'
import { addonPrice, newOrderNumber, orderLines, type Order } from '@/lib/order'
import { DishPlate } from '../dishes'
import { Check, Close } from '../icons'
import styles from './CheckoutSheet.module.css'

type Props = {
  dish: Dish
  defaultName: string
  onClose: () => void
  onOrder: (order: Order) => void
}

const FOCUSABLE = 'button:not(:disabled), input:not(:disabled)'

export function CheckoutSheet({ dish, defaultName, onClose, onOrder }: Props) {
  const [chosen, setChosen] = useState<string[]>([])
  const [name, setName] = useState(defaultName)
  const [placing, setPlacing] = useState(false)
  const sheet = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)

  const selectedAddons = addons.filter((addon) => chosen.includes(addon.id))
  const { itemTotal } = orderLines({ dish, addons: selectedAddons })

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    sheet.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = previousOverflow
      window.clearTimeout(timer.current)
    }
  }, [])

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && !placing) {
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab' || !sheet.current) return
    const items = Array.from(sheet.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && (document.activeElement === first || document.activeElement === sheet.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const toggle = (id: string) =>
    setChosen((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (placing) return
    setPlacing(true)
    // A short pause so placing the order feels like something happened.
    timer.current = window.setTimeout(() => {
      onOrder({
        orderNo: newOrderNumber(),
        name: cleanTypedName(name),
        dish,
        addons: selectedAddons,
        placedAt: Date.now(),
      })
    }, 900)
  }

  return (
    <div className={styles.layer} onKeyDown={onKeyDown}>
      <div className={styles.scrim} onClick={placing ? undefined : onClose} aria-hidden="true" />
      <div
        ref={sheet}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        tabIndex={-1}
      >
        <div className={styles.head}>
          <span className={styles.thumb}>
            <DishPlate dish={dish.art} />
          </span>
          <div>
            <h2 id="checkout-title" className={styles.title}>
              {dish.name}
            </h2>
            <p className={`mono ${styles.price}`}>{formatRupees(dish.price)}</p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} disabled={placing} aria-label="Close">
            <Close />
          </button>
        </div>

        <form onSubmit={submit}>
          <fieldset className={styles.addons}>
            <legend className={styles.legend}>
              {copy.checkout.addonsTitle} <span>{copy.checkout.addonsHint}</span>
            </legend>
            <div className={styles.chips}>
              {addons.map((addon) => {
                const on = chosen.includes(addon.id)
                return (
                  <label key={addon.id} className={styles.chip} data-on={on || undefined}>
                    <input
                      type="checkbox"
                      className="visually-hidden"
                      checked={on}
                      onChange={() => toggle(addon.id)}
                      disabled={placing}
                    />
                    <span className={styles.box} aria-hidden="true">
                      {on && <Check size={12} />}
                    </span>
                    {addon.label}
                    <span className="mono">+{formatRupees(addonPrice(addon, dish))}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <dl className={styles.bill}>
            <div>
              <dt>{copy.checkout.itemTotal}</dt>
              <dd className="mono">{formatRupees(itemTotal)}</dd>
            </div>
            <div>
              <dt>{copy.checkout.delivery}</dt>
              <dd className="mono">{copy.checkout.deliveryValue}</dd>
            </div>
            <div className={styles.paid}>
              <dt>{copy.checkout.paidBy}</dt>
              <dd className="mono">−{formatRupees(itemTotal)}</dd>
            </div>
            <div className={styles.toPay}>
              <dt>{copy.checkout.toPay}</dt>
              <dd className="mono">{formatRupees(0)}</dd>
            </div>
          </dl>

          <label className={styles.field}>
            <span>{copy.checkout.deliverTo}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={copy.checkout.namePlaceholder}
              autoComplete="given-name"
              maxLength={24}
              enterKeyHint="go"
              disabled={placing}
            />
          </label>

          <button type="submit" className="btn btn-ink btn-block" disabled={placing} aria-live="polite">
            {placing ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                {copy.checkout.placing}
              </>
            ) : (
              <>
                {copy.checkout.cta}
                <span className={styles.dot} aria-hidden="true" />
                <span className="mono">{formatRupees(0)}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
