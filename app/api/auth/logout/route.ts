import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/auth/jwt'
import { SESSION_COOKIE, clearSessionCookie } from '@/lib/auth/cookies'
import { revokeSession } from '@/lib/auth/session'
import { audit } from '@/lib/users/audit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (token) {
    const payload = await verifySessionToken(token)
    if (payload) {
      await revokeSession(payload.sid)
      await audit({ actorId: payload.sub, action: 'logout', entityType: 'auth', entityId: payload.sub, summary: 'Logout' })
    }
  }
  const res = NextResponse.json({ ok: true })
  clearSessionCookie(res)
  return res
}
