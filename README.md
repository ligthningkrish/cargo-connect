# CargoConnect

CargoConnect is a premium logistics marketplace for buying and selling unused shipping-container capacity.

## Run locally

```bash
pnpm install
pnpm dev
```

The application includes an interactive demo login and dashboards at `/dashboard/trader`, `/dashboard/provider`, and `/dashboard/admin`. The booking flow animates box occupancy and unlocks provider details after confirmation.

## Supabase integration

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL editor.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
3. Replace the demo state in `components/dashboard.tsx` with Supabase queries/actions. The schema covers profiles, provider approvals, containers, bookings, and realtime messages.

For production, process payments in a server action or webhook-backed route and atomically increment `occupied_boxes` only after confirmation.
