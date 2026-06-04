import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { changePassword } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getMe } from '../services/api';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setAuth, token } = useAuthStore();
  const forced = user?.mustChangePassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      const refreshed = await getMe();
      if (token) setAuth(refreshed, token);
      navigate('/home', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-headline-lg text-[var(--ezo-fg)] flex items-center gap-2">
          <Lock className="w-6 h-6 text-primary" />
          {forced ? 'Set a new password' : 'Change password'}
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-2">
          {forced
            ? 'Your account uses a temporary password. Choose a new password to continue.'
            : 'Update your account password.'}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-8 border border-outline-variant/30"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="current-pwd" className="block text-label-md text-on-surface-variant mb-2 normal-case">
              Current password
            </label>
            <div className="relative">
              <input
                id="current-pwd"
                type={showCurrent ? 'text' : 'password'}
                className="glass-input pr-12"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant p-1"
                aria-label="Toggle password visibility"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="new-pwd" className="block text-label-md text-on-surface-variant mb-2 normal-case">
              New password
            </label>
            <div className="relative">
              <input
                id="new-pwd"
                type={showNew ? 'text' : 'password'}
                className="glass-input pr-12"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant p-1"
                aria-label="Toggle password visibility"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-pwd" className="block text-label-md text-on-surface-variant mb-2 normal-case">
              Confirm new password
            </label>
            <input
              id="confirm-pwd"
              type="password"
              className="glass-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-error text-body-sm text-center bg-error-container/40 rounded-ezo-lg px-4 py-2 border border-error/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-ezo-lg font-semibold text-sm text-on-primary bg-gradient-to-r from-primary to-primary-container disabled:opacity-50"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>

          {!forced && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-2 text-sm text-on-surface-variant hover:text-[var(--ezo-fg)]"
            >
              Cancel
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
}
