import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ListTodo,
  Users,
  Network,
  ClipboardList,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { getDashboardSummary } from '../services/api';
import type { DashboardSummary } from '../services/api';
import { useAuthStore } from '../store/authStore';

const QUICK_LINKS = [
  { to: '/actions', label: 'My Actions', icon: ListTodo },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/org-chart', label: 'Org Chart', icon: Network },
  { to: '/programs', label: 'Programs', icon: ClipboardList },
  { to: '/chat', label: 'Ask Enzo', icon: MessageSquare },
];

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 w-full">
        <div className="h-24 skeleton" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="glass-card p-8 text-center max-w-lg mx-auto">
        <AlertTriangle className="w-10 h-10 text-error mx-auto mb-3" />
        <p className="text-body-sm text-on-surface-variant">{error || 'Failed to load dashboard'}</p>
      </div>
    );
  }

  const { metrics, insights } = summary;

  return (
    <div className="max-w-4xl mx-auto space-y-8 w-full">
      <div>
        <h1 className="text-headline-lg text-[var(--ezo-fg)]">
          Welcome back, {user?.firstName || summary.user.firstName}
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          {summary.user.designation} · {summary.user.department}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Pending', value: metrics.pendingTasks },
          { label: 'In progress', value: metrics.inProgressTasks },
          { label: 'Critical', value: metrics.criticalTasks },
          { label: 'Due soon', value: metrics.upcomingDeadlines },
          { label: 'Completed', value: metrics.completedTasks },
          { label: 'Chats', value: metrics.recentConversations },
        ].map(({ label, value }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 border border-outline-variant/20"
          >
            <p className="text-xs text-on-surface-variant uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-semibold text-[var(--ezo-fg)] mt-1">{value}</p>
          </motion.div>
        ))}
      </div>

      {insights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-headline-md text-[var(--ezo-fg)]">Insights</h2>
          {insights.map((insight, i) => (
            <div
              key={i}
              className="glass-card p-4 border border-outline-variant/20 flex gap-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--ezo-fg)]">{insight.title}</p>
                <p className="text-xs text-on-surface-variant mt-1">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-headline-md text-[var(--ezo-fg)] mb-3">Quick links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="glass-card p-4 flex items-center gap-3 border border-outline-variant/20 hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              <Icon className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm font-medium text-[var(--ezo-fg)]">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
