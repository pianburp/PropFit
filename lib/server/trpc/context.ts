/**
 * tRPC Context - Server Only
 * 
 * Creates the authenticated context for all tRPC procedures.
 * This file should NEVER be imported from client code.
 */
import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Agent, Agency } from '@/lib/types';

/**
 * Context passed to every tRPC procedure
 */
export interface TRPCContext {
  /**
   * The authenticated user from Supabase Auth
   */
  user: {
    id: string;
    email?: string;
  } | null;
  
  /**
   * The agent profile for the authenticated user
   */
  agent: (Agent & { agency?: Agency }) | null;
  
  /**
   * Request headers for rate limiting and logging
   */
  headers: Headers;
  
  /**
   * Supabase client for database operations
   */
  supabase: Awaited<ReturnType<typeof createClient>>;
}

/**
 * Create context for tRPC procedures
 * Called for every request to /api/trpc/*
 */
export async function createTRPCContext(opts: {
  headers: Headers;
}): Promise<TRPCContext> {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  let agent: (Agent & { agency?: Agency }) | null = null;
  
  if (user) {
    // Fetch agent profile with agency
    const { data } = await supabase
      .from('agents')
      .select('*, agency:agencies(*)')
      .eq('id', user.id)
      .single();
    
    agent = data as (Agent & { agency?: Agency }) | null;
  }
  
  return {
    user: user ? { id: user.id, email: user.email } : null,
    agent,
    headers: opts.headers,
    supabase,
  };
}

/**
 * Type for the context creation function
 */
export type CreateTRPCContext = typeof createTRPCContext;
