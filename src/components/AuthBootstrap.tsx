import { useEffect, useState, type ReactNode } from 'react';
import { getMe, refreshSession, setAuthToken } from '../services/api';
import { isTauriApp } from '../lib/platform';
import { useAuthStore } from '../store/authStore';

export default function AuthBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const { token, isAuthenticated, setAuth, logout } = useAuthStore.getState();

    (async () => {
      try {
        if (token) {
          setAuthToken(token);
          const user = await getMe();
          if (!cancelled) setAuth(user, token);
        } else if (isTauriApp()) {
          // Desktop app: no HttpOnly cookies — skip refresh, show login
        } else {
          const data = await refreshSession();
          if (!cancelled) setAuth(data.user, data.access_token);
        }
      } catch {
        if (isAuthenticated) {
          try {
            const data = await refreshSession();
            if (!cancelled) setAuth(data.user, data.access_token);
          } catch {
            if (!cancelled) logout();
          }
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background text-on-surface-variant">
        <div className="flex gap-1.5 items-center glass-card px-5 py-4">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    );
  }

  return children;
}
