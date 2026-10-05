'use client'

import { useEffect } from 'react'
import { StatusPage } from '@/components/StatusPage'

type Props = {
  error: Error & { digest?: string }
  retry?: () => void
  reset: () => void
}

export default function Error({ error, retry, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StatusPage
      eyebrow="Something went wrong"
      title="The order got stuck."
      body="Something broke while loading your treat. Try again, or start over from the beginning."
    >
      <button type="button" className="btn btn-ink" onClick={() => (retry ?? reset)()}>
        Try again
      </button>
      <a href="/" className="btn btn-line">
        Start over
      </a>
    </StatusPage>
  )
}
