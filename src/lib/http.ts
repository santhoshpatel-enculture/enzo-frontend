import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { isTauriApp } from './platform';

/** Native HTTP in Tauri bypasses WebView CORS (fixes "Load failed" on login). */
export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (isTauriApp()) {
    return tauriFetch(input, init);
  }
  return fetch(input, init);
}
