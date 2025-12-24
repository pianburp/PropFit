/**
 * Reassignment Log Repository - Data Access Implementation
 * 
 * Handles all database operations for client reassignment logs.
 */
import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { IReassignmentLogRepository, CreateReassignmentLogData } from '../../domain/interfaces';

export class ReassignmentLogRepository implements IReassignmentLogRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateReassignmentLogData): Promise<void> {
    await this.supabase.from('client_reassignment_log').insert(data);
  }
}
