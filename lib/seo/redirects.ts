import { AppError } from '@/lib/errors'

const MAX_HOPS = 20

/** A redirect conflict — loop, chain, or live-URL collision (HTTP 409, `RedirectConflict`). */
export class RedirectConflictError extends AppError {
  constructor(message: string, details: unknown[] = []) {
    super(409, 'RedirectConflict', message, details)
  }
}

/** True for a root-relative path (`/…`, no scheme/host/whitespace). */
export function isRootRelative(path: string): boolean {
  return /^\/[^\s]*$/.test(path)
}

/** Normalize a path: trim, collapse a trailing slash (except root). */
export function normalizePath(path: string): string {
  const p = path.trim()
  if (p.length > 1 && p.endsWith('/')) return p.replace(/\/+$/, '')
  return p
}

/**
 * Follow the redirect chain from `start` to its terminal target using the
 * `fromPath → toPath` edge map. Throws {@link RedirectConflictError} on a loop or an
 * over-long chain. Returns `start` unchanged if it isn't a redirect source.
 */
export function resolveTarget(start: string, edges: Map<string, string>): string {
  let current = start
  const seen = new Set<string>([start])
  for (let i = 0; i < MAX_HOPS; i++) {
    const next = edges.get(current)
    if (next === undefined) return current
    if (seen.has(next)) {
      throw new RedirectConflictError('Redirect would create a loop', [{ rule: 'loop', at: next }])
    }
    seen.add(next)
    current = next
  }
  throw new RedirectConflictError('Redirect chain is too long', [{ rule: 'chain_too_long' }])
}

/**
 * Compute the single-hop result of adding `from → to` to an existing set of
 * (single-hop) redirects. Collapses chains: the new edge points at `to`'s terminal
 * target, and any existing `X → from` is repointed to that terminal (so `A→B→C`
 * becomes `A→C` + `B→C`). Throws on a self-loop or a cycle.
 *
 * Pure — the caller persists `result.fromPath → result.toPath` and applies
 * `result.repoint` (each `{ fromPath → toPath }`).
 */
export function collapseChain(
  from: string,
  to: string,
  existing: { fromPath: string; toPath: string }[],
): { fromPath: string; toPath: string; repoint: { fromPath: string; toPath: string }[] } {
  if (from === to) throw new RedirectConflictError('Redirect target equals its source', [{ rule: 'self_loop' }])

  // Edge map excluding any prior edge for `from` (we're replacing it).
  const edges = new Map<string, string>()
  for (const e of existing) {
    if (e.fromPath !== from) edges.set(e.fromPath, e.toPath)
  }

  const finalTo = resolveTarget(to, edges)
  if (finalTo === from) {
    throw new RedirectConflictError('Redirect would create a loop', [{ rule: 'loop', at: from }])
  }

  // Repoint direct predecessors X→from to X→finalTo (keeps everything single-hop).
  const repoint = existing
    .filter((e) => e.toPath === from && e.fromPath !== from)
    .map((e) => ({ fromPath: e.fromPath, toPath: finalTo }))

  return { fromPath: from, toPath: finalTo, repoint }
}
