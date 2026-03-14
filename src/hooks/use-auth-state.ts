import { getAccountState, AccountState } from '@/lib/auth-store';

/**
 * Hook to check if user is authenticated (has any account state beyond unregistered)
 */
export function useIsAuthenticated(): boolean {
  return getAccountState() !== 'unregistered';
}

/**
 * Hook to check if user has active account
 */
export function useIsActive(): boolean {
  return getAccountState() === 'active';
}

/**
 * Hook to get current account state
 */
export function useAccountState(): AccountState {
  return getAccountState();
}
