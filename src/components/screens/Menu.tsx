'use client'

import { useRef, useState } from 'react'
import { copy, dishes, type Dish } from '@/config/treat'
import { formatRupees } from '@/lib/format'
import type { Order } from '@/lib/order'
import { DishPlate } from '../dishes'
import { Plus } from '../icons'
import { Logo } from '../Logo'
import { CheckoutSheet } from './CheckoutSheet'
import styles from './Menu.module.css'

type Props = {
  name: string | null
  onOrder: (order: Order) => void
}

export function Menu({ name, onOrder }: Props) {
  const [selected, setSelected] = useState<Dish | null>(null)
  const opener = useRef<HTMLButtonElement | null>(null)

  const close = () => {
    setSelected(null)
    opener.current?.focus({ preventScroll: true })
  }

  return (
    <main className={styles.menu}>
      <header className={styles.bar}>
        <Logo />
        <span className={styles.deliver}>
          Delivering to <strong>{name ?? 'you'}</strong>
        </span>
      </header>

      <div className={styles.intro}>
        <p className={styles.eyebrow}>{copy.menu.eyebrow}</p>
        <h1 className={`display ${styles.title}`} tabIndex={-1} data-screen-heading>
          {copy.menu.title}
        </h1>
        <p className={styles.subtitle}>{copy.menu.subtitle}</p>
      </div>

      <ul className={styles.list}>
        {dishes.map((dish, i) => (
          <li key={dish.id} style={{ animationDelay: `${120 + i * 70}ms` }}>
            <button
              type="button"
              className={styles.item}
              onClick={(event) => {
                opener.current = event.currentTarget
                setSelected(dish)
              }}
              aria-haspopup="dialog"
            >
              <span className={styles.thumb}>
                <DishPlate dish={dish.art} />
              </span>
              <span className={styles.info}>
                {dish.tag && <span className={styles.tag}>{dish.tag}</span>}
                <span className={styles.name}>{dish.name}</span>
                <span className={styles.description}>{dish.description}</span>
                <span className={`mono ${styles.price}`}>{formatRupees(dish.price)}</span>
              </span>
              <span className={styles.add} aria-hidden="true">
                <Plus />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {selected && <CheckoutSheet dish={selected} defaultName={name ?? ''} onClose={close} onOrder={onOrder} />}
    </main>
  )
}
