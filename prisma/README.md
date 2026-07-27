Prisma setup for StudyAccounts simulation MVP

1) Install dev dependencies (recommended):

  pnpm add -D prisma
  pnpm add @prisma/client

2) Set `DATABASE_URL` in your `.env` or `.env.local` (Postgres connection):

  DATABASE_URL="postgresql://user:pass@localhost:5432/studyaccounts"

3) Run Prisma migrate & generate:

  npx prisma migrate dev --name init
  npx prisma generate

4) Use the generated client from `prisma/client.ts` in server-side code.

Notes:
- The project currently uses Mongo/Mongoose for existing simulations. This Prisma schema is for the new interactive simulator MVP using PostgreSQL.
- If you don't want to install Prisma yet, you can still review the schema and add migrations later.
