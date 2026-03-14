import { loadRegistration } from './registration-store';

export type AccountState =
  | 'unregistered'
  | 'pending_verification'
  | 'pending_review'
  | 'active';

const DEMO_STATE_KEY = 'protrader_demo_state';

export function getAccountState(): AccountState {
  // Demo override takes priority
  const override = localStorage.getItem(DEMO_STATE_KEY);
  if (
    override &&
    [
      'unregistered',
      'pending_verification',
      'pending_review',
      'active',
    ].includes(override)
  ) {
    return override as AccountState;
  }

  const reg = loadRegistration();
  if (!reg?.step1) return 'unregistered';
  if (!reg.completed) return 'unregistered';
  if (!reg.step4?.emailVerificationSent) return 'pending_verification';
  return 'pending_review';
}

export function setDemoState(state: AccountState | null) {
  if (state === null) {
    localStorage.removeItem(DEMO_STATE_KEY);
  } else {
    localStorage.setItem(DEMO_STATE_KEY, state);
  }
}

export function getDemoState(): AccountState | null {
  return (localStorage.getItem(DEMO_STATE_KEY) as AccountState) || null;
}
