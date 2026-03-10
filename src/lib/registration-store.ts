export interface Step1Data {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  country: string;
  ibCode: string;
}

const STORAGE_KEY = "protrader_registration";

export function saveStep1(data: Step1Data) {
  const token = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ step1: data, token }));
  return token;
}

export function loadRegistration(): { step1: Step1Data; token: string } | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
