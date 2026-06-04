import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, ChevronRight, Moon, Sun } from 'lucide-react';
import { getSettings, updateSettings } from '../services/api';
import type { UserSettingsType } from '../services/api';
import { useThemeStore } from '../store/themeStore';

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? 'bg-primary' : 'bg-outline-variant/40'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-ezo-xl border border-outline-variant/20 bg-surface-container-low/40 overflow-hidden divide-y divide-outline-variant/15">
      {children}
    </section>
  );
}

function SettingsItem({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--ezo-fg)]">{label}</p>
        {hint && <p className="text-xs text-on-surface-variant mt-0.5">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<UserSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getSettings()
      .then((data) => {
        setSettings(data);
        if (data.theme === 'light' || data.theme === 'dark') {
          setTheme(data.theme);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [setTheme]);

  const persist = (next: UserSettingsType) => {
    setSaving(true);
    updateSettings(next)
      .then(() => {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1800);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to save'))
      .finally(() => setSaving(false));
  };

  const handleUpdate = (updated: Partial<UserSettingsType>) => {
    if (!settings) return;
    const next = { ...settings, ...updated };
    setSettings(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(next), 400);
  };

  const setThemePreference = (nextTheme: 'light' | 'dark') => {
    if (theme === nextTheme) return;
    setTheme(nextTheme);
    handleUpdate({ theme: nextTheme });
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto w-full space-y-4">
        <div className="h-8 w-32 skeleton rounded-ezo-lg" />
        <div className="h-48 skeleton rounded-ezo-xl" />
        <div className="h-28 skeleton rounded-ezo-xl" />
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <AlertTriangle className="w-10 h-10 text-error mx-auto mb-3" />
        <p className="text-sm text-on-surface-variant mb-4">{error}</p>
        <button type="button" onClick={() => window.location.reload()} className="glass-btn text-sm">
          Retry
        </button>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-md mx-auto w-full pb-8">
      <header className="mb-6">
        <h1 className="text-headline-lg text-[var(--ezo-fg)]">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">Appearance, notifications, and account</p>
        {(saved || saving) && (
          <p
            className={`text-xs mt-2 flex items-center gap-1 ${
              saved ? 'text-tertiary' : 'text-on-surface-variant'
            }`}
          >
            {saved && (
              <>
                <Check className="w-3.5 h-3.5" />
                Saved
              </>
            )}
            {saving && !saved && 'Saving…'}
          </p>
        )}
      </header>

      <div className="space-y-6">
        <SettingsGroup>
          <SettingsItem label="Theme">
            <div
              className="inline-flex p-0.5 rounded-ezo-lg bg-surface-container border border-outline-variant/25"
              role="group"
              aria-label="Theme"
            >
              <button
                type="button"
                disabled={saving}
                onClick={() => setThemePreference('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-[var(--ezo-fg)]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                Dark
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => setThemePreference('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-[var(--ezo-fg)]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                Light
              </button>
            </div>
          </SettingsItem>
        </SettingsGroup>

        <SettingsGroup>
          <SettingsItem label="AI suggestions" hint="Proactive tips in chat">
            <Toggle
              label="AI suggestions"
              checked={settings.ai_suggestions_enabled}
              onChange={(checked) => handleUpdate({ ai_suggestions_enabled: checked })}
              disabled={saving}
            />
          </SettingsItem>
          <SettingsItem label="Email digest" hint="Weekly summary">
            <Toggle
              label="Email digest"
              checked={settings.notifications_enabled}
              onChange={(checked) => handleUpdate({ notifications_enabled: checked })}
              disabled={saving}
            />
          </SettingsItem>
        </SettingsGroup>

        <SettingsGroup>
          <Link
            to="/change-password"
            className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4 hover:bg-surface-container/60 transition-colors"
          >
            <span className="text-sm font-medium text-[var(--ezo-fg)]">Password</span>
            <ChevronRight className="w-4 h-4 text-on-surface-variant" />
          </Link>
        </SettingsGroup>
      </div>
    </div>
  );
}
