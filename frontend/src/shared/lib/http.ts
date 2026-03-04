import axios, { AxiosHeaders, isAxiosError, type AxiosInstance } from 'axios';
import { STORAGE_KEYS } from '@shared/lib/env';

export const AUTH_EVENTS = {
  UNAUTHORIZED: 'auth:unauthorized',
} as const;

function clearAuthStorage() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

let unauthorizedEmitted = false;
let unauthorizedTimer: number | null = null;

function emitUnauthorizedEvent() {
  if (unauthorizedEmitted) return;
  unauthorizedEmitted = true;

  window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));

  if (unauthorizedTimer) window.clearTimeout(unauthorizedTimer);
  unauthorizedTimer = window.setTimeout(() => {
    unauthorizedEmitted = false;
    unauthorizedTimer = null;
  }, 1000);
}

export function createHttpClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (err: unknown) => {
      if (isAxiosError(err) && err.response?.status === 401) {
        clearAuthStorage();
        emitUnauthorizedEvent();
      }
      return Promise.reject(err);
    },
  );

  return client;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getStringErrorFromUnknown(value: unknown): string | undefined {
  if (!isObject(value)) return undefined;
  const maybe = value.error;
  if (typeof maybe === 'string') {
    const trimmed = maybe.trim();
    return trimmed.length ? trimmed : undefined;
  }
  return undefined;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const fromData = getStringErrorFromUnknown(err.response?.data);
    return fromData ?? fallback;
  }

  if (isObject(err) && isObject(err.response) && isObject(err.response.data)) {
    const fromData = getStringErrorFromUnknown(err.response.data);
    if (fromData) return fromData;
  }

  return fallback;
}

export function __resetUnauthorizedForTests(): void {
  unauthorizedEmitted = false;
  if (unauthorizedTimer) window.clearTimeout(unauthorizedTimer);
  unauthorizedTimer = null;
}
