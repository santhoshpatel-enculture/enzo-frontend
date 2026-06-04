import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import { getProgram } from '../services/api';
import type { ProgramDetail as ProgramDetailType } from '../services/api';

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<ProgramDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getProgram(id)
      .then(setProgram)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="max-w-2xl mx-auto h-48 skeleton" />;
  }

  if (error || !program) {
    return (
      <div className="glass-card p-8 text-center max-w-lg mx-auto">
        <AlertTriangle className="w-10 h-10 text-error mx-auto mb-3" />
        <p className="text-body-sm text-on-surface-variant mb-4">{error || 'Program not found'}</p>
        <Link to="/programs" className="glass-btn inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to programs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 w-full">
      <Link
        to="/programs"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        All programs
      </Link>

      <div className="glass-card p-6 sm:p-8 border border-outline-variant/20 space-y-4">
        <h1 className="text-headline-lg text-[var(--ezo-fg)]">{program.title}</h1>
        <span className="badge badge-pending">{program.participationStatus}</span>

        {program.description && (
          <p className="text-body-sm text-on-surface-variant">{program.description}</p>
        )}

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {program.dueAt && (
            <div>
              <dt className="text-on-surface-variant text-xs uppercase">Due</dt>
              <dd className="font-medium text-[var(--ezo-fg)] mt-1">
                {new Date(program.dueAt).toLocaleString()}
              </dd>
            </div>
          )}
          {program.completedAt && (
            <div>
              <dt className="text-on-surface-variant text-xs uppercase">Completed</dt>
              <dd className="font-medium text-[var(--ezo-fg)] mt-1">
                {new Date(program.completedAt).toLocaleString()}
              </dd>
            </div>
          )}
        </dl>

        <div className="rounded-ezo-lg bg-tertiary/10 border border-tertiary/20 p-4 flex gap-3">
          <Shield className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-[var(--ezo-fg)]">Anonymous program</p>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Your individual responses are confidential and are not displayed in Enzo to you,
              your manager, or leadership. Only participation status and aggregate analytics are available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
