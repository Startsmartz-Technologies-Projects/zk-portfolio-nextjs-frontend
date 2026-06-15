import { describe, it, expect } from 'vitest'
import { passwordPolicyErrors, isPasswordValid } from '@/lib/auth/password-policy'

describe('password policy (§12)', () => {
  it('accepts a password ≥10 chars with ≥3 character classes', () => {
    expect(passwordPolicyErrors('Test-Passw0rd!')).toEqual([])
    expect(isPasswordValid('Test-Passw0rd!')).toBe(true)
    expect(isPasswordValid('abcdABCD12')).toBe(true) // exactly 10, 3 classes
  })

  it('rejects a password shorter than 10', () => {
    expect(passwordPolicyErrors('Ab1!xyz')).toContainEqual(expect.stringContaining('at least 10'))
  })

  it('rejects fewer than 3 character classes', () => {
    expect(passwordPolicyErrors('alllowercase')).toContainEqual(expect.stringContaining('at least three'))
    expect(passwordPolicyErrors('lowercaseand1')).toContainEqual(expect.stringContaining('at least three')) // 2 classes
  })
})
