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
    document.body.dataset.tone = screen === 'landing' ? 'saffron' : 'rice'
    const heading = document.querySelector<HTMLElement>('[data-screen-heading]')
    heading?.focus({ preventScroll: true })

    return () => {
      delete document.body.dataset.tone
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

  const finishArrival = () => {
    if (!order) return
    saveTreat(order)
    setSavedOrder(order)
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
