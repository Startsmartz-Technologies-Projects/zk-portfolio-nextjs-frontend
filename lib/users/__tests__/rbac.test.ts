import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Capability } from '@/lib/users/capabilities'

// Mock the AUTH guard and the audit service so this is a pure unit test of the
// policy enforcement (no DB, no cookies). vi.hoisted lets the mock factories
// reference the spies safely.
const { authMock, auditMock } = vi.hoisted(() => ({ authMock: vi.fn(), auditMock: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/users/audit', () => ({ audit: auditMock }))

import { requireCapability, UnauthorizedError, ForbiddenError } from '@/lib/users/rbac'
import { CAPABILITIES } from '@/lib/users/capabilities'

const EDITOR_ALLOWED: Capability[] = ['seo_meta', 'content', 'media', 'leads_triage', 'dashboard']
const EDITOR_DENIED: Capability[] = ['user_admin', 'site_settings', 'seo_config', 'leads_manage', 'audit_log']

function principal(role: 'admin' | 'editor') {
  return { user_id: 'u-1', email: 'x@y.z', full_name: 'X', role, status: 'active', must_change_password: false }
}

beforeEach(() => {
  authMock.mockReset()
  auditMock.mockReset()
})

describe('requireCapability', () => {
  it('throws Unauthorized (401) when there is no session, and does not audit', async () => {
    authMock.mockResolvedValue(null)
    await expect(requireCapability('content')).rejects.toBeInstanceOf(UnauthorizedError)
    expect(auditMock).not.toHaveBeenCalled()
  })

  it('lets an admin through every capability without auditing', async () => {
    authMock.mockResolvedValue(principal('admin'))
    for (const cap of CAPABILITIES) {
      await expect(requireCapability(cap)).resolves.toMatchObject({ role: 'admin' })
    }
    expect(auditMock).not.toHaveBeenCalled()
  })

  it('lets an editor through the content-work capabilities', async () => {
    authMock.mockResolvedValue(principal('editor'))
    for (const cap of EDITOR_ALLOWED) {
      await expect(requireCapability(cap)).resolves.toMatchObject({ role: 'editor' })
    }
    expect(auditMock).not.toHaveBeenCalled()
  })

  it('blocks an editor from admin-only capabilities with 403 + an access_denied audit', async () => {
    authMock.mockResolvedValue(principal('editor'))
    for (const cap of EDITOR_DENIED) {
      await expect(requireCapability(cap)).rejects.toBeInstanceOf(ForbiddenError)
    }
    expect(auditMock).toHaveBeenCalledTimes(EDITOR_DENIED.length)
    // Each denial records an access_denied entry attributed to the principal.
    for (const call of auditMock.mock.calls) {
      expect(call[0]).toMatchObject({ action: 'access_denied', actorId: 'u-1', entityType: 'authorization' })
    }
  })

  it('returns the principal on success', async () => {
    authMock.mockResolvedValue(principal('admin'))
    const p = await requireCapability('user_admin')
    expect(p.user_id).toBe('u-1')
  })
})
