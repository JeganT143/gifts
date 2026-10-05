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
        <div className={styles.titleRow}>
          {name && <p className={styles.name}>{name},</p>}
          <h1 className={`display ${styles.headline}`} tabIndex={-1} data-screen-heading>
            {copy.landing.headline}
          </h1>
          <Sticker text={copy.landing.sticker} />
        </div>
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

/** A round "approved" seal with text running around the edge. */
function Sticker({ text }: { text: string }) {
  return (
    <svg className={styles.sticker} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <path id="sticker-ring" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1 -90 0" />
      </defs>
      <circle cx="60" cy="60" r="59" fill="#1C130C" />
      <g className={styles.stickerText}>
        <text>
          <textPath href="#sticker-ring" textLength={282} lengthAdjust="spacing">
            {text.toUpperCase()}
          </textPath>
        </text>
      </g>
      <circle cx="60" cy="60" r="17" fill="#F5B323" />
      <circle cx="72" cy="47" r="8" fill="#1C130C" />
      <circle cx="66" cy="43" r="4.5" fill="#1C130C" />
      <circle cx="76.5" cy="53.5" r="4.5" fill="#1C130C" />
    </svg>
  )
}
