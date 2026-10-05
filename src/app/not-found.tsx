import Link from 'next/link'
import { StatusPage } from '@/components/StatusPage'
import { site } from '@/config/treat'

export default function NotFound() {
  return (
    <StatusPage
      eyebrow="404 · Wrong address"
      title="Nothing to eat here."
      body={`This link doesn’t lead to any treat. Even ${site.host} couldn’t find it, and ${site.host} knows every tea shop on the route.`}
    >
      <Link href="/" className="btn btn-ink">
        Take me to the treat
      </Link>
    </StatusPage>
  )
}
