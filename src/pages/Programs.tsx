import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, ClipboardList, Shield, Sparkles } from 'lucide-react';
import {
  AI_VIBE_CHECK_DESCRIPTION,
  AI_VIBE_CHECK_QUESTIONS,
  AI_VIBE_CHECK_SLUG,
  AI_VIBE_CHECK_TITLE,
} from '../data/aiVibeCheck';
import { getAiVibeCheckStatus, getPrograms } from '../services/api';
import type { ProgramSummary } from '../services/api';

export default function Programs() {
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [vibeCheckCompleted, setVibeCheckCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getPrograms(), getAiVibeCheckStatus()])
      .then(([programsRes, vibeStatus]) => {
        const other = programsRes.programs.filter(
          (p) => p.id !== AI_VIBE_CHECK_SLUG && p.title !== AI_VIBE_CHECK_TITLE,
        );
        setPrograms(other);
        setVibeCheckCompleted(vibeStatus.completed);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const vibeCheckPath = `/programs/${AI_VIBE_CHECK_SLUG}`;
  const questionCount = AI_VIBE_CHECK_QUESTIONS.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 w-full">
      <div>
        <h1 className="text-headline-lg text-[var(--ezo-fg)]">Programs</h1>
        <p className="text-body-sm text-on-surface-variant mt-1 flex items-center gap-2 flex-wrap">
          <Shield className="w-4 h-4 text-tertiary shrink-0" />
          All programs are anonymous. Individual responses are never shown in Enzo.
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 skeleton" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="glass-card p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-error mx-auto mb-2" />
          <p className="text-body-sm text-on-surface-variant">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to={vibeCheckPath}
              className="glass-card p-5 sm:p-6 block border border-primary/25 hover:border-primary/40 bg-primary/5 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-ezo-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Featured program
                    </p>
                    <h3 className="font-semibold text-[var(--ezo-fg)] mt-0.5">{AI_VIBE_CHECK_TITLE}</h3>
                    <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                      {AI_VIBE_CHECK_DESCRIPTION}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-2">
                      {questionCount} questions · Anonymous
                    </p>
                  </div>
                </div>
                <span
                  className={`badge shrink-0 ${
                    vibeCheckCompleted ? 'badge-completed' : 'badge-pending'
                  }`}
                >
                  {vibeCheckCompleted ? 'Completed' : 'Open'}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-outline-variant/15">
                <span className="text-sm font-medium text-primary">
                  {vibeCheckCompleted ? 'View program' : 'Take program'}
                </span>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </motion.div>

          {programs.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-2">
              No other program enrollments at this time.
            </p>
          ) : (
            programs.map((program, i) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 1) * 0.03 }}
              >
                <Link
                  to={`/programs/${encodeURIComponent(program.id)}`}
                  className="glass-card p-5 block border border-outline-variant/20 hover:border-primary/25 transition-all"
                >
                  <div className="flex justify-between gap-2">
                    <h3 className="font-semibold text-[var(--ezo-fg)]">{program.title}</h3>
                    <span className="badge badge-pending shrink-0">{program.status}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">Anonymous · answers not visible</p>
                  {program.dueAt && (
                    <p className="text-xs text-on-surface-variant mt-1">
                      Due {new Date(program.dueAt).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
