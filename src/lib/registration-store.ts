export interface Step1Data {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  country: string;
  ibCode: string;
}

export interface Step2Data {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface RegistrationPayload {
  step1: Step1Data;
  step2?: Step2Data;
  token: string;
}

const STORAGE_KEY = "protrader_registration";

export function saveStep1(data: Step1Data) {
  const existing = loadRegistration();
  const token = existing?.token ?? crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, step1: data, token }));
  return token;
}

export function saveStep2(data: Step2Data) {
  const existing = loadRegistration();
  if (!existing) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, step2: data }));
}

export function loadRegistration(): RegistrationPayload | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
