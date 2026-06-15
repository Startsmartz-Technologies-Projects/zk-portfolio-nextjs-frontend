import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    environment: 'node',
    // Load .env into process.env so integration tests get DATABASE_URL / AUTH_SECRET.
    setupFiles: ['dotenv/config'],
    // Run all test files in a single worker. The integration tests share the
    // Supabase **session pooler** (max 15 clients); parallel workers each open a
    // PrismaClient pool and collectively blow past that cap (EMAXCONNSESSION).
    // Serializing keeps one client active so connections stay well under the limit.
    // NOTE: production hosts hitting the session pooler should also set a
    // `connection_limit` on DATABASE_URL — Prisma defaults to cpus*2+1 (25 here),
    // which alone can exceed the pooler's 15-client cap under load.
    fileParallelism: false,
    poolOptions: { threads: { singleThread: true } },
    // Integration tests against a real Postgres DB:
    //   1. Set TEST_DATABASE_URL to a dedicated test database
    //   2. Run `DATABASE_URL=$TEST_DATABASE_URL npx prisma migrate deploy` before the suite
    //   3. Pass `--project integration` to isolate DB tests from pure-unit tests
  },
})
