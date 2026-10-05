# jegan's treat

A "treat" for friends who keep asking for one. It looks like a food delivery order, and Jegan delivers it personally (with a few stops on the way).

Live at **https://gifts.jegant.dev**.

## How it plays out

1. **Landing:** "Finally." Jegan is giving the treat.
2. **Menu:** pick anything. Add-ons are free, because it's not your money.
3. **Live tracking (~40 s):** the order gets picked up by Jegan, who takes the long way round a roundabout, stops at a tea shop for a "quality check", and the ETA keeps going up. You can call (declined) or message Jegan; the replies depend on where Jegan is.
4. **Delivery:** the bag arrives. The food inside is digital and already bitten. Tap the plate to eat it.
5. **Rating:** any rating you give gets adjusted to 5 stars.
6. **Receipt:** an itemised bill that totals ₹0.00, stamped TREAT GIVEN. Made to be screenshotted into the group.

## Personal links

Every friend can get their own link:

```
https://gifts.jegant.dev/arun
https://gifts.jegant.dev/priya-k     → "Priya K"
```

The name shows on the first screen, the receipt, the map pin and in the WhatsApp link preview ("Arun, your treat is ready"). Anything that isn't a name (numbers, dots, extra slashes) gets the 404 page.

## Changing things

Everything you'd want to edit is in **`src/config/treat.ts`**:

| What | Where in `treat.ts` |
| --- | --- |
| Your name, the domain | `site` |
| Menu items and prices | `dishes` (the `art` field picks one of the four drawings: `biryani`, `parotta`, `pizza`, `jamun`) |
| Add-ons | `addons` |
| The tracking story, timings and ETAs | `trackingSteps` |
| Chat replies from the rider | `chatPrompts`, `callReplies` |
| Every other line of copy | `copy` |

The WhatsApp preview image is generated from the same config (`src/lib/og.tsx`), so it stays in sync.

## Running it

Requires Node 20.9 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (also type-checks)
npm start            # serve the production build
```

## Deploying to gifts.jegant.dev (Vercel)

The repo is on GitHub (`JeganT143/gifts`). Connect it once and every push to `main` deploys.

1. Push to GitHub:
   ```bash
   git add -A
   git commit -m "Treat, ready to serve"
   git push origin main
   ```
2. Go to <https://vercel.com/new>, import **JeganT143/gifts**, and keep the defaults (Framework: Next.js, no environment variables). Click **Deploy**.
3. In the project, open **Settings → Domains**, add `gifts.jegant.dev`.
4. Add the DNS record Vercel shows you at wherever `jegant.dev` is managed:

   | Type | Name | Value |
   | --- | --- | --- |
   | CNAME | `gifts` | `cname.vercel-dns.com` |

   If `jegant.dev` already uses Vercel's nameservers, Vercel adds this record for you.
5. Wait for the domain to show **Valid Configuration** (usually a few minutes; HTTPS is automatic).

Prefer the CLI?

```bash
npm i -g vercel
vercel login
vercel link                       # create/link the project
vercel --prod                     # deploy
vercel domains add gifts.jegant.dev
```

### Before sending the link

WhatsApp caches link previews. Send the link to yourself first and check the preview looks right. If you change the preview later, paste the URL into <https://developers.facebook.com/tools/debug/> and click **Scrape Again** to refresh it.

## Project layout

```
src/
  config/treat.ts          all content and copy
  app/                     routes, metadata, share image, icons, error pages
    TreatApp.tsx           moves between the screens
    [slug]/                personal links
  components/
    screens/               Landing, Menu (+ CheckoutSheet), Tracking, Arrival, Receipt
    tracking/              the live map and its route geometry
    dishes/                the four food illustrations (SVG) and bite masking
  lib/                     formatting, storage, share, sound/vibration, timeline
assets/fonts/              fonts used to render the share image
```

No backend, no database. A finished treat is remembered in the friend's browser (`localStorage`) so they can come back to their receipt.
