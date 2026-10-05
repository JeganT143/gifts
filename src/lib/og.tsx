import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { dishArt } from '@/components/dishes/art'
import { copy, site } from '@/config/treat'
import { toSvgString } from './svgString'

export const ogSize = { width: 1200, height: 630 }

const font = (file: string) => readFile(join(process.cwd(), 'assets/fonts', file))

const fontsPromise = Promise.all([
  font('bricolage-display.ttf'),
  font('bricolage-text.ttf'),
  font('kalam.ttf'),
  font('dm-mono.ttf'),
])

const plate = (() => {
  const { Base, Food } = dishArt.biryani
  const svg = toSvgString(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <Base id="og" />
      <Food id="og" />
    </svg>,
  )
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
})()

const INK = '#1C130C'
const SAFFRON = '#F5B323'

/** The link preview people see in WhatsApp before they open anything. */
export async function treatCard(name: string | null) {
  const [display, text, hand, mono] = await fontsPromise

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: SAFFRON,
          color: INK,
          fontFamily: 'Text',
        }}
      >
        {/* The plate, half off the edge, like on the landing page. */}
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: 40,
            width: 640,
            height: 640,
            borderRadius: 320,
            boxShadow: '0 40px 80px rgba(120, 70, 0, 0.35)',
            display: 'flex',
          }}
        >
          <img src={plate} width={640} height={640} alt="" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', padding: '56px 0 0 72px', width: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 34 }}>
            <div style={{ display: 'flex', position: 'relative', width: 40, height: 40 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: INK }} />
              <div style={{ position: 'absolute', right: -6, top: -6, width: 20, height: 20, borderRadius: 10, background: SAFFRON }} />
            </div>
            {site.brand}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginTop: name ? 30 : 84 }}>
            {name && <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 72, lineHeight: 1 }}>{`${name},`}</div>}
            <div style={{ fontFamily: 'Display', fontSize: name ? 206 : 236, lineHeight: 0.9, letterSpacing: -4, marginLeft: -8 }}>
              {copy.landing.headline}
            </div>
          </div>

          <div style={{ display: 'flex', fontSize: 38, marginTop: 26, lineHeight: 1.25, maxWidth: 600 }}>
            {`${site.host}’s treat is here. Order anything you want.`}
          </div>
          <div style={{ display: 'flex', fontFamily: 'Hand', fontSize: 38, marginTop: 14, transform: 'rotate(-2deg)' }}>
            {`It’s on me. — ${site.hostInitial}`}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 56,
            top: 52,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 22px',
            borderRadius: 40,
            background: INK,
            color: SAFFRON,
            fontFamily: 'Mono',
            fontSize: 24,
            letterSpacing: 2,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 6, background: '#3FBF5F' }} />
          ORDER CONFIRMED
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: 'Display', data: display, weight: 800, style: 'normal' },
        { name: 'Text', data: text, weight: 500, style: 'normal' },
        { name: 'Hand', data: hand, weight: 400, style: 'normal' },
        { name: 'Mono', data: mono, weight: 500, style: 'normal' },
      ],
    },
  )
}
