import { useId } from 'react'
import { site } from '@/config/treat'
import styles from './Logo.module.css'

/** A plate with a bite taken out of it. */
export function LogoMark({ size = 28 }: { size?: number }) {
  const id = `m${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <mask id={id}>
        <rect width="32" height="32" fill="#fff" />
        <circle cx="28" cy="6" r="7" fill="#000" />
        <circle cx="22.5" cy="2.5" r="4" fill="#000" />
        <circle cx="31" cy="12" r="4" fill="#000" />
      </mask>
      <circle cx="16" cy="16" r="14" fill="currentColor" mask={`url(#${id})`} />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`${styles.logo} ${className ?? ''}`}>
      <LogoMark />
      <span>{site.brand}</span>
    </span>
  )
}
