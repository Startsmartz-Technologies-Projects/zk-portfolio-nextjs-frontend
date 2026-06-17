import { SignJWT, jwtVerify } from 'jose'

const ALG = 'HS256'
const SESSION_DURATION = '8h'

export type Role = 'admin' | 'editor'

export interface SessionPayload {
  sub: string   // user id
  role: Role
  sid: string   // AuthSession id (for server-side revocation — checked in auth-be-2)
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET env var is not set')
  return new TextEncoder().encode(secret)
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, sid: payload.sid })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret())
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] })
    const { sub, role, sid } = payload as Record<string, unknown>
    if (typeof sub !== 'string' || typeof role !== 'string' || typeof sid !== 'string') return null
    if (role !== 'admin' && role !== 'editor') return null
    return { sub, role, sid }
  } catch {
    return null
  }
}
