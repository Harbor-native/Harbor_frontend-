# Harbor

Harbor is a frontend UI for a **fiat-to-crypto on-ramp** — a product that lets
a user connect a crypto wallet, buy crypto with a card or bank transfer, and
receive it directly in their wallet. This repo contains the client
application only: every flow runs against a local mock data layer, so it can
be explored and demoed with no backend, API keys, or real wallet extension
required.

## Features

- **Wallet connect** — a simulated connect flow (MetaMask, Phantom, Coinbase
  Wallet, WalletConnect) that generates a mock address per provider and
  network, with connect/disconnect state in the header.
- **Buy flow** — a 4-step purchase wizard: amount + asset, payment method,
  reviewable live quote (rate, provider fee, network fee, 30s quote expiry),
  and a confirm step that simulates settlement (pending → processing →
  completed/failed).
- **Identity verification (KYC)** — a multi-step form (personal info,
  address, ID document) required for purchases over $1,000, with a simulated
  pending → verified review cycle.
- **Transaction history** — a filterable list of past purchases with a detail
  view showing the full settlement timeline, fees, and a mock transaction
  hash.
- **Dashboard** — wallet, verification, and account stats at a glance, plus
  recent activity.
- Light/dark theme (follows system preference, toggle in the header) and a
  responsive layout down to mobile widths.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- React state via Context + `useReducer`, persisted to `localStorage` so
  wallet/KYC/transaction state survives a page refresh

## Mock data layer

There is no backend. All "live" data — exchange rates, quotes, wallet
addresses, transaction settlement — is generated client-side in
[`src/lib/mock-data.ts`](src/lib/mock-data.ts) and orchestrated through
[`src/context/AppStateContext.tsx`](src/context/AppStateContext.tsx), which
simulates the async delays and occasional failures a real on-ramp provider
would have (wallet connection, KYC review, payment processing). Swapping in a
real provider means replacing the functions in that file with real API calls
— the UI and component layer are unaware of the mock/real distinction.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # ESLint
```

## Project structure

```
src/
  app/                 # routes: / (dashboard), /buy, /kyc, /transactions
  components/
    buy/               # amount/asset/payment pickers, quote breakdown, buy wizard
    kyc/                # KYC step form + status card
    transactions/       # transaction row, status badge, detail modal
    wallet/              # wallet connect button + provider modal
    layout/              # header, nav, theme toggle
    ui/                   # button, card, badge, form fields, modal, stepper
  context/               # global app state (wallet, KYC, transactions)
  lib/                   # types, mock data/quote generation, formatting helpers
```
