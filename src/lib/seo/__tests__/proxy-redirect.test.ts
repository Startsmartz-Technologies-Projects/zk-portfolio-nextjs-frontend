import { describe, it, expect } from 'vitest'
import { isAdminPath, toRedirect } from '@/src/lib/seo/proxy-redirect'

describe('isAdminPath', () => {
  it('matches the admin area only', () => {
    expect(isAdminPath('/admin')).toBe(true)
    expect(isAdminPath('/admin/projects')).toBe(true)
    expect(isAdminPath('/projects')).toBe(false)
    expect(isAdminPath('/')).toBe(false)
    // not a false-positive on a path that merely starts with the substring
    expect(isAdminPath('/administrate')).toBe(false)
  })
})

describe('toRedirect', () => {
  it('returns the target + status for a matched permanent redirect', () => {
    expect(toRedirect({ match: true, toPath: '/projects/riverside-bridge', status: 301 })).toEqual({
      toPath: '/projects/riverside-bridge',
      status: 301,
    })
  })

  it('preserves a temporary (302) status', () => {
    expect(toRedirect({ match: true, toPath: '/x', status: 302 })?.status).toBe(302)
  })

  it('defaults a matched row with no status to 301', () => {
    expect(toRedirect({ match: true, toPath: '/x' })?.status).toBe(301)
  })

  it('passes through (null) when there is no match', () => {
    expect(toRedirect({ match: false })).toBeNull()
    // a degenerate match with no target also passes through
    expect(toRedirect({ match: true })).toBeNull()
  })
})
