import { NextRequest, NextResponse } from 'next/server'
import { authenticate, InvalidCredentialsError } from '@/lib/auth/login'
import { setSessionCookie } from '@/lib/auth/cookies'
import { loginSchema } from '@/lib/validation/auth'
import { checkLogin, recordFailure, recordSuccess } from '@/lib/auth/login-throttle'
import { audit } from '@/lib/users/audit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { statusCode: 400, error: 'BadRequest', message: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { statusCode: 400, error: 'BadRequest', message: 'Email and password are required' },
      { status: 400 },
    )
  }

  const { email, password } = parsed.data
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const userAgent = request.headers.get('user-agent')

  // Rate-limit / lockout gate (FR-AUTH-016).
  const throttle = checkLogin(email, ip ?? 'unknown')
  if (!throttle.allowed) {
    await audit({
      actorId: null,
      action: 'login_failed',
      entityType: 'auth',
      summary: `Login blocked (${throttle.reason})`,
      metadata: { email, ip, reason: throttle.reason },
    })
    return NextResponse.json(
      { statusCode: 429, error: 'TooManyRequests', message: 'Too many attempts. Please try again later.', details: [] },
      { status: 429 },
    )
  }

  try {
    const { token, user } = await authenticate(email, password, { ip, userAgent })
    recordSuccess(email)
    await audit({ actorId: user.id, action: 'login', entityType: 'auth', entityId: user.id, summary: 'Login success', metadata: { ip } })

    const res = NextResponse.json({ ok: true, must_change_password: user.mustChangePassword })
    setSessionCookie(res, token)
    return res
  } catch (e) {
    if (e instanceof InvalidCredentialsError) {
      recordFailure(email, ip ?? 'unknown')
      await audit({ actorId: null, action: 'login_failed', entityType: 'auth', summary: 'Login failed (invalid credentials)', metadata: { email, ip } })
      return NextResponse.json(
        { statusCode: 401, error: 'InvalidCredentials', message: 'Invalid email or password', details: [] },
        { status: 401 },
      )
    }
    throw e
  }
}
