import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
export const alt = 'Dubai Trades E-commerce'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b1220 0%, #111827 60%, #1f2937 100%)',
        }}
      >
        <div
          style={{
            width: '92%',
            height: '78%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 24,
            padding: '48px 56px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ 
            display: 'flex', 
            fontSize: 64, 
            fontWeight: 800, 
            color: '#e5e7eb',
            marginBottom: 20
          }}>
            Dubai <span style={{ color: '#f59e0b', marginLeft: 10 }}>Trades</span>
          </div>
          
          <div style={{ 
            fontSize: 32, 
            color: '#9ca3af',
            textAlign: 'center'
          }}>
            E-commerce Store
          </div>
          
          <div style={{ 
            fontSize: 36, 
            fontWeight: 700, 
            color: '#fbbf24',
            marginTop: 40
          }}>
            Shop Now - Best Deals
          </div>
        </div>
      </div>
    ),
    size
  )
}
