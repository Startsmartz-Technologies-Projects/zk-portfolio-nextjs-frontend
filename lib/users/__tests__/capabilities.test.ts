import { describe, it, expect } from 'vitest'
import { CAPABILITIES, can, type Capability } from '@/lib/users/capabilities'

// Pure unit test of the §8.2 capability matrix — no DB required.

const EDITOR_ALLOWED: Capability[] = ['seo_meta', 'content', 'media', 'leads_triage', 'dashboard']
const EDITOR_DENIED: Capability[] = ['user_admin', 'site_settings', 'seo_config', 'leads_manage', 'audit_log']

describe('capability policy (§8.2)', () => {
  it('admin has every capability', () => {
    for (const cap of CAPABILITIES) {
      expect(can('admin', cap)).toBe(true)
    }
  })

  it('editor is allowed the content-work capabilities', () => {
    for (const cap of EDITOR_ALLOWED) {
      expect(can('editor', cap)).toBe(true)
    }
  })

  it('editor is denied the admin-only capabilities', () => {
    for (const cap of EDITOR_DENIED) {
      expect(can('editor', cap)).toBe(false)
    }
  })

  it('the allowed + denied sets together cover the whole matrix (no gaps)', () => {
    expect([...EDITOR_ALLOWED, ...EDITOR_DENIED].sort()).toEqual([...CAPABILITIES].sort())
  })
})
