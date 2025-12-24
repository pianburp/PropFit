/**
 * Error Handler Utility
 * 
 * Shared error handling utilities for tRPC routers.
 */
import { TRPCError } from '@trpc/server';
import { DomainError, mapDomainErrorToTRPCCode } from '../domain/errors';

/**
 * Handle domain errors by converting to tRPC errors
 * Use this in all tRPC procedures to consistently handle errors
 */
export function handleDomainError(error: unknown): never {
  if (error instanceof DomainError) {
    throw new TRPCError({
      code: mapDomainErrorToTRPCCode(error),
      message: error.message,
      cause: error,
    });
  }
  
  if (error instanceof TRPCError) {
    throw error;
  }
  
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? error.message : 'Unknown error',
    cause: error,
  });
}

/**
 * Wrap an async function with error handling
 */
export function withErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch((error) => {
    handleDomainError(error);
  });
}
