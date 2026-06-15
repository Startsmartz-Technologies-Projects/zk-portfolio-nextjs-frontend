import { cookies } from 'next/headers'
import { verifySessionToken } from './jwt'
import { SESSION_COOKIE } from './cookies'

export type { SessionPayload, Role } from './jwt'

/**
 * Returns the authenticated principal from the session cookie, or null.
 * DB-side revocation check (AuthSession + User status) is added in auth-be-2.
 */
export async function auth() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}
