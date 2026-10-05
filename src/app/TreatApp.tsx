'use client'

import { useEffect, useState } from 'react'
import { Arrival } from '@/components/screens/Arrival'
import { Landing } from '@/components/screens/Landing'
import { Menu } from '@/components/screens/Menu'
import { Receipt } from '@/components/screens/Receipt'
import { Tracking } from '@/components/screens/Tracking'
import { Toast, useToast } from '@/components/Toast'
import { type Order } from '@/lib/order'
import { loadTreat, saveTreat } from '@/lib/storage'

type Screen = 'landing' | 'menu' | 'tracking' | 'arrival' | 'receipt'

/** The big moments sit on saffron; the "app" screens sit on rice-white. */
const TONE: Record<Screen, { tone: string; color: string }> = {
  landing: { tone: 'saffron', color: '#F5B323' },
  menu: { tone: 'rice', color: '#FFFCF6' },
  tracking: { tone: 'rice', color: '#F2E9D8' },
  arrival: { tone: 'saffron', color: '#F5B323' },
  receipt: { tone: 'saffron', color: '#F5B323' },
}

type Props = {
  name: string | null
}

export function TreatApp({ name }: Props) {
  const [screen, setScreen] = useState<Screen>('landing')
  const [order, setOrder] = useState<Order | null>(null)
  const [savedOrder, setSavedOrder] = useState<Order | null>(null)
  const { toast, show } = useToast()

  useEffect(() => {
    setSavedOrder(loadTreat())
  }, [])

  useEffect(() => {
    const { tone, color } = TONE[screen]
    document.body.dataset.tone = tone
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
    window.scrollTo(0, 0)
    if (screen !== 'landing') {
      document.querySelector<HTMLElement>('[data-screen-heading]')?.focus({ preventScroll: true })
    }
  }, [screen])

  const start = () => setScreen('menu')

  const showSavedReceipt = () => {
    if (!savedOrder) return
    setOrder(savedOrder)
    setScreen('receipt')
  }

  const placeOrder = (nextOrder: Order) => {
    setOrder(nextOrder)
    setScreen('tracking')
  }

  const finishDelivery = () => setScreen('arrival')

  const finishArrival = (rating: number) => {
    if (!order) return
    const rated = { ...order, rating }
    saveTreat(rated)
    setOrder(rated)
    setSavedOrder(rated)
    setScreen('receipt')
  }

  return (
    <>
      {screen === 'landing' && (
        <Landing name={name} returning={savedOrder !== null} onStart={start} onShowReceipt={showSavedReceipt} />
      )}
      {screen === 'menu' && <Menu name={name} onOrder={placeOrder} />}
      {screen === 'tracking' && order && <Tracking order={order} onDelivered={finishDelivery} />}
      {screen === 'arrival' && order && <Arrival order={order} onFinished={finishArrival} />}
      {screen === 'receipt' && order && <Receipt order={order} notify={show} />}
      <Toast toast={toast} />
    </>
  )
}
