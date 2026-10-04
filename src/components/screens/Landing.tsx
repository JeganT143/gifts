import { copy } from '@/config/treat'
import { DishPlate } from '../dishes'
import { ArrowRight } from '../icons'
import { Logo } from '../Logo'
import styles from './Landing.module.css'

type Props = {
  name: string | null
  /** True when this browser already finished a treat. */
  returning: boolean
  onStart: () => void
  onShowReceipt: () => void
}

export function Landing({ name, returning, onStart, onShowReceipt }: Props) {
  return (
    <main className={styles.landing}>
      <header className={styles.top}>
        <Logo />
      </header>

      <section className={styles.copy}>
        {name && <p className={styles.name}>{name},</p>}
        <h1 className={`display ${styles.headline}`} tabIndex={-1} data-screen-heading>
          {copy.landing.headline}
        </h1>
        <p className={styles.body}>{copy.landing.body}</p>
        <p className={`hand ${styles.note}`}>{copy.landing.note}</p>

        <div className={styles.actions}>
          <button type="button" className={`btn btn-ink ${styles.cta}`} onClick={onStart}>
            {copy.landing.cta}
            <ArrowRight />
          </button>
          <p className={styles.footnote}>{copy.landing.footnote}</p>
          {returning && (
            <button type="button" className={styles.returning} onClick={onShowReceipt}>
              {copy.landing.returning} <span>{copy.landing.returningLink}</span>
            </button>
          )}
        </div>
      </section>

      <div className={styles.stage} aria-hidden="true">
        <div className={styles.plate}>
          <DishPlate dish="biryani" className={styles.spin} />
        </div>
      </div>
    </main>
  )
}
