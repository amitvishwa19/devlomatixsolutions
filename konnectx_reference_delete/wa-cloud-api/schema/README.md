# WhatsApp Cloud API — Prisma schema

`schema.prisma` mirrors every `wa_*` table in the connected Postgres database
(Supabase / Lovable Cloud). It is meant for code generation and reference; the
app itself uses the Supabase JS client at runtime.

## Use it with Prisma

1. `npm i -D prisma && npm i @prisma/client`
2. Set `DATABASE_URL` to your Postgres connection string.
3. Generate the client:
   ```
   npx prisma generate --schema src/wa-cloud-api/schema/schema.prisma
   ```
4. (Optional) introspect/diff against the live DB:
   ```
   npx prisma db pull --schema src/wa-cloud-api/schema/schema.prisma
   ```

## Keeping it in sync

Whenever a Supabase migration changes a `wa_*` table, update the matching
model in `schema.prisma` (column added/removed/renamed, default changed,
unique constraint, etc.) so generated types stay accurate.