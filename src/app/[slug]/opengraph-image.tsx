import { copy } from '@/config/treat'
import { nameFromSlug } from '@/lib/name'
import { ogSize, treatCard } from '@/lib/og'

export const alt = copy.meta.title
export const size = ogSize
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return treatCard(nameFromSlug(slug))
}
