import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

const ENZO_LOGO = '/enzo-bot.png';
import { getMicrosoftSsoStartUrl, login } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getPostLoginPath } from '../lib/authRedirect';

const SHOW_DEMO_HINT =
  import.meta.env.VITE_SHOW_DEMO_HINT === 'true' || !import.meta.env.PROD;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      setAuth(data.user, data.access_token);
      navigate(getPostLoginPath(data.user));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-margin-mobile sm:px-gutter relative overflow-hidden bg-[var(--ezo-bg)]">
      {/* Dynamic Animated Background Blobs */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[-20%] left-[-10%] w-[min(600px,90vw)] h-[min(600px,70vh)] rounded-full bg-primary/10 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 40, -40, 0],
          scale: [1, 0.9, 1.05, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-[-20%] right-[-10%] w-[min(500px,80vw)] h-[min(500px,60vh)] rounded-full bg-secondary/10 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, 20, -30, 0],
          y: [0, 30, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[30%] right-[15%] w-[min(300px,50vw)] h-[min(300px,40vh)] rounded-full bg-tertiary/8 blur-[100px] pointer-events-none hidden sm:block"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          <motion.img
            src={ENZO_LOGO}
            alt="Enzo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block w-14 h-14 sm:w-16 sm:h-16 rounded-ezo-xl mb-4 sm:mb-6 object-cover border border-primary/15 shadow-glow-primary"
          />
          <h1 className="text-headline-lg text-[var(--ezo-fg)] mb-2">
            Welcome to <span className="gradient-text">Enzo</span>
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Your AI-powered Enculture assistant
          </p>
        </div>

        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.3 }}
          className="glass-card p-6 sm:p-8 border border-outline-variant/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        >
          <a
            href={getMicrosoftSsoStartUrl()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-ezo-lg font-semibold text-sm border border-outline-variant/40 bg-surface-container-low hover:bg-primary/5 transition-all mb-4"
          >
            Sign in with Microsoft
          </a>
          <p className="text-center text-xs text-on-surface-variant mb-4">or continue with email</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-label-md text-on-surface-variant mb-2 normal-case tracking-normal"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="glass-input transition-all duration-300 focus:border-primary/50 focus:scale-[1.01]"
                placeholder="you@enculture.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-label-md text-on-surface-variant mb-2 normal-case tracking-normal"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="glass-input pr-12 transition-all duration-300 focus:border-primary/50 focus:scale-[1.01]"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-[var(--ezo-fg)] transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-error text-body-sm text-center bg-error-container/40 rounded-ezo-lg px-4 py-2 border border-error/20"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full flex items-center justify-center gap-2 py-3 px-4 rounded-ezo-lg font-semibold text-sm text-on-primary bg-gradient-to-r from-primary to-primary-container hover:shadow-glow-primary hover:scale-[1.02] active:scale-100 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            >
              {loading ? (
                <div className="flex gap-1 py-1">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {SHOW_DEMO_HINT && (
            <div className="mt-6 pt-6 border-t border-outline-variant/20">
              <p className="text-center text-xs text-on-surface-variant">
                Dev: use your work email with default password{' '}
                <span className="text-[var(--ezo-fg)]">Test@1234</span>
              </p>
            </div>
          )}
        </motion.div>

        <p className="text-center text-xs text-on-surface-variant/70 mt-6">
          Powered by Enculture.ai
        </p>
      </motion.div>
    </div>
  );
}
