import { User } from '../types';

export const MASTER_ADMIN_EMAIL = 'aliakbar786786009@gmail.com';
export const ADMIN_PASSCODE_STORAGE_KEY = 'mychat_admin_passcode';
export const DEFAULT_ADMIN_PASSCODE = 'admin786';

/**
 * Strict check: returns true ONLY if user's email exactly matches MASTER_ADMIN_EMAIL
 */
export function isAuthorizedMasterAdmin(user: User | null | undefined): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase();
}

/**
 * Get current configured admin passcode from localStorage
 */
export function getAdminPasscode(): string {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PASSCODE;
  return localStorage.getItem(ADMIN_PASSCODE_STORAGE_KEY) || DEFAULT_ADMIN_PASSCODE;
}

/**
 * Save new admin passcode
 */
export function setAdminPasscode(newPasscode: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_PASSCODE_STORAGE_KEY, newPasscode.trim());
}

/**
 * Verify if provided passcode matches
 */
export function verifyAdminPasscode(attempt: string): boolean {
  const current = getAdminPasscode();
  return attempt.trim() === current.trim();
}
