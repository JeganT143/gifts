import { Logo } from './Logo'
import styles from './StatusPage.module.css'

type Props = {
  eyebrow: string
  title: string
  body: string
  children: React.ReactNode
}

/** Full-screen message for 404s and errors, in the same voice as the rest of the site. */
export function StatusPage({ eyebrow, title, body, children }: Props) {
  return (
    <main className={styles.page}>
      <Logo />
      <div className={styles.content}>
        <p className={`mono ${styles.eyebrow}`}>{eyebrow}</p>
        <h1 className={`display ${styles.title}`}>{title}</h1>
        <p className={styles.body}>{body}</p>
        <div className={styles.actions}>{children}</div>
      </div>
    </main>
  )
}
