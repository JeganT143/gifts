'use client'

/** Last-resort error page. Renders its own document, so styles are inline. */
export default function GlobalError({ retry, reset }: { retry?: () => void; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#F5B323',
          color: '#1C130C',
          fontFamily: 'system-ui, sans-serif',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <title>The order got stuck</title>
        <div>
          <h1 style={{ fontSize: 44, margin: '0 0 12px' }}>The order got stuck.</h1>
          <p style={{ fontSize: 18, margin: '0 0 24px' }}>Something broke while loading your treat.</p>
          <button
            type="button"
            onClick={() => (retry ?? reset)()}
            style={{
              border: 0,
              borderRadius: 999,
              padding: '16px 28px',
              background: '#1C130C',
              color: '#FFFCF6',
              fontSize: 17,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
