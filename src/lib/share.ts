export type ShareResult = 'shared' | 'cancelled' | 'whatsapp' | 'copied' | 'failed'

/**
 * Uses the native share sheet when there is one (most phones), otherwise
 * opens WhatsApp with the message prefilled.
 */
export async function shareLink(text: string, url: string): Promise<ShareResult> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ text, url })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    }
  }

  const opened = window.open(
    `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    '_blank',
    'noopener,noreferrer',
  )
  if (opened !== null) return 'whatsapp'

  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
