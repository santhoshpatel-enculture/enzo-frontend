import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, Flag } from 'lucide-react';
import {
  getTasks,
  getPendingTasks,
  getCriticalTasks,
  getUpcomingTasks,
} from '../services/api';
import type { TaskItem } from '../services/api';

type Tab = 'all' | 'pending' | 'critical' | 'upcoming';

function statusBadge(status: TaskItem['status']) {
  const map = {
    pending: 'badge-pending',
    in_progress: 'badge-in-progress',
    completed: 'badge-completed',
  } as const;
  return map[status] || 'badge-pending';
}

function priorityLabel(priority: TaskItem['priority']) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export default function Actions() {
  const [tab, setTab] = useState<Tab>('all');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const load = async () => {
      try {
        let res;
        switch (tab) {
          case 'pending':
            res = await getPendingTasks();
            break;
          case 'critical':
            res = await getCriticalTasks();
            break;
          case 'upcoming':
            res = await getUpcomingTasks();
            break;
          default:
            res = await getTasks();
        }
        setTasks(res.tasks);
        setTotal(res.total);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load actions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'critical', label: 'Critical' },
    { id: 'upcoming', label: 'Upcoming' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 w-full">
      <div>
        <h1 className="text-headline-lg text-[var(--ezo-fg)]">My Actions</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Insight actions assigned to you ({total})
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              tab === t.id
                ? 'bg-primary/15 border-primary/30 text-primary'
                : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/20'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 skeleton" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="glass-card p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-error mx-auto mb-2" />
          <p className="text-body-sm text-on-surface-variant">{error}</p>
        </div>
      )}

      {!loading && !error && tasks.length === 0 && (
        <div className="glass-card p-8 text-center text-on-surface-variant text-sm">
          No actions in this view.
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="glass-card p-5 border border-outline-variant/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-semibold text-[var(--ezo-fg)]">{task.title || 'Untitled action'}</h3>
                <span className={`badge ${statusBadge(task.status)}`}>{task.status.replace('_', ' ')}</span>
              </div>
              {task.description && (
                <p className="text-sm text-on-surface-variant mt-2 line-clamp-3">{task.description}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5" />
                  {priorityLabel(task.priority)}
                </span>
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
