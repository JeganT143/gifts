'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './Toast.module.css'

type ToastState = { id: number; message: string } | null

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((message: string) => {
    window.clearTimeout(timer.current)
    setToast({ id: Date.now(), message })
    timer.current = window.setTimeout(() => setToast(null), 3400)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { toast, show }
}

export function Toast({ toast }: { toast: ToastState }) {
  return (
    <div className={styles.region} role="status" aria-live="polite">
      {toast && (
        <p key={toast.id} className={styles.toast}>
          {toast.message}
        </p>
      )}
    </div>
  )
}
