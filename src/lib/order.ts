import { addons as allAddons, dishes, site, tastedPercent, type Addon, type Dish } from '@/config/treat'

export type Order = {
  orderNo: string
  /** Empty when the friend skipped the name field. */
  name: string
  dish: Dish
  addons: Addon[]
  placedAt: number
}

export const addonPrice = (addon: Addon, dish: Dish) =>
  addon.price === 'dish' ? dish.price : addon.price

export function orderLines(order: Pick<Order, 'dish' | 'addons'>) {
  const items = [
    { label: order.dish.name, amount: order.dish.price },
    ...order.addons.map((addon) => ({ label: addon.label, amount: addonPrice(addon, order.dish) })),
  ]
  const itemTotal = items.reduce((sum, item) => sum + item.amount, 0)
  const tasted = Math.round((order.dish.price * tastedPercent) / 100)
  return { items, itemTotal, tasted, digitalDiscount: itemTotal - tasted }
}

export const displayName = (order: Pick<Order, 'name'>) => order.name || site.fallbackName

export function newOrderNumber() {
  return `TRT-${Math.floor(1000 + Math.random() * 9000)}`
}

export const findDish = (id: string) => dishes.find((dish) => dish.id === id)

export const findAddons = (ids: string[]) => allAddons.filter((addon) => ids.includes(addon.id))
