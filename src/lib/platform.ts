/** True when running inside the Tauri desktop shell (dev or release build). */
export function isTauriApp(): boolean {
  if (import.meta.env.TAURI_ENV_PLATFORM) return true;
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function navigateToLogin(): void {
  if (isTauriApp()) {
    window.location.hash = '#/login';
    return;
  }
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}
