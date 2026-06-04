import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, ChevronRight, Sparkles, X } from 'lucide-react';
import { getAiVibeCheckStatus } from '../services/api';
import { AI_VIBE_CHECK_SLUG } from '../data/aiVibeCheck';

export default function Notifications() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(true);

  useEffect(() => {
    getAiVibeCheckStatus()
      .then((s) => setCompleted(s.completed))
      .catch(() => setCompleted(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (completed) {
      setToastVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setToastVisible(false), 6000);
    return () => window.clearTimeout(timer);
  }, [completed]);

  const handleVibeCheckClick = () => {
    navigate(`/programs/${AI_VIBE_CHECK_SLUG}`);
  };

  const handleClose = () => {
    navigate('/home');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 w-full">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-headline-lg text-[var(--ezo-fg)] flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          Notifications
        </h1>
        <button
          type="button"
          onClick={handleClose}
          className="ghost-btn inline-flex items-center gap-1.5 shrink-0"
          aria-label="Close notifications"
        >
          <X className="w-4 h-4" />
          Close
        </button>
      </div>

      {toastVisible && !completed && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-ezo-lg border border-primary/30 bg-primary/10 px-4 py-3 flex items-center justify-between gap-3"
          role="status"
        >
          <p className="text-sm text-[var(--ezo-fg)]">
            Awaiting <span className="font-semibold text-primary">AI VIBE CHECK 2026</span>
          </p>
          <button
            type="button"
            onClick={() => setToastVisible(false)}
            className="p-1 rounded-ezo text-on-surface-variant hover:text-[var(--ezo-fg)]"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {loading ? (
        <div className="h-20 skeleton rounded-ezo-lg" />
      ) : (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleVibeCheckClick}
          className="w-full text-left glass-card p-4 border border-primary/25 bg-primary/5 hover:bg-primary/10 transition-all rounded-ezo-xl group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-ezo-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-primary font-medium">
                {completed ? 'Completed' : 'Awaiting'}
              </p>
              <p className="font-semibold text-sm text-[var(--ezo-fg)] mt-0.5">
                AI Vibe Check 2026
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary shrink-0" />
          </div>
        </motion.button>
      )}
    </div>
  );
}
