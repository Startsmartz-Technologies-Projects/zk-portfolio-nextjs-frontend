import { randomInt } from 'node:crypto'
import { db } from '@/lib/db'

// Human-facing lead reference number `ZE-NNNNNN` (BR-2, SRS §12). System-generated,
// never client-supplied. Six zero-padded digits over a cryptographically-random draw;
// uniqueness is guaranteed by re-drawing on the rare collision (edge 6).

export const REFERENCE_NO_RE = /^ZE-\d{6}$/

const REFERENCE_MODULUS = 1_000_000
const MAX_ATTEMPTS = 50

/** Format a draw as `ZE-NNNNNN` (six zero-padded digits). Pure. */
export function formatReferenceNo(n: number): string {
  return `ZE-${String(((n % REFERENCE_MODULUS) + REFERENCE_MODULUS) % REFERENCE_MODULUS).padStart(6, '0')}`
}

/**
 * Allocate a unique reference by re-drawing past collisions (edge 6). Pure over its
 * injected `isTaken` predicate + `rand` source, so the retry loop is unit-testable
 * without a DB. Throws if it can't find a free value within {@link MAX_ATTEMPTS}.
 */
export async function allocateReferenceNo(
  isTaken: (ref: string) => Promise<boolean>,
  rand: () => number = () => randomInt(0, REFERENCE_MODULUS),
): Promise<string> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const ref = formatReferenceNo(rand())
    if (!(await isTaken(ref))) return ref
  }
  throw new Error(`Unable to allocate a unique reference number after ${MAX_ATTEMPTS} attempts`)
}

/** Generate a unique `ZE-NNNNNN`, checking the live `leads` table for collisions (BR-2). */
export function generateReferenceNo(client: typeof db = db): Promise<string> {
  return allocateReferenceNo(
    async (ref) => !!(await client.lead.findUnique({ where: { referenceNo: ref }, select: { id: true } })),
  )
}
