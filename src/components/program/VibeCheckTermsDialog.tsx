import { X } from 'lucide-react';

interface VibeCheckTermsDialogProps {
  open: boolean;
  onDecline: () => void;
  onAccept: () => void;
}

export default function VibeCheckTermsDialog({
  open,
  onDecline,
  onAccept,
}: VibeCheckTermsDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
    >
      <div className="glass-card w-full max-w-md p-6 sm:p-8 border border-outline-variant/30 shadow-ambient-lg relative">
        <button
          type="button"
          onClick={onDecline}
          className="absolute top-4 right-4 p-1 rounded-ezo text-on-surface-variant hover:text-[var(--ezo-fg)]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="terms-title" className="text-headline-md text-[var(--ezo-fg)] pr-8">
          Terms and conditions
        </h2>
        <div className="mt-4 space-y-3 text-sm text-on-surface-variant leading-relaxed">
          <p>
            By starting this program, you agree to participate and understand that your responses
            will remain anonymous and be used only for improvement purposes.
          </p>
          <p>
            Your individual answers stay confidential. Aggregated results may be shared with
            leadership to help shape AI adoption and workplace culture initiatives.
          </p>
          <p>
            You may pause and return to complete the program at any time before it closes.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <button type="button" onClick={onDecline} className="ghost-btn flex-1 justify-center">
            No
          </button>
          <button type="button" onClick={onAccept} className="glass-btn flex-1 justify-center">
            Yes, start program
          </button>
        </div>
      </div>
    </div>
  );
}
