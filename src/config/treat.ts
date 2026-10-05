/**
 * Everything a person would want to change lives in this file: the host's
 * name, the menu, the tracking script and every line of copy.
 *
 * Friends can get a personal link: gifts.jegant.dev/arun shows "Arun," on the
 * first screen, in the WhatsApp preview and on the receipt.
 */

export const site = {
  url: 'https://gifts.jegant.dev',
  /** The person giving the "treat". */
  host: 'Jegan',
  /** Used on the rider avatar and handwritten sign-offs. */
  hostInitial: 'J',
  brand: "jegan's treat",
  /** Shown on the receipt when the friend leaves the name field empty. */
  fallbackName: 'A very patient friend',
}

const { host, hostInitial } = site

/* -------------------------------------------------------------------------- */
/* Menu                                                                        */
/* -------------------------------------------------------------------------- */

/** Illustrations available in src/components/dishes. */
export type DishArt = 'biryani' | 'parotta' | 'pizza' | 'jamun'

export type Dish = {
  id: string
  name: string
  /** Lower-case name used inside sentences ("Your biryani is being prepared"). */
  shortName: string
  description: string
  price: number
  tag?: string
  art: DishArt
}

export const dishes: Dish[] = [
  {
    id: 'biryani',
    name: 'Chicken biryani',
    shortName: 'biryani',
    description: 'Full plate, leg piece, extra gravy. The reason we are all friends.',
    price: 349,
    tag: 'Most ordered',
    art: 'biryani',
  },
  {
    id: 'parotta',
    name: 'Parotta & salna',
    shortName: 'parotta',
    description: 'Four parottas, because three is an insult. Salna on the side.',
    price: 180,
    art: 'parotta',
  },
  {
    id: 'pizza',
    name: 'Large paneer pizza',
    shortName: 'pizza',
    description: 'Extra cheese. Large, because you were never going to share.',
    price: 599,
    tag: 'Most expensive',
    art: 'pizza',
  },
  {
    id: 'jamun',
    name: 'Gulab jamun',
    shortName: 'gulab jamun',
    description: 'Five of them, swimming in syrup. Dessert first is allowed today.',
    price: 140,
    art: 'jamun',
  },
]

export type Addon = {
  id: string
  label: string
  /** A number, or 'dish' to cost the same as the chosen dish. */
  price: number | 'dish'
}

export const addons: Addon[] = [
  { id: 'drink', label: 'Cold drink', price: 60 },
  { id: 'icecream', label: 'Ice cream', price: 90 },
  { id: 'double', label: 'Make it a double', price: 'dish' },
]

/** How much of the food the host "quality checks" on the way. */
export const tastedPercent = 15

/* -------------------------------------------------------------------------- */
/* Live tracking script                                                        */
/* -------------------------------------------------------------------------- */

export type Phase = 'confirmed' | 'preparing' | 'on-the-way' | 'delivered'

/** Where the rider is headed on the map during a step. */
export type Waypoint = 'junction' | 'roundabout' | 'teaShop' | 'nearHome' | 'home'

export type StatusContext = {
  dish: string
  /** Clock time a given number of minutes after the order, e.g. "7:43 PM". */
  at: (minutes: number) => string
}

export type TrackingStep = {
  id: string
  phase: Phase
  /** Minutes after the order was placed. Drives the timestamps. */
  minute: number
  /** "Arriving in" value. A string is shown as-is. */
  eta: number | string
  /** How long the step stays on screen, in milliseconds. */
  hold: number
  /** Where the rider moves to. Omit while nobody has picked the food up. */
  rider?: Waypoint
  /** The rider is stopped somewhere they should not be. */
  stalled?: boolean
  /** A little speech bubble over the rider on the map. */
  bubble?: string
  title: (c: StatusContext) => string
  detail: (c: StatusContext) => string
}

export const trackingSteps: TrackingStep[] = [
  {
    id: 'confirmed',
    phase: 'confirmed',
    minute: 0,
    eta: 28,
    hold: 2400,
    title: () => 'Order confirmed',
    detail: () => `${host} has been notified.`,
  },
  {
    id: 'seen',
    phase: 'confirmed',
    minute: 1,
    eta: 28,
    hold: 3000,
    title: () => `${host} has seen your order`,
    detail: (c) => `Seen at ${c.at(1)}. Typing…`,
  },
  {
    id: 'paid',
    phase: 'confirmed',
    minute: 2,
    eta: 27,
    hold: 3600,
    title: () => 'Payment successful',
    detail: () => `Paid by ${host}. Screenshot this, it may not happen again.`,
  },
  {
    id: 'preparing',
    phase: 'preparing',
    minute: 5,
    eta: 24,
    hold: 3000,
    title: (c) => `Your ${c.dish} is being prepared`,
    detail: () => 'Fresh and hot. Smells incredible, apparently.',
  },
  {
    id: 'called',
    phase: 'preparing',
    minute: 9,
    eta: 26,
    hold: 3800,
    title: () => `${host} called the restaurant`,
    detail: () => 'To ask if a half plate would also be fine. They said no.',
  },
  {
    id: 'pickup',
    phase: 'on-the-way',
    minute: 15,
    eta: 18,
    hold: 3600,
    rider: 'junction',
    title: () => `Picked up by ${host}`,
    detail: () => `${host} is delivering it personally. Saves the delivery fee.`,
  },
  {
    id: 'detour',
    phase: 'on-the-way',
    minute: 19,
    eta: 23,
    hold: 4600,
    rider: 'roundabout',
    title: () => `${host} is taking a slightly longer route`,
    detail: () => `“It’s a shortcut,” says ${host}.`,
  },
  {
    id: 'stopped',
    phase: 'on-the-way',
    minute: 24,
    eta: 31,
    hold: 3800,
    rider: 'teaShop',
    stalled: true,
    title: () => `${host} has stopped`,
    detail: () => 'Near a tea shop. Reason given: “checking if the food is okay.”',
  },
  {
    id: 'tasting',
    phase: 'on-the-way',
    minute: 27,
    eta: 'Soon',
    hold: 4000,
    rider: 'teaShop',
    stalled: true,
    bubble: 'mmm',
    title: () => 'Quality check in progress',
    detail: () => 'Verdict so far: very good. Confirming with one more bite.',
  },
  {
    id: 'moving',
    phase: 'on-the-way',
    minute: 35,
    eta: 6,
    hold: 3400,
    rider: 'nearHome',
    title: () => `${host} is on the way again`,
    detail: () => `Your order is now about ${tastedPercent}% lighter.`,
  },
  {
    id: 'arriving',
    phase: 'on-the-way',
    minute: 40,
    eta: 1,
    hold: 2800,
    rider: 'home',
    title: () => 'Arriving now',
    detail: () => 'Please keep your expectations ready.',
  },
  {
    id: 'delivered',
    phase: 'delivered',
    minute: 41,
    eta: 0,
    hold: 1800,
    rider: 'home',
    title: () => 'Delivered',
    detail: () => 'Enjoy your treat.',
  },
]

/* -------------------------------------------------------------------------- */
/* Chatting with the delivery partner                                          */
/* -------------------------------------------------------------------------- */

/**
 * Where the rider is in the story. "stalled" is any step marked stalled above,
 * "arriving" is everything after the last stalled step.
 */
export type RiderMood = 'riding' | 'stalled' | 'arriving'

export type ChatPrompt = {
  id: string
  label: string
  replies: Record<RiderMood, string>
}

/** Quick replies the friend can send. Asking the same thing twice gets left on seen. */
export const chatPrompts: ChatPrompt[] = [
  {
    id: 'where',
    label: 'Where are you?',
    replies: {
      riding: 'Very close. Two minutes.',
      stalled: 'Stuck in traffic.',
      arriving: 'Outside only. Come down.',
    },
  },
  {
    id: 'hurry',
    label: 'Hurry up',
    replies: {
      riding: 'Going full speed. Safely.',
      stalled: 'Tea is hot. Two minutes.',
      arriving: 'Relax. Almost there.',
    },
  },
  {
    id: 'eat',
    label: 'Don’t eat my food',
    replies: {
      riding: 'Who do you think I am?',
      stalled: 'Not eating. Just checking the salt.',
      arriving: 'I didn’t eat it. I tasted it. Big difference.',
    },
  },
]

/** What the host says after declining a call. */
export const callReplies: Record<RiderMood, string> = {
  riding: 'Driving. Will call back.',
  stalled: 'Can’t talk. Eating.',
  arriving: 'Coming, coming.',
}

/* -------------------------------------------------------------------------- */
/* Copy                                                                        */
/* -------------------------------------------------------------------------- */

export const copy = {
  meta: {
    title: `${host}'s treat is finally here`,
    personalTitle: (name: string) => `${name}, your treat is ready`,
    description: 'Order anything you want. It’s on me. — ' + host,
  },
  landing: {
    headline: 'Finally.',
    body: `You asked. Then you kept asking. So here it is: ${host}’s treat. Order anything you want.`,
    note: `It’s on me. For real this time.\u00A0—\u00A0${hostInitial}`,
    cta: 'Claim my treat',
    footnote: `Valid while ${host} is still in a good mood.`,
    /** Runs around the spinning sticker next to the headline. */
    sticker: 'Treat approved · Asked 1,284 times · ',
    returning: 'You’ve already been treated.',
    returningLink: 'See your receipt',
  },
  menu: {
    eyebrow: 'Menu',
    title: 'What are you having?',
    subtitle: `Anything you want. ${host}’s paying.`,
  },
  checkout: {
    addonsTitle: 'Add something?',
    addonsHint: 'Go on. It’s not your money.',
    itemTotal: 'Item total',
    delivery: 'Delivery fee',
    deliveryValue: 'Free',
    paidBy: `Paid by ${host}`,
    toPay: 'To pay',
    deliverTo: 'Deliver to',
    namePlaceholder: 'Your name',
    cta: 'Place order',
    placing: 'Placing order…',
  },
  tracking: {
    live: 'Live',
    etaLabel: 'Arriving in',
    phases: { confirmed: 'Confirmed', preparing: 'Preparing', 'on-the-way': 'On the way', delivered: 'Delivered' },
    riderRole: 'Your delivery partner',
    riderRating: '4.9 (self-rated)',
    call: 'Call',
    calling: 'Calling…',
    callDeclined: `${host} declined your call`,
    seen: 'Seen',
    typing: `${host} is typing`,
    chatLabel: `Message ${host}`,
    restaurant: 'Restaurant',
    teaShop: 'Tea shop',
    streets: ['Promise Rd', 'Excuse St', 'Someday Ave'],
    paidLine: `₹0 · paid by ${host}`,
  },
  arrival: {
    eyebrow: (time: string) => `Delivered at ${time}`,
    headline: 'It’s here.',
    bagNote: `Checked it for you. Very good.\u00A0—\u00A0${hostInitial}`,
    open: 'Open the bag',
    dishLine: 'Hand-delivered. Lightly tasted. Completely digital.',
    /** Shown after the given number of bites. */
    captions: [
      [0, 'Tap the plate to eat.'],
      [1, 'Good, right?'],
      [3, 'Relax. Nobody’s taking it. Anymore.'],
      [6, 'Almost there.'],
    ] as const,
    finished: 'Clean plate.',
    rateQuestion: 'How was your treat?',
    ratePerfect: 'Correct answer.',
    rateCorrected: 'We’ve adjusted that to 5 stars for you.',
  },
  receipt: {
    headline: 'That was the treat.',
    title: 'Tax invoice',
    billedTo: 'Billed to',
    deliveredBy: 'Delivered by',
    deliveredByValue: `${host}, personally`,
    deliveryLine: `Delivery (by ${host})`,
    tastedLine: `Quality check (by ${host})`,
    digitalLine: 'Digital discount',
    total: 'Total',
    paidBy: `Paid by ${host}`,
    rating: 'Your rating',
    ratingValue: (given: number) => (given >= 5 ? '5 stars' : `5 stars (you said ${given})`),
    calories: 'Calories',
    status: 'Treat status',
    statusValue: 'GIVEN',
    stamp: 'Treat given',
    signatory: 'Authorised signatory',
    finePrint:
      'Valid proof of treat in all group chats. Non-refundable. Further treat requests will be left on seen.',
    note: 'Thanks for always asking. The real one is coming soon. This was just to buy some time.',
    signoff: `—\u00A0${host}`,
    share: 'Share with the group',
    shareText: `${host} finally gave me a treat. Claim yours:`,
    again: 'Order again',
    againToast: 'One treat per person. It’s in the fine print.',
    copied: 'Link copied. Paste it in the group.',
  },
}
