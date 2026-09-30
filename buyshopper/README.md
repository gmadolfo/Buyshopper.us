## BuyShopper

BuyShopper is a Next.js 16 demo storefront. Its first backend phase reads the public product catalog from Supabase on the server and keeps a clearly labeled demo catalog available when Supabase is not configured or the catalog query fails. The catalog is fetched per request, not captured at build time.

## Supabase setup

1. Create a Supabase project and review its plan and billing settings in Supabase. This repository does not create or configure a project.
2. Apply the migrations in timestamp order using either:
   - **Supabase Dashboard:** open the project's SQL Editor, paste the complete migration file, and run it; or
   - **Supabase CLI:** if this project has not been initialized for the CLI yet, run `npx supabase init` in this directory. Then link the existing project with `npx supabase link --project-ref <your-project-ref>` and apply pending migrations with `npx supabase db push`. The CLI may ask you to authenticate in your own terminal.
3. Add catalog data using a trusted administrative database workflow. New categories and products default to inactive; only rows with `is_active = true` are publicly readable. This phase intentionally does not add a public/admin write interface.
4. Copy `.env.example` to `.env.local` and replace its placeholders with the project's **Project URL** and **publishable key** from the Supabase Connect dialog/API settings. The application reads only `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, on the server. Never use a `service_role` or secret key in the storefront or browser environment.
5. Start the app with `npm run dev`. Without both environment variables, or if the Supabase catalog read fails, the storefront displays the illustrative demo collection and labels it as such.

Environment variables:

| Variable | Purpose | Exposure |
| --- | --- | --- |
| `SUPABASE_URL` | Supabase project URL | Server only |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key; protected by RLS | Server only |

Real `.env*` files are ignored by Git; `.env.example` contains placeholders only.

## Data model and current limits

- `categories` and `products` use UUID identifiers. Product prices and comparison prices are USD `numeric(12,2)`. The catalog DTO maps database IDs to string IDs and reads name, description, image URL, color, badge, rating, reviews, category and prices for the existing listing/detail/cart UI.
- Anonymous and authenticated clients can read active catalog rows through `storefront_catalog`, a purpose-built `security_invoker` view. Public API roles receive a table-level read grant on this view because PostgREST requires it; the view exposes only storefront fields, while base-table access remains column-scoped and RLS-filtered. There are no client write policies or grants for catalog writes.
- Catalog reads currently run per page request and are capped at 250 products. Configure caching/revalidation and monitor database usage before production traffic.
- `orders` and `order_items` are reserved structures with owner-only authenticated SELECT policies. They have no client INSERT/UPDATE/DELETE policies; anon users receive no order-table access. Order creation is not implemented.
- The current cart remains browser `localStorage` state. There is no authentication, admin interface, inventory reservation, real order persistence, shipping/tax policy, payment processing, or payment webhook. Checkout remains labeled demo-only; no card details are collected.
- The database schema currently includes only the item subtotal and USD currency. It does not encode business rules for shipping, taxes, returns, or fulfillment.

## Development checks

```bash
npm run lint
npm run build
```

The storefront uses the App Router server page for catalog access and passes only public catalog fields to the interactive client component.
