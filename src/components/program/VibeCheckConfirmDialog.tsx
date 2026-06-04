import { X } from 'lucide-react';

interface VibeCheckConfirmDialogProps {
  open: boolean;
  answered: number;
  unanswered: number;
  total: number;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function VibeCheckConfirmDialog({
  open,
  answered,
  unanswered,
  total,
  submitting,
  onCancel,
  onSubmit,
}: VibeCheckConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="glass-card w-full max-w-md p-6 sm:p-8 border border-outline-variant/30 shadow-ambient-lg relative">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="absolute top-4 right-4 p-1 rounded-ezo text-on-surface-variant hover:text-[var(--ezo-fg)]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="confirm-title" className="text-headline-md text-[var(--ezo-fg)] pr-8">
          Submit program?
        </h2>
        <p className="text-sm text-on-surface-variant mt-2">
          Review your progress before sending your responses.
        </p>

        <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-ezo-lg bg-tertiary/10 border border-tertiary/20 p-3">
            <dt className="text-xs text-on-surface-variant uppercase">Answered</dt>
            <dd className="text-2xl font-semibold text-[var(--ezo-fg)] mt-1">{answered}</dd>
          </div>
          <div className="rounded-ezo-lg bg-amber-500/10 border border-amber-400/20 p-3">
            <dt className="text-xs text-on-surface-variant uppercase">Unanswered</dt>
            <dd className="text-2xl font-semibold text-[var(--ezo-fg)] mt-1">{unanswered}</dd>
          </div>
          <div className="rounded-ezo-lg bg-primary/10 border border-primary/20 p-3">
            <dt className="text-xs text-on-surface-variant uppercase">Total</dt>
            <dd className="text-2xl font-semibold text-[var(--ezo-fg)] mt-1">{total}</dd>
          </div>
        </dl>

        {unanswered > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-300 mt-4">
            You have {unanswered} unanswered question{unanswered === 1 ? '' : 's'}. You can still
            submit, or cancel to complete them.
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="ghost-btn flex-1 justify-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="glass-btn flex-1 justify-center"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
