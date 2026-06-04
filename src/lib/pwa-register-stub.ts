/** Stub for Tauri/desktop builds where vite-plugin-pwa is disabled. */
export function useRegisterSW() {
  const noop = () => {};
  return {
    needRefresh: [false, noop] as [boolean, (v: boolean) => void],
    offlineReady: [false, noop] as [boolean, (v: boolean) => void],
    updateServiceWorker: async () => {},
  };
}
