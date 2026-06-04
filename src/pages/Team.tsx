import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Mail, Network, User } from 'lucide-react';
import { getManager, getReportees } from '../services/api';
import type { OrgPersonSummary } from '../services/api';

function PersonCard({ person, subtitle }: { person: OrgPersonSummary; subtitle?: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center font-semibold text-primary shrink-0">
        {person.firstName[0]}
        {person.lastName[0]}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-[var(--ezo-fg)]">
          {person.firstName} {person.lastName}
        </p>
        <p className="text-sm text-on-surface-variant">
          {person.designation} · {person.department}
        </p>
        {subtitle && <p className="text-xs text-on-surface-variant mt-1">{subtitle}</p>}
        {person.email && (
          <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {person.email}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Team() {
  const [manager, setManager] = useState<OrgPersonSummary | null | undefined>(undefined);
  const [reportees, setReportees] = useState<OrgPersonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getManager(), getReportees()])
      .then(([mgr, reps]) => {
        setManager(mgr);
        setReportees(reps.reportees);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 w-full">
        <div className="h-10 w-48 skeleton" />
        <div className="h-32 skeleton" />
        <div className="h-48 skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center max-w-lg mx-auto">
        <AlertTriangle className="w-10 h-10 text-error mx-auto mb-3" />
        <p className="text-body-sm text-on-surface-variant">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-lg text-[var(--ezo-fg)]">Team</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Your manager and direct reports</p>
        </div>
        <Link
          to="/org-chart"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-ezo-lg text-sm font-semibold border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
        >
          <Network className="w-4 h-4" />
          View org chart
        </Link>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border border-outline-variant/20"
      >
        <h2 className="text-headline-md text-[var(--ezo-fg)] mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Reporting manager
        </h2>
        {manager ? (
          <PersonCard person={manager} subtitle="Your manager" />
        ) : (
          <p className="text-sm text-on-surface-variant">No manager on file.</p>
        )}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-6 border border-outline-variant/20"
      >
        <h2 className="text-headline-md text-[var(--ezo-fg)] mb-4">
          Direct reports ({reportees.length})
        </h2>
        {reportees.length === 0 ? (
          <p className="text-sm text-on-surface-variant">You have no direct reports listed.</p>
        ) : (
          <div className="space-y-6">
            {reportees.map((r) => (
              <PersonCard key={r.id} person={r} />
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
