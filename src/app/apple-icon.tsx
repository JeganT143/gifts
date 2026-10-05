import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** Home-screen icon: the bitten plate on saffron. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F5B323',
        }}
      >
        <div style={{ display: 'flex', position: 'relative', width: 112, height: 112, marginTop: 6 }}>
          <div style={{ width: 112, height: 112, borderRadius: 56, background: '#1C130C' }} />
          <div style={{ position: 'absolute', right: -14, top: -14, width: 52, height: 52, borderRadius: 26, background: '#F5B323' }} />
          <div style={{ position: 'absolute', right: 16, top: -20, width: 30, height: 30, borderRadius: 15, background: '#F5B323' }} />
          <div style={{ position: 'absolute', right: -20, top: 16, width: 30, height: 30, borderRadius: 15, background: '#F5B323' }} />
        </div>
      </div>
    ),
    size,
  )
}
