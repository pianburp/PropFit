/**
 * Domain Errors - Business-specific error types
 * 
 * These errors represent business rule violations and domain-level exceptions.
 * They are mapped to appropriate tRPC errors in the router layer.
 */

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, identifier?: string) {
    super(
      identifier ? `${entity} with id '${identifier}' not found` : `${entity} not found`,
      'NOT_FOUND',
      { entity, identifier }
    );
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Access denied') {
    super(message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class PreconditionError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'PRECONDITION_FAILED', details);
    this.name = 'PreconditionError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

/**
 * Map domain errors to tRPC error codes
 */
export function mapDomainErrorToTRPCCode(error: DomainError): 
  'NOT_FOUND' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'BAD_REQUEST' | 'PRECONDITION_FAILED' | 'CONFLICT' | 'INTERNAL_SERVER_ERROR' {
  switch (error.code) {
    case 'NOT_FOUND':
      return 'NOT_FOUND';
    case 'UNAUTHORIZED':
      return 'UNAUTHORIZED';
    case 'FORBIDDEN':
      return 'FORBIDDEN';
    case 'VALIDATION_ERROR':
      return 'BAD_REQUEST';
    case 'PRECONDITION_FAILED':
      return 'PRECONDITION_FAILED';
    case 'CONFLICT':
      return 'CONFLICT';
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
}
