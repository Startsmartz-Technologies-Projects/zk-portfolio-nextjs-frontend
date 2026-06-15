/** AUTH error taxonomy — mapped to the platform error shape at the route/action boundary. */

/** New password fails the complexity policy or reuse rule (HTTP 422). */
export class PasswordPolicyError extends Error {
  readonly statusCode = 422
  readonly code = 'ValidationError'
  readonly details: { message: string }[]
  constructor(messages: string[]) {
    super(messages[0] ?? 'Password does not meet the policy')
    this.name = 'PasswordPolicyError'
    this.details = messages.map((message) => ({ message }))
  }
}

/** Login rate-limited or account temporarily locked out (HTTP 429). */
export class TooManyRequestsError extends Error {
  readonly statusCode = 429
  readonly code = 'TooManyRequests'
  readonly retryAfterMs?: number
  constructor(message = 'Too many attempts. Please try again later.', retryAfterMs?: number) {
    super(message)
    this.name = 'TooManyRequestsError'
    this.retryAfterMs = retryAfterMs
  }
}

/** Authenticated but blocked until the temporary password is changed (HTTP 403). */
export class MustChangePasswordError extends Error {
  readonly statusCode = 403
  readonly code = 'MustChangePassword'
  constructor(message = 'You must change your temporary password before continuing.') {
    super(message)
    this.name = 'MustChangePasswordError'
  }
}
