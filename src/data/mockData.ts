import { User, Chat, Message, StatusUpdate, CallRecord, ModerationReport, AuditLog, AdminStats } from '../types';

/**
 * Initial empty state structures for fresh user signup.
 * All mock, demo, and hardcoded records have been removed so every screen
 * (Chats, Groups, Calls, Status) starts completely clean and authentic.
 */

export const INITIAL_USER: User | null = null;

export const MOCK_USERS: User[] = [];

export const INITIAL_CHATS: Chat[] = [];

export const INITIAL_MESSAGES: Record<string, Message[]> = {};

export const INITIAL_STATUSES: StatusUpdate[] = [];

export const INITIAL_CALLS: CallRecord[] = [];

export const INITIAL_REPORTS: ModerationReport[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_ADMIN_STATS: AdminStats = {
  totalUsers: 1,
  activeUsersToday: 1,
  totalGroups: 0,
  totalBusinesses: 0,
  totalMessagesSent: 0,
  totalCallsMade: 0,
  pendingReports: 0,
  suspendedAccounts: 0,
  storageUsageMB: 1.2,
  serverUptimePercent: 99.99,
  serverHealth: 'optimal',
};
