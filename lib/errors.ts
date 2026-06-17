// Shared platform error taxonomy → the error envelope
// `{ statusCode, error, message, details: [] }` (overview §7). Admin server actions
// throw these; the action/route boundary maps them to the envelope.

export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly details: unknown[] = [],
  ) {
    super(message)
    this.name = code
  }

  /** The platform error envelope for this error. */
  toEnvelope() {
    return { statusCode: this.statusCode, error: this.code, message: this.message, details: this.details }
  }
}

/** Invalid input / business-rule violation (HTTP 422). */
export class ValidationError extends AppError {
  constructor(message: string, details: unknown[] = []) {
    super(422, 'ValidationError', message, details)
  }
}

/** Uniqueness / state conflict, e.g. duplicate key or stale precondition (HTTP 409). */
export class ConflictError extends AppError {
  constructor(message: string, details: unknown[] = []) {
    super(409, 'Conflict', message, details)
  }
}

/** Resource not found (HTTP 404). */
export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(404, 'NotFound', message)
  }
}

/** A business-policy violation, e.g. last-admin / self-action guards (HTTP 422, `PolicyViolation`). */
export class PolicyViolationError extends AppError {
  constructor(message: string, details: unknown[] = []) {
    super(422, 'PolicyViolation', message, details)
  }
}

/**
 * Publish blocked because required-for-publish fields or image alt text are missing
 * (HTTP 422, `PublishValidationError`). `details` lists every missing item so the
 * editor can fix them in one pass. Shared by every content collection's publish gate.
 */
export class PublishValidationError extends AppError {
  constructor(details: { field: string; issue: string }[], message = 'Record cannot be published.') {
    super(422, 'PublishValidationError', message, details)
  }
}
