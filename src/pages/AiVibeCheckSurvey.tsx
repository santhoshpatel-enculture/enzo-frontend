import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Globe,
  HelpCircle,
  Home,
  Lock,
  Shield,
  Sparkles,
} from 'lucide-react';
import VibeCheckConfirmDialog from '../components/program/VibeCheckConfirmDialog';
import VibeCheckTermsDialog from '../components/program/VibeCheckTermsDialog';
import {
  AI_VIBE_CHECK_PROGRAM,
  AI_VIBE_CHECK_QUESTIONS,
  countAnswered,
  type ProgramAnswers,
  type ProgramQuestion,
} from '../data/aiVibeCheck';
import { getAiVibeCheckStatus, submitAiVibeCheck } from '../services/api';

type Step = 'intro' | 'questions' | 'success';

function QuestionBlock({
  question,
  index,
  answers,
  onSingle,
  onMulti,
  onOpen,
}: {
  question: ProgramQuestion;
  index: number;
  answers: ProgramAnswers;
  onSingle: (id: string, optionId: string) => void;
  onMulti: (id: string, optionId: string, checked: boolean) => void;
  onOpen: (id: string, text: string) => void;
}) {
  const value = answers[question.id];

  return (
    <div className="glass-card p-5 sm:p-6 border border-outline-variant/20 space-y-4">
      <p className="text-sm font-medium text-primary">Question {index + 1}</p>
      <h3 className="text-base sm:text-lg font-semibold text-[var(--ezo-fg)] leading-snug">
        {question.prompt}
      </h3>

      {question.type === 'single' && question.options && (
        <div className="space-y-2">
          {question.options.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center gap-3 p-3 rounded-ezo-lg border cursor-pointer transition-colors ${
                value === opt.id
                  ? 'border-primary bg-primary/10'
                  : 'border-outline-variant/25 hover:border-primary/30'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                checked={value === opt.id}
                onChange={() => onSingle(question.id, opt.id)}
                className="w-4 h-4 accent-[var(--ezo-primary)]"
              />
              <span className="text-sm text-[var(--ezo-fg)]">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'multi' && question.options && (
        <div className="space-y-2">
          <p className="text-xs text-on-surface-variant">Select all that apply</p>
          {question.options.map((opt) => {
            const selected = Array.isArray(value) && value.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-3 rounded-ezo-lg border cursor-pointer transition-colors ${
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-outline-variant/25 hover:border-primary/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => onMulti(question.id, opt.id, e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--ezo-primary)]"
                />
                <span className="text-sm text-[var(--ezo-fg)]">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {question.type === 'open' && (
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onOpen(question.id, e.target.value)}
          placeholder={question.placeholder}
          className="glass-input w-full"
        />
      )}
    </div>
  );
}

export default function AiVibeCheckSurvey() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('intro');
  const [termsOpen, setTermsOpen] = useState(false);
  const [answers, setAnswers] = useState<ProgramAnswers>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [redirectIn, setRedirectIn] = useState(5);

  const counts = countAnswered(answers);

  useEffect(() => {
    getAiVibeCheckStatus()
      .then((s) => {
        if (s.completed) setStep('success');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (step !== 'success') return;
    setRedirectIn(5);
    const redirectTimer = window.setTimeout(() => {
      navigate('/home', { replace: true });
    }, 5000);
    const tick = window.setInterval(() => {
      setRedirectIn((n) => Math.max(0, n - 1));
    }, 1000);
    return () => {
      window.clearTimeout(redirectTimer);
      window.clearInterval(tick);
    };
  }, [step, navigate]);

  const handleSingle = (qId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  const handleMulti = (qId: string, optionId: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[qId]) ? [...(prev[qId] as string[])] : [];
      const next = checked
        ? [...new Set([...current, optionId])]
        : current.filter((id) => id !== optionId);
      return { ...prev, [qId]: next };
    });
  };

  const handleOpen = (qId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitAiVibeCheck(answers);
      setConfirmOpen(false);
      setStep('success');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto w-full py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 sm:p-10 text-center border border-tertiary/30"
        >
          <CheckCircle2 className="w-16 h-16 text-tertiary mx-auto mb-4" />
          <h1 className="text-headline-lg text-[var(--ezo-fg)]">Thank you!</h1>
          <p className="text-body-sm text-on-surface-variant mt-3 leading-relaxed">
            Your responses have been received. Thanks for sharing your AI vibe — your feedback helps
            shape how we support AI adoption at work.
          </p>
          <p className="text-xs text-on-surface-variant mt-4">
            Redirecting to home in {redirectIn} second{redirectIn === 1 ? '' : 's'}…
          </p>
          <Link
            to="/home"
            className="glass-btn inline-flex items-center gap-2 mt-8"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  if (step === 'questions') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 w-full pb-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {AI_VIBE_CHECK_PROGRAM}
          </p>
          <h1 className="text-headline-lg text-[var(--ezo-fg)] mt-1">AI Vibe Check</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            5 questions · Anonymous · Your individual answers stay confidential
          </p>
        </div>

        <div className="space-y-5">
          {AI_VIBE_CHECK_QUESTIONS.map((q, i) => (
            <QuestionBlock
              key={q.id}
              question={q}
              index={i}
              answers={answers}
              onSingle={handleSingle}
              onMulti={handleMulti}
              onOpen={handleOpen}
            />
          ))}
        </div>

        {submitError && (
          <p className="text-sm text-error text-center">{submitError}</p>
        )}

        <div className="flex justify-end sticky bottom-4 z-10">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="glass-btn inline-flex items-center gap-2 shadow-ambient-lg"
          >
            Submit program
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <VibeCheckConfirmDialog
          open={confirmOpen}
          answered={counts.answered}
          unanswered={counts.unanswered}
          total={counts.total}
          submitting={submitting}
          onCancel={() => setConfirmOpen(false)}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full pb-12 space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-headline text-[var(--ezo-fg)] leading-tight">
          Before you <span className="text-primary">begin</span>
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-4 leading-relaxed">
          Please take a moment to review these instructions to ensure a smooth program experience.
          You may pause and return to the program at any time.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-primary">Instructions</h2>
        <div className="mt-3 space-y-3 text-sm text-on-surface-variant leading-relaxed">
          <p>Please share your honest feedback by completing this program.</p>
          <p>
            This program is a key part of our commitment to creating a more inclusive, accountable,
            and high-performing culture.
          </p>
          <p>
            Your input will help shape improvements that impact how we work and succeed together.
          </p>
          <p>
            This program can be completed at your convenience. You may choose to finish it in one
            sitting or return later if needed.
          </p>
          <p className="font-medium text-[var(--ezo-fg)]">Your responses are strictly confidential.</p>
        </div>
      </section>

      <div className="glass-card p-5 sm:p-6 border border-outline-variant/20 space-y-3">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Globe className="w-4 h-4 shrink-0" />
          <span>
            <strong className="text-[var(--ezo-fg)]">Language</strong> · English
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>
            <strong className="text-[var(--ezo-fg)]">Closes in</strong> · 7 days
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong className="text-[var(--ezo-fg)]">Questions</strong> · 5
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 shrink-0 text-primary" />
          <span className="text-on-surface-variant">
            <strong className="text-[var(--ezo-fg)]">Responses</strong>
          </span>
          <span className="badge badge-pending text-xs">Anonymous</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Lock className="w-4 h-4 shrink-0 text-primary" />
          <span className="text-on-surface-variant">
            <strong className="text-[var(--ezo-fg)]">Security</strong>
          </span>
          <span className="badge badge-pending text-xs">E2E Encrypted</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setTermsOpen(true)}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold border transition-all bg-surface-container-high border-outline-variant/40 text-[var(--ezo-fg)] hover:border-primary/40 hover:bg-primary/5"
        >
          Start
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <VibeCheckTermsDialog
        open={termsOpen}
        onDecline={() => setTermsOpen(false)}
        onAccept={() => {
          setTermsOpen(false);
          setStep('questions');
        }}
      />
    </div>
  );
}
