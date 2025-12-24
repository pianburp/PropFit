/**
 * Server Module - Clean Architecture
 * 
 * Main barrel export for server-side code.
 * Organized into layers following clean architecture principles:
 * 
 * 1. Domain Layer (domain/)
 *    - Entities: Core business objects
 *    - Errors: Domain-specific exceptions
 *    - Interfaces: Repository contracts
 * 
 * 2. Application Layer (application/)
 *    - Schemas: Input validation with Zod
 *    - Services: Business logic orchestration
 * 
 * 3. Infrastructure Layer (infrastructure/)
 *    - Repositories: Data access implementations
 * 
 * 4. Presentation Layer (routers/)
 *    - tRPC Routers: Thin controllers
 * 
 * 5. Shared (shared/)
 *    - Cross-cutting concerns like error handling
 */

// Domain exports (entities, errors, interfaces)
export * from './domain';

// Application exports (schemas, services)
// Note: Some types are defined in both schemas and services, so we explicitly export
export {
  // Schemas
  uuidSchema,
  citySchema,
  intentSchema,
  leadStatusSchema,
  qualificationStatusSchema,
  employmentTypeSchema,
  moveInTimelineSchema,
  upgradeStageSchema,
  conversationStepSchema,
  fallbackReasonSchema,
  lifeMilestoneTypeSchema,
  createLeadSchema,
  updateLeadSchema,
  listLeadsSchema,
  leadIdSchema,
  updateLeadStatusSchema,
  logContactSchema,
  getEventsSchema,
  financialSnapshotSchema,
  changeStageSchema,
  conversationStepUpdateSchema,
  fallbackPlanSchema,
  updateAgentSchema,
  listAlertsSchema,
  alertIdSchema,
  reassignClientSchema,
  // Schema types
  type CreateLeadInput,
  type UpdateLeadInput,
  type ListLeadsInput,
  type FinancialSnapshotInput,
  type ChangeStageInput,
  type ConversationStepUpdateInput,
  type FallbackPlanInput,
  type UpdateAgentInput,
  type ReassignClientInput,
  // Services
  LeadService,
  type LeadServiceContext,
  type CreateLeadResult,
  PipelineService,
  type PipelineServiceContext,
  AgentService,
  type AgentServiceContext,
  AlertService,
  type AlertServiceContext,
  DashboardService,
  type DashboardServiceContext,
  AdminService,
  type AdminServiceContext,
  type AgencyDashboardStats,
} from './application';

// Infrastructure exports
export * from './infrastructure';

// Shared utilities
export * from './shared';

// tRPC exports
export { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from './trpc';
export { createTRPCContext } from './trpc/context';
export { appRouter, type AppRouter, createCaller } from './routers/_app';
