// Account management state store with localStorage persistence
// Designed to be replaceable with a real API layer later

import { loadRegistration } from './registration-store';

// ── Type Definitions ──

export type EmailVerificationStatus = 'pending' | 'sent' | 'verified';
export type IdentityVerificationStatus =
  | 'not_started'
  | 'pending'
  | 'submitted'
  | 'verified'
  | 'requires_action';
export type AddressVerificationStatus =
  | 'not_started'
  | 'pending'
  | 'submitted'
  | 'verified'
  | 'requires_action';
export type AccountReviewStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected';
export type ExperienceLevel =
  | 'none'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'professional';
export type TradingStyle =
  | 'scalping'
  | 'day_trading'
  | 'swing_trading'
  | 'position_trading'
  | 'algorithmic';
export type RiskTolerance =
  | 'conservative'
  | 'moderate'
  | 'aggressive'
  | 'speculative';
export type ThemeMode = 'light' | 'dark' | 'system';
export type NumberFormat = 'standard' | 'compact' | 'financial';

/**
 * SECURITY WARNING - PII stored in localStorage
 *
 * This interface contains Personally Identifiable Information (PII) that is currently
 * persisted to localStorage. This approach has known security and compliance risks:
 *
 * - XSS Risk: localStorage is accessible to JavaScript, making it vulnerable to cross-site
 *   scripting attacks. Any XSS vulnerability in the application can expose this data.
 * - localStorage Persistence: Data persists indefinitely in the browser, even after session
 *   ends, increasing exposure window for attacks.
 * - GDPR/CCPA Compliance: Storing PII in localStorage may violate data minimization
 *   principles and user right to erasure (right to be forgotten).
 * - No Encryption: Data is stored in plain text with no encryption at rest.
 *
 * TEMPORARY STUB: This is a client-side only implementation for prototype development.
 * TODO: Replace with server-side API storage - Q2 2026 target (see JIRA ticket PRO-1234)
 *
 * RECOMMENDED FIXES:
 * 1. Remove PII fields from localStorage entirely and fetch from server on demand
 * 2. If localStorage is required for UX, encrypt sensitive fields before storage:
 *    - firstName, lastName, email, phone, dateOfBirth
 *    - All address fields: addressLine1, addressLine2, city, state, postalCode, country
 *    - Financial data: annualIncome, netWorth
 * 3. Implement encryption at the storage layer (see getStorageItem/setStorageItem below)
 *
 * Current storage keys: 'pts_profile', 'pts_profile_address', 'pts_profile_trading'
 */
export interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

/**
 * SECURITY WARNING - Address PII stored in localStorage
 *
 * Contains address data subject to same risks as PersonalDetails.
 * See Security Warning on PersonalDetails interface for full details.
 *
 * Sensitive fields requiring encryption: addressLine1, addressLine2, city, state, postalCode, country
 */
export interface AddressDetails {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * SECURITY WARNING - Financial PII stored in localStorage
 *
 * Contains financial information subject to same risks as PersonalDetails.
 * See Security Warning on PersonalDetails interface for full details.
 *
 * Sensitive fields requiring encryption: annualIncome, netWorth
 */
export interface TradingProfile {
  experienceLevel: ExperienceLevel;
  tradingStyle: TradingStyle;
  riskTolerance: RiskTolerance;
  annualIncome: string;
  netWorth: string;
  investmentObjectives: string[];
}

export interface NotificationSettings {
  emailNotifications: boolean;
  priceAlerts: boolean;
  challengeUpdates: boolean;
  securityAlerts: boolean;
  marketNews: boolean;
}

export interface PlatformPreferences {
  themeMode: ThemeMode;
  defaultWatchlistLayout: 'compact' | 'detailed' | 'grid';
  defaultLeverage: number;
  currency: string;
  numberFormat: NumberFormat;
}

export interface TradingPreferences {
  defaultOrderSize: number;
  defaultStopLoss: number | null;
  defaultTakeProfit: number | null;
  defaultTimeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';
  confirmBeforeOrder: boolean;
  showPositionPnLInHeader: boolean;
}

export interface ComplianceTimestamp {
  accepted: boolean;
  timestamp: string | null;
}

export interface ProfileData {
  personalDetails: PersonalDetails;
  addressDetails: AddressDetails;
  tradingProfile: TradingProfile;
  registrationReferenceId: string | null;
}

export interface VerificationStatus {
  emailVerification: EmailVerificationStatus;
  identityVerification: IdentityVerificationStatus;
  addressVerification: AddressVerificationStatus;
  declarationsAccepted: boolean;
  suitabilityCompleted: boolean;
  accountReviewStatus: AccountReviewStatus;
}

export interface AccountSettings {
  notifications: NotificationSettings;
  platformPreferences: PlatformPreferences;
  tradingPreferences: TradingPreferences;
}

export interface ComplianceDeclarations {
  termsAccepted: ComplianceTimestamp;
  privacyPolicyAccepted: ComplianceTimestamp;
  riskDisclosureAccepted: ComplianceTimestamp;
  suitabilityAcknowledged: ComplianceTimestamp;
  registrationSubmittedAt: string | null;
}

export interface AccountStore {
  profile: ProfileData;
  verification: VerificationStatus;
  settings: AccountSettings;
  compliance: ComplianceDeclarations;
}

// ── LocalStorage Keys ──

const KEYS = {
  accountStore: 'pts_account_store',
  profile: 'pts_profile',
  verification: 'pts_verification',
  settings: 'pts_settings',
  compliance: 'pts_compliance',
};

// ── Default Values ──

const DEFAULT_PERSONAL_DETAILS: PersonalDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
};

const DEFAULT_ADDRESS_DETAILS: AddressDetails = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

const DEFAULT_TRADING_PROFILE: TradingProfile = {
  experienceLevel: 'none',
  tradingStyle: 'day_trading',
  riskTolerance: 'moderate',
  annualIncome: '',
  netWorth: '',
  investmentObjectives: [],
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  priceAlerts: true,
  challengeUpdates: true,
  securityAlerts: true,
  marketNews: true,
};

const DEFAULT_PLATFORM_PREFERENCES: PlatformPreferences = {
  themeMode: 'system',
  defaultWatchlistLayout: 'detailed',
  defaultLeverage: 100,
  currency: 'USD',
  numberFormat: 'standard',
};

const DEFAULT_TRADING_PREFERENCES: TradingPreferences = {
  defaultOrderSize: 0.1,
  defaultStopLoss: null,
  defaultTakeProfit: null,
  defaultTimeframe: '1h',
  confirmBeforeOrder: true,
  showPositionPnLInHeader: false,
};

const DEFAULT_COMPLIANCE_TIMESTAMP: ComplianceTimestamp = {
  accepted: false,
  timestamp: null,
};

// ── Utility Functions ──

/**
 * STORAGE LAYER - Encryption Point
 *
 * These functions handle all localStorage serialization. For PII data (PersonalDetails,
 * AddressDetails, TradingProfile), encryption should be implemented here before data
 * is written to localStorage.
 *
 * TODO: Add encryption for sensitive profile data (see interface security warnings above)
 * Recommended: Use AES-GCM encryption with user-derived key, or integrate with secure
 * storage solution. Key storage should use httpOnly cookies, not localStorage.
 */

export function generateRegistrationReferenceId(): string {
  return `PTS-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
}

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isClient()) {
    return defaultValue;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // Fall through to default
  }
  return defaultValue;
}

function setStorageItem<T>(key: string, value: T): void {
  if (!isClient()) {
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Profile Data Getters/Setters ──

export function getPersonalDetails(): PersonalDetails {
  const registration = loadRegistration();
  if (registration?.step1) {
    return {
      firstName: registration.step1.firstName,
      lastName: registration.step1.lastName,
      email: registration.step1.email,
      phone: registration.step1.phone,
      dateOfBirth: registration.step1.dateOfBirth,
    };
  }
  return getStorageItem(KEYS.profile, DEFAULT_PERSONAL_DETAILS);
}

export function setPersonalDetails(
  details: Partial<PersonalDetails>
): PersonalDetails {
  const current = getPersonalDetails();
  const updated = { ...current, ...details };
  setStorageItem(KEYS.profile, updated);
  return updated;
}

export function getAddressDetails(): AddressDetails {
  const registration = loadRegistration();
  if (registration?.step2) {
    return {
      addressLine1: registration.step2.addressLine1,
      addressLine2: registration.step2.addressLine2,
      city: registration.step2.city,
      state: registration.step2.state,
      postalCode: registration.step2.postalCode,
      country: registration.step2.country,
    };
  }
  return getStorageItem<AddressDetails>(
    KEYS.profile + '_address',
    DEFAULT_ADDRESS_DETAILS
  );
}

export function setAddressDetails(
  details: Partial<AddressDetails>
): AddressDetails {
  const current = getAddressDetails();
  const updated = { ...current, ...details };
  setStorageItem(KEYS.profile + '_address', updated);
  return updated;
}

const VALID_EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'none',
  'beginner',
  'intermediate',
  'advanced',
  'professional',
];

function isValidExperienceLevel(value: string): value is ExperienceLevel {
  return VALID_EXPERIENCE_LEVELS.includes(value as ExperienceLevel);
}

export function getTradingProfile(): TradingProfile {
  const registration = loadRegistration();
  if (registration?.step3) {
    const expLevel = registration.step3.experienceLevel;
    return {
      experienceLevel: isValidExperienceLevel(expLevel) ? expLevel : 'none',
      tradingStyle: DEFAULT_TRADING_PROFILE.tradingStyle,
      riskTolerance: DEFAULT_TRADING_PROFILE.riskTolerance,
      annualIncome: registration.step3.annualIncome,
      netWorth: '',
      investmentObjectives: [],
    };
  }
  return getStorageItem<TradingProfile>(
    KEYS.profile + '_trading',
    DEFAULT_TRADING_PROFILE
  );
}

export function setTradingProfile(
  profile: Partial<TradingProfile>
): TradingProfile {
  const current = getTradingProfile();
  const updated = { ...current, ...profile };
  setStorageItem(KEYS.profile + '_trading', updated);
  return updated;
}

export function getRegistrationReferenceId(): string | null {
  const registration = loadRegistration();
  if (registration?.step4?.referenceId) {
    return registration.step4.referenceId;
  }
  if (!isClient()) {
    return null;
  }
  return localStorage.getItem(KEYS.profile + '_ref_id');
}

export function setRegistrationReferenceId(id: string): void {
  if (!isClient()) {
    return;
  }
  localStorage.setItem(KEYS.profile + '_ref_id', id);
}

export function getProfileData(): ProfileData {
  return {
    personalDetails: getPersonalDetails(),
    addressDetails: getAddressDetails(),
    tradingProfile: getTradingProfile(),
    registrationReferenceId: getRegistrationReferenceId(),
  };
}

export function setProfileData(profile: Partial<ProfileData>): ProfileData {
  if (profile.personalDetails) {
    setPersonalDetails(profile.personalDetails);
  }
  if (profile.addressDetails) {
    setAddressDetails(profile.addressDetails);
  }
  if (profile.tradingProfile) {
    setTradingProfile(profile.tradingProfile);
  }
  if (profile.registrationReferenceId) {
    setRegistrationReferenceId(profile.registrationReferenceId);
  }
  return getProfileData();
}

// ── Verification Status Getters/Setters ──

export function getEmailVerificationStatus(): EmailVerificationStatus {
  const registration = loadRegistration();
  if (registration?.step4?.emailVerificationSent) {
    return 'sent';
  }
  return getStorageItem<EmailVerificationStatus>(
    KEYS.verification + '_email',
    'pending'
  );
}

export function setEmailVerificationStatus(
  status: EmailVerificationStatus
): void {
  setStorageItem(KEYS.verification + '_email', status);
}

export function getIdentityVerificationStatus(): IdentityVerificationStatus {
  return getStorageItem<IdentityVerificationStatus>(
    KEYS.verification + '_identity',
    'not_started'
  );
}

export function setIdentityVerificationStatus(
  status: IdentityVerificationStatus
): void {
  setStorageItem(KEYS.verification + '_identity', status);
}

export function getAddressVerificationStatus(): AddressVerificationStatus {
  return getStorageItem<AddressVerificationStatus>(
    KEYS.verification + '_address',
    'not_started'
  );
}

export function setAddressVerificationStatus(
  status: AddressVerificationStatus
): void {
  setStorageItem(KEYS.verification + '_address', status);
}

export function getDeclarationsAccepted(): boolean {
  const registration = loadRegistration();
  if (
    registration?.step4?.declarations &&
    registration.step4.declarations.length > 0
  ) {
    return true;
  }
  return getStorageItem<boolean>(KEYS.verification + '_declarations', false);
}

export function setDeclarationsAccepted(accepted: boolean): void {
  setStorageItem(KEYS.verification + '_declarations', accepted);
}

export function getSuitabilityCompleted(): boolean {
  const registration = loadRegistration();
  if (registration?.step3 && registration.step3.acknowledgments.length > 0) {
    return true;
  }
  return getStorageItem<boolean>(KEYS.verification + '_suitability', false);
}

export function setSuitabilityCompleted(completed: boolean): void {
  setStorageItem(KEYS.verification + '_suitability', completed);
}

export function getAccountReviewStatus(): AccountReviewStatus {
  return getStorageItem<AccountReviewStatus>(
    KEYS.verification + '_review',
    'pending'
  );
}

export function setAccountReviewStatus(status: AccountReviewStatus): void {
  setStorageItem(KEYS.verification + '_review', status);
}

export function getVerificationStatus(): VerificationStatus {
  return {
    emailVerification: getEmailVerificationStatus(),
    identityVerification: getIdentityVerificationStatus(),
    addressVerification: getAddressVerificationStatus(),
    declarationsAccepted: getDeclarationsAccepted(),
    suitabilityCompleted: getSuitabilityCompleted(),
    accountReviewStatus: getAccountReviewStatus(),
  };
}

export function setVerificationStatus(
  status: Partial<VerificationStatus>
): VerificationStatus {
  if (status.emailVerification) {
    setEmailVerificationStatus(status.emailVerification);
  }
  if (status.identityVerification) {
    setIdentityVerificationStatus(status.identityVerification);
  }
  if (status.addressVerification) {
    setAddressVerificationStatus(status.addressVerification);
  }
  if (status.declarationsAccepted !== undefined) {
    setDeclarationsAccepted(status.declarationsAccepted);
  }
  if (status.suitabilityCompleted !== undefined) {
    setSuitabilityCompleted(status.suitabilityCompleted);
  }
  if (status.accountReviewStatus) {
    setAccountReviewStatus(status.accountReviewStatus);
  }
  return getVerificationStatus();
}

// ── Settings Getters/Setters ──

export function getNotificationSettings(): NotificationSettings {
  return getStorageItem<NotificationSettings>(
    KEYS.settings + '_notifications',
    DEFAULT_NOTIFICATION_SETTINGS
  );
}

export function setNotificationSettings(
  settings: Partial<NotificationSettings>
): NotificationSettings {
  const current = getNotificationSettings();
  const updated = { ...current, ...settings };
  setStorageItem(KEYS.settings + '_notifications', updated);
  return updated;
}

export function getPlatformPreferences(): PlatformPreferences {
  return getStorageItem<PlatformPreferences>(
    KEYS.settings + '_platform',
    DEFAULT_PLATFORM_PREFERENCES
  );
}

export function setPlatformPreferences(
  preferences: Partial<PlatformPreferences>
): PlatformPreferences {
  const current = getPlatformPreferences();
  const updated = { ...current, ...preferences };
  setStorageItem(KEYS.settings + '_platform', updated);
  return updated;
}

export function getTradingPreferences(): TradingPreferences {
  return getStorageItem<TradingPreferences>(
    KEYS.settings + '_trading',
    DEFAULT_TRADING_PREFERENCES
  );
}

export function setTradingPreferences(
  preferences: Partial<TradingPreferences>
): TradingPreferences {
  const current = getTradingPreferences();
  const updated = { ...current, ...preferences };
  setStorageItem(KEYS.settings + '_trading', updated);
  return updated;
}

export function getAccountSettings(): AccountSettings {
  return {
    notifications: getNotificationSettings(),
    platformPreferences: getPlatformPreferences(),
    tradingPreferences: getTradingPreferences(),
  };
}

export function setAccountSettings(
  settings: Partial<AccountSettings>
): AccountSettings {
  if (settings.notifications) {
    setNotificationSettings(settings.notifications);
  }
  if (settings.platformPreferences) {
    setPlatformPreferences(settings.platformPreferences);
  }
  if (settings.tradingPreferences) {
    setTradingPreferences(settings.tradingPreferences);
  }
  return getAccountSettings();
}

// ── Compliance/Declarations Getters/Setters ──

export function getTermsAccepted(): ComplianceTimestamp {
  return getStorageItem<ComplianceTimestamp>(
    KEYS.compliance + '_terms',
    DEFAULT_COMPLIANCE_TIMESTAMP
  );
}

export function setTermsAccepted(accepted: boolean): ComplianceTimestamp {
  const timestamp: ComplianceTimestamp = {
    accepted,
    timestamp: accepted ? new Date().toISOString() : null,
  };
  setStorageItem(KEYS.compliance + '_terms', timestamp);
  return timestamp;
}

export function getPrivacyPolicyAccepted(): ComplianceTimestamp {
  return getStorageItem<ComplianceTimestamp>(
    KEYS.compliance + '_privacy',
    DEFAULT_COMPLIANCE_TIMESTAMP
  );
}

export function setPrivacyPolicyAccepted(
  accepted: boolean
): ComplianceTimestamp {
  const timestamp: ComplianceTimestamp = {
    accepted,
    timestamp: accepted ? new Date().toISOString() : null,
  };
  setStorageItem(KEYS.compliance + '_privacy', timestamp);
  return timestamp;
}

export function getRiskDisclosureAccepted(): ComplianceTimestamp {
  return getStorageItem<ComplianceTimestamp>(
    KEYS.compliance + '_risk',
    DEFAULT_COMPLIANCE_TIMESTAMP
  );
}

export function setRiskDisclosureAccepted(
  accepted: boolean
): ComplianceTimestamp {
  const timestamp: ComplianceTimestamp = {
    accepted,
    timestamp: accepted ? new Date().toISOString() : null,
  };
  setStorageItem(KEYS.compliance + '_risk', timestamp);
  return timestamp;
}

export function getSuitabilityAcknowledged(): ComplianceTimestamp {
  return getStorageItem<ComplianceTimestamp>(
    KEYS.compliance + '_suitability',
    DEFAULT_COMPLIANCE_TIMESTAMP
  );
}

export function setSuitabilityAcknowledged(
  acknowledged: boolean
): ComplianceTimestamp {
  const timestamp: ComplianceTimestamp = {
    accepted: acknowledged,
    timestamp: acknowledged ? new Date().toISOString() : null,
  };
  setStorageItem(KEYS.compliance + '_suitability', timestamp);
  return timestamp;
}

export function getRegistrationSubmittedAt(): string | null {
  const registration = loadRegistration();
  if (registration?.step4?.completedAt) {
    return registration.step4.completedAt;
  }
  return localStorage.getItem(KEYS.compliance + '_submitted_at');
}

export function setRegistrationSubmittedAt(timestamp: string): void {
  localStorage.setItem(KEYS.compliance + '_submitted_at', timestamp);
}

export function getComplianceDeclarations(): ComplianceDeclarations {
  return {
    termsAccepted: getTermsAccepted(),
    privacyPolicyAccepted: getPrivacyPolicyAccepted(),
    riskDisclosureAccepted: getRiskDisclosureAccepted(),
    suitabilityAcknowledged: getSuitabilityAcknowledged(),
    registrationSubmittedAt: getRegistrationSubmittedAt(),
  };
}

export function setComplianceDeclarations(
  declarations: Partial<ComplianceDeclarations>
): ComplianceDeclarations {
  if (declarations.termsAccepted) {
    setTermsAccepted(declarations.termsAccepted.accepted);
  }
  if (declarations.privacyPolicyAccepted) {
    setPrivacyPolicyAccepted(declarations.privacyPolicyAccepted.accepted);
  }
  if (declarations.riskDisclosureAccepted) {
    setRiskDisclosureAccepted(declarations.riskDisclosureAccepted.accepted);
  }
  if (declarations.suitabilityAcknowledged) {
    setSuitabilityAcknowledged(declarations.suitabilityAcknowledged.accepted);
  }
  if (declarations.registrationSubmittedAt) {
    setRegistrationSubmittedAt(declarations.registrationSubmittedAt);
  }
  return getComplianceDeclarations();
}

// ── Action Functions ──

export function initializeAccountFromRegistration(): AccountStore | null {
  const registration = loadRegistration();
  if (!registration?.step1) {
    return null;
  }

  // Initialize profile from registration data
  const profile: ProfileData = {
    personalDetails: getPersonalDetails(),
    addressDetails: getAddressDetails(),
    tradingProfile: getTradingProfile(),
    registrationReferenceId:
      getRegistrationReferenceId() || generateRegistrationReferenceId(),
  };

  // Initialize verification from registration data
  const verification: VerificationStatus = {
    emailVerification: registration.step4?.emailVerificationSent
      ? 'sent'
      : 'pending',
    identityVerification: 'not_started',
    addressVerification: 'not_started',
    declarationsAccepted: (registration.step4?.declarations?.length || 0) > 0,
    suitabilityCompleted:
      (registration.step3?.acknowledgments?.length || 0) > 0,
    accountReviewStatus: 'pending',
  };

  // Set defaults for settings
  const settings: AccountSettings = getAccountSettings();

  // Initialize compliance from registration data
  const compliance: ComplianceDeclarations = {
    termsAccepted: {
      accepted: true,
      timestamp: registration.step4?.completedAt || new Date().toISOString(),
    },
    privacyPolicyAccepted: {
      accepted: true,
      timestamp: registration.step4?.completedAt || new Date().toISOString(),
    },
    riskDisclosureAccepted: {
      accepted: true,
      timestamp: registration.step4?.completedAt || new Date().toISOString(),
    },
    suitabilityAcknowledged: {
      accepted: (registration.step3?.acknowledgments?.length || 0) > 0,
      timestamp: registration.step4?.completedAt || null,
    },
    registrationSubmittedAt: registration.step4?.completedAt || null,
  };

  // Persist everything
  setProfileData(profile);
  setVerificationStatus(verification);
  setAccountSettings(settings);
  setComplianceDeclarations(compliance);

  return { profile, verification, settings, compliance };
}

export function isProfileComplete(): boolean {
  const profile = getProfileData();
  return (
    profile.personalDetails.firstName !== '' &&
    profile.personalDetails.lastName !== '' &&
    profile.personalDetails.email !== '' &&
    profile.addressDetails.addressLine1 !== '' &&
    profile.addressDetails.city !== '' &&
    profile.addressDetails.country !== ''
  );
}

export function isVerificationComplete(): boolean {
  const verification = getVerificationStatus();
  return (
    verification.emailVerification === 'verified' &&
    verification.identityVerification === 'verified' &&
    verification.declarationsAccepted &&
    verification.suitabilityCompleted
  );
}

export function isAccountActive(): boolean {
  const verification = getVerificationStatus();
  return verification.accountReviewStatus === 'approved';
}

export function getAccountCompletionPercentage(): number {
  let completed = 0;
  const total = 6;

  const profile = getProfileData();
  const verification = getVerificationStatus();

  if (profile.personalDetails.firstName && profile.personalDetails.lastName)
    completed++;
  if (profile.addressDetails.addressLine1 && profile.addressDetails.city)
    completed++;
  if (profile.tradingProfile.experienceLevel !== 'none') completed++;
  if (verification.emailVerification === 'verified') completed++;
  if (verification.identityVerification === 'verified') completed++;
  if (verification.declarationsAccepted) completed++;

  return Math.round((completed / total) * 100);
}

export function updateEmailVerificationToVerified(): void {
  setEmailVerificationStatus('verified');
}

export function submitIdentityVerification(): void {
  setIdentityVerificationStatus('submitted');
}

export function submitAddressVerification(): void {
  setAddressVerificationStatus('submitted');
}

export function acceptAllDeclarations(): void {
  setDeclarationsAccepted(true);
  setTermsAccepted(true);
  setPrivacyPolicyAccepted(true);
  setRiskDisclosureAccepted(true);
}

export function completeSuitabilityAssessment(): void {
  setSuitabilityCompleted(true);
  setSuitabilityAcknowledged(true);
}

export function resetAccountStore(): void {
  localStorage.removeItem(KEYS.profile);
  localStorage.removeItem(KEYS.profile + '_address');
  localStorage.removeItem(KEYS.profile + '_trading');
  localStorage.removeItem(KEYS.profile + '_ref_id');
  localStorage.removeItem(KEYS.verification + '_email');
  localStorage.removeItem(KEYS.verification + '_identity');
  localStorage.removeItem(KEYS.verification + '_address');
  localStorage.removeItem(KEYS.verification + '_declarations');
  localStorage.removeItem(KEYS.verification + '_suitability');
  localStorage.removeItem(KEYS.verification + '_review');
  localStorage.removeItem(KEYS.settings + '_notifications');
  localStorage.removeItem(KEYS.settings + '_platform');
  localStorage.removeItem(KEYS.settings + '_trading');
  localStorage.removeItem(KEYS.compliance + '_terms');
  localStorage.removeItem(KEYS.compliance + '_privacy');
  localStorage.removeItem(KEYS.compliance + '_risk');
  localStorage.removeItem(KEYS.compliance + '_suitability');
  localStorage.removeItem(KEYS.compliance + '_submitted_at');
}

export function getFullAccountStore(): AccountStore {
  return {
    profile: getProfileData(),
    verification: getVerificationStatus(),
    settings: getAccountSettings(),
    compliance: getComplianceDeclarations(),
  };
}

export function setFullAccountStore(store: AccountStore): void {
  setProfileData(store.profile);
  setVerificationStatus(store.verification);
  setAccountSettings(store.settings);
  setComplianceDeclarations(store.compliance);
}
