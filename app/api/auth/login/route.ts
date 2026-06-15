import { NextRequest, NextResponse } from 'next/server'
import { authenticate, InvalidCredentialsError } from '@/lib/auth/login'
import { setSessionCookie } from '@/lib/auth/cookies'
import { loginSchema } from '@/lib/validation/auth'

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

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const userAgent = request.headers.get('user-agent')
    const { token, user } = await authenticate(parsed.data.email, parsed.data.password, { ip, userAgent })

    const res = NextResponse.json({ ok: true, must_change_password: user.mustChangePassword })
    setSessionCookie(res, token)
    return res
  } catch (e) {
    if (e instanceof InvalidCredentialsError) {
      return NextResponse.json(
        { statusCode: 401, error: 'InvalidCredentials', message: 'Invalid email or password' },
        { status: 401 },
      )
    }
    throw e
  }
}
