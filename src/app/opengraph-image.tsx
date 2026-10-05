import { copy } from '@/config/treat'
import { ogSize, treatCard } from '@/lib/og'

export const alt = copy.meta.title
export const size = ogSize
export const contentType = 'image/png'

export default function Image() {
  return treatCard(null)
}
