const rupees = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const rupeesExact = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const clock = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatRupees = (amount: number) => `₹${rupees.format(amount)}`

/** Receipt style: 1,234.00 with a real minus sign for discounts. */
export const formatAmount = (amount: number) =>
  `${amount < 0 ? '−' : ''}${rupeesExact.format(Math.abs(amount))}`

export const formatClock = (time: number) => clock.format(time)

export const formatDay = (time: number) => day.format(time)

export const minutesLater = (time: number, minutes: number) => time + minutes * 60_000
