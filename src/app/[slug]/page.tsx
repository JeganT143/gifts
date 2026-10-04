import { nameFromSlug } from '@/lib/name'
import { TreatApp } from '../TreatApp'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  return <TreatApp name={nameFromSlug(slug)} />
}
