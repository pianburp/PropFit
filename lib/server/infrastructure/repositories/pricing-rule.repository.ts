/**
 * Pricing Rule Repository - Data Access Implementation
 * 
 * Handles all database operations for pricing rules.
 */
import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { IPricingRuleRepository } from '../../domain/interfaces';
import type { PricingRule, City } from '../../domain/entities';

export class PricingRuleRepository implements IPricingRuleRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findActive(): Promise<PricingRule[]> {
    const { data } = await this.supabase
      .from('pricing_rules')
      .select('*')
      .eq('is_active', true);

    return (data || []) as PricingRule[];
  }

  async findByCity(city: City): Promise<PricingRule[]> {
    const { data } = await this.supabase
      .from('pricing_rules')
      .select('*')
      .eq('city', city)
      .eq('is_active', true);

    return (data || []) as PricingRule[];
  }
}
