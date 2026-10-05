import { findAddons, findDish, type Order } from './order'

const KEY = 'jegans-treat:v1'

type Saved = {
  orderNo: string
  name: string
  dishId: string
  addonIds: string[]
  placedAt: number
  rating?: number
}

/** Remembers a finished treat so a returning friend can get back to their receipt. */
export function saveTreat(order: Order) {
  const saved: Saved = {
    orderNo: order.orderNo,
    name: order.name,
    dishId: order.dish.id,
    addonIds: order.addons.map((addon) => addon.id),
    placedAt: order.placedAt,
    rating: order.rating,
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(saved))
  } catch {
    // Private mode or blocked storage: the receipt just won't be remembered.
  }
}

export function loadTreat(): Order | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as Partial<Saved>
    const dish = typeof saved.dishId === 'string' ? findDish(saved.dishId) : undefined
    if (!dish || typeof saved.orderNo !== 'string' || typeof saved.placedAt !== 'number') return null
    return {
      orderNo: saved.orderNo,
      name: typeof saved.name === 'string' ? saved.name : '',
      dish,
      addons: Array.isArray(saved.addonIds) ? findAddons(saved.addonIds) : [],
      placedAt: saved.placedAt,
      rating: typeof saved.rating === 'number' ? saved.rating : undefined,
    }
  } catch {
    return null
  }
}
