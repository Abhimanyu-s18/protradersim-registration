import { useSyncExternalStore } from 'react';
import { getAccountState, AccountState } from '@/lib/auth-store';

// ── Reactive Store Subscription Mechanism ──
// This ensures hooks re-render when auth state changes

type Listener = () => void;

let listeners: Listener[] = [];

function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): AccountState {
  return getAccountState();
}

function getServerSnapshot(): AccountState {
  return 'unregistered';
}

/**
 * Internal hook that provides reactive access to account state
 * Uses useSyncExternalStore for proper React 18 concurrent mode support
 */
function useAccountStateSubscription(): AccountState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ── Public Hooks ──

/**
 * Hook to check if user is authenticated (has any account state beyond unregistered)
 * Reactive: re-renders when auth state changes
 */
export function useIsAuthenticated(): boolean {
  const accountState = useAccountStateSubscription();
  return accountState !== 'unregistered';
}

/**
 * Hook to check if user has active account
 * Reactive: re-renders when auth state changes
 */
export function useIsActive(): boolean {
  const accountState = useAccountStateSubscription();
  return accountState === 'active';
}

/**
 * Hook to get current account state
 * Reactive: re-renders when auth state changes
 */
export function useAccountState(): AccountState {
  return useAccountStateSubscription();
}

// ── Helper to notify subscribers of state changes ──
// Call this function whenever the auth state might have changed
// (e.g., after registration steps, demo state changes, etc.)
export function notifyAuthStateChange(): void {
  listeners.forEach((listener) => listener());
}
