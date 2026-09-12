# Zain Delivery

Local cash-on-delivery ordering for Kafr Haris and nearby villages.

**Live site:** [https://zaindelivery.shop](https://zaindelivery.shop)

## Overview

Zain Delivery is a lightweight web app for local food and grocery delivery. Customers browse stores, place orders without creating an account, pay on delivery, and track order status. Operators manage orders and site content from a private control panel.

## Features

- Arabic-first customer experience
- Restaurant, mini-market, and fresh produce ordering
- Cash on delivery only
- Order tracking without customer accounts
- Progressive Web App (PWA) install support
- Operator dashboard for orders and settings

## Tech stack

- [Next.js](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL (production)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

Environment variables are documented in `.env.example`. Copy that file to `.env.local` for local use. Never commit real credentials or `.env` files.

## License & copyright

Copyright © 2026 Zain Delivery. All rights reserved.

This software and its contents are proprietary. Unauthorized copying, distribution, modification, or commercial use is prohibited without prior written permission from the copyright holder.

The live service at [zaindelivery.shop](https://zaindelivery.shop) and related branding are trademarks of their respective owners.
