import { describe, it, expect } from 'vitest'
import { isRootRelative, normalizePath, resolveTarget, collapseChain, RedirectConflictError } from '@/lib/seo/redirects'

describe('redirect path helpers', () => {
  it('validates root-relative paths', () => {
    expect(isRootRelative('/projects/x')).toBe(true)
    expect(isRootRelative('https://x.com/y')).toBe(false)
    expect(isRootRelative('relative')).toBe(false)
    expect(isRootRelative('/has space')).toBe(false)
  })
  it('normalizes a trailing slash (except root)', () => {
    expect(normalizePath('/a/b/')).toBe('/a/b')
    expect(normalizePath(' /a ')).toBe('/a')
    expect(normalizePath('/')).toBe('/')
  })
})

describe('resolveTarget', () => {
  it('follows a chain to its terminal', () => {
    expect(resolveTarget('/a', new Map([['/a', '/b'], ['/b', '/c']]))).toBe('/c')
  })
  it('returns the input when not a redirect source', () => {
    expect(resolveTarget('/x', new Map([['/a', '/b']]))).toBe('/x')
  })
  it('throws on a loop', () => {
    expect(() => resolveTarget('/x', new Map([['/x', '/y'], ['/y', '/x']]))).toThrow(RedirectConflictError)
  })
})

describe('collapseChain', () => {
  it('rejects a self-loop', () => {
    expect(() => collapseChain('/a', '/a', [])).toThrow(RedirectConflictError)
  })

  it('points the new edge at the terminal target', () => {
    // Adding /a → /b when /b → /c already exists collapses to /a → /c.
    const r = collapseChain('/a', '/b', [{ fromPath: '/b', toPath: '/c' }])
    expect(r).toMatchObject({ fromPath: '/a', toPath: '/c' })
  })

  it('repoints existing predecessors when adding B → C after A → B', () => {
    const r = collapseChain('/b', '/c', [{ fromPath: '/a', toPath: '/b' }])
    expect(r.toPath).toBe('/c')
    expect(r.repoint).toEqual([{ fromPath: '/a', toPath: '/c' }])
  })

  it('rejects a cycle', () => {
    // Adding /b → /a when /a → /b exists would loop.
    expect(() => collapseChain('/b', '/a', [{ fromPath: '/a', toPath: '/b' }])).toThrow(RedirectConflictError)
  })
})
