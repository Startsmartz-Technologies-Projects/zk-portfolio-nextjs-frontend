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
    // Integration tests against a real Postgres DB:
    //   1. Set TEST_DATABASE_URL to a dedicated test database
    //   2. Run `DATABASE_URL=$TEST_DATABASE_URL npx prisma migrate deploy` before the suite
    //   3. Pass `--project integration` to isolate DB tests from pure-unit tests
  },
})
