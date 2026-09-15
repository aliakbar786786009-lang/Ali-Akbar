import { User, RegisteredAccount } from '../types';

export const REGISTERED_ACCOUNTS_KEY = 'mychat_registered_accounts_v7';
export const CURRENT_USER_KEY = 'mychat_current_user_v7';
export const APP_VERSION_KEY = 'mychat_app_version_v7';

/**
 * Normalizes a username: lowercase, stripped of @ and spaces.
 */
export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase().replace(/^@+/, '').replace(/\s+/g, '_');
}

/**
 * Validates username format: 3-24 alphanumeric characters, underscores or dots.
 */
export function validateUsernameFormat(username: string): { isValid: boolean; error?: string } {
  const clean = normalizeUsername(username);
  if (clean.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long.' };
  }
  if (clean.length > 24) {
    return { isValid: false, error: 'Username must not exceed 24 characters.' };
  }
  if (!/^[a-z0-9_.]+$/.test(clean)) {
    return { isValid: false, error: 'Username can only contain lowercase letters, numbers, underscores (_), and dots (.).' };
  }
  return { isValid: true };
}

/**
 * Reads all registered accounts from localStorage.
 */
export function getStoredAccounts(): RegisteredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves registered accounts to localStorage.
 */
export function saveStoredAccounts(accounts: RegisteredAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts to storage', err);
  }
}

/**
 * Checks if an email is already registered.
 */
export function isEmailRegistered(email: string): boolean {
  const accounts = getStoredAccounts();
  const normalized = email.trim().toLowerCase();
  return accounts.some((acc) => acc.email.toLowerCase() === normalized);
}

/**
 * Checks if a username is already taken by another user.
 */
export function isUsernameTaken(username: string, excludeUserId?: string): boolean {
  const accounts = getStoredAccounts();
  const clean = normalizeUsername(username);
  return accounts.some((acc) => {
    if (excludeUserId && acc.user.id === excludeUserId) return false;
    return normalizeUsername(acc.user.username) === clean;
  });
}

/**
 * Generates smart suggestions if a username is taken.
 */
export function generateUsernameSuggestions(baseUsername: string): string[] {
  const clean = normalizeUsername(baseUsername);
  const suggestions: string[] = [];
  const suffixes = ['123', '786', '007', '_ali', '_pk', '_dev', '99', '2026'];

  for (const suf of suffixes) {
    const candidate = `${clean}${suf}`;
    if (!isUsernameTaken(candidate) && !suggestions.includes(candidate)) {
      suggestions.push(candidate);
    }
    if (suggestions.length >= 3) break;
  }

  // If still empty, add random digits
  while (suggestions.length < 3) {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const candidate = `${clean}${randomNum}`;
    if (!isUsernameTaken(candidate) && !suggestions.includes(candidate)) {
      suggestions.push(candidate);
    }
  }

  return suggestions;
}
