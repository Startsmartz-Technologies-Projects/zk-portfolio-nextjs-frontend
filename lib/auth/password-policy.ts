// Password complexity policy (SRS auth §12): min length 10, at least three of
// {lowercase, uppercase, digit, symbol}.

export const PASSWORD_MIN_LENGTH = 10
export const PASSWORD_MIN_CLASSES = 3

function characterClasses(pw: string): number {
  let n = 0
  if (/[a-z]/.test(pw)) n++
  if (/[A-Z]/.test(pw)) n++
  if (/[0-9]/.test(pw)) n++
  if (/[^a-zA-Z0-9]/.test(pw)) n++
  return n
}

/** Policy violations for a candidate password; empty array means it passes. */
export function passwordPolicyErrors(pw: string): string[] {
  const errors: string[] = []
  if (pw.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
  }
  if (characterClasses(pw) < PASSWORD_MIN_CLASSES) {
    errors.push('Password must include at least three of: lowercase, uppercase, digit, and symbol.')
  }
  return errors
}

export function isPasswordValid(pw: string): boolean {
  return passwordPolicyErrors(pw).length === 0
}
