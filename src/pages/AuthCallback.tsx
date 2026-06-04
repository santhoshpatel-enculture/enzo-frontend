import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshSession } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getPostLoginPath } from '../lib/authRedirect';

export default function AuthCallback() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await refreshSession();
        setAuth(data.user, data.access_token);
        navigate(getPostLoginPath(data.user), { replace: true });
      } catch {
        setError('Sign-in could not be completed. Try again or use email login.');
      }
    })();
  }, [navigate, setAuth]);

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <p className="text-on-surface-variant">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="typing-dot" />
    </div>
  );
}
