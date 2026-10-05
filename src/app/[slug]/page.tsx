import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { copy, site } from '@/config/treat'
import { nameFromSlug } from '@/lib/name'
import { TreatApp } from '../TreatApp'

type Props = {
  params: Promise<{ slug: string }>
}

/** Personal links (gifts.jegant.dev/arun) are rendered on first visit, then cached. */
export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = nameFromSlug((await params).slug)
  if (!name) return {}
  const title = copy.meta.personalTitle(name)
  const description = copy.meta.description
  return {
    title,
    openGraph: { type: 'website', siteName: site.brand, locale: 'en_IN', title, description },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function Page({ params }: Props) {
  const name = nameFromSlug((await params).slug)
  if (!name) notFound()
  return <TreatApp name={name} />
}
