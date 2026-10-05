const MAX_LENGTH = 24

/**
 * Turns a URL segment like "arun" or "priya-k" into a display name.
 * Returns null for anything that does not look like a name.
 */
export function nameFromSlug(slug: string): string | null {
  let raw: string
  try {
    raw = decodeURIComponent(slug)
  } catch {
    return null
  }

  const cleaned = raw.replace(/[-_+]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!cleaned || cleaned.length > MAX_LENGTH) return null
  if (!/^[\p{L}\p{M}' ]+$/u.test(cleaned)) return null

  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
    .join(' ')
}

/** Tidies a name typed into the checkout form. */
export function cleanTypedName(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, MAX_LENGTH)
}
