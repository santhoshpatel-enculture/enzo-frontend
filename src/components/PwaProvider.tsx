import { useEffect, useState, type ReactNode } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALL_DISMISS_KEY = 'enzo-pwa-install-dismissed';

interface PwaProviderProps {
  children: ReactNode;
}

export default function PwaProvider({ children }: PwaProviderProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        window.setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Service worker registration failed:', error);
    },
  });

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    const dismissed = sessionStorage.getItem(INSTALL_DISMISS_KEY) === '1';
    if (standalone || dismissed) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
      setInstallEvent(null);
    }
  };

  const dismissInstall = () => {
    sessionStorage.setItem(INSTALL_DISMISS_KEY, '1');
    setShowInstall(false);
  };

  const dismissUpdate = () => setNeedRefresh(false);

  const applyUpdate = () => {
    void updateServiceWorker(true);
  };

  return (
    <>
      {children}

      {showInstall && installEvent && !isStandalone && (
        <div
          className="fixed z-[100] inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md sm:w-full animate-slide-up"
          role="region"
          aria-label="Install Enzo app"
        >
          <div className="glass-card p-4 flex items-start gap-3 shadow-ambient-lg border-primary/20">
            <div className="w-10 h-10 rounded-ezo-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-headline font-semibold text-[var(--ezo-fg)]">Install Enzo</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Add to your home screen for a faster, app-like experience on mobile and tablet.
              </p>
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={handleInstall} className="glass-btn py-2 px-4 text-xs">
                  Install
                </button>
                <button type="button" onClick={dismissInstall} className="ghost-btn py-2 px-3 text-xs">
                  Not now
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissInstall}
              className="p-1.5 rounded-ezo text-on-surface-variant hover:text-[var(--ezo-fg)] shrink-0"
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {needRefresh && (
        <div
          className="fixed z-[100] top-[calc(0.75rem+env(safe-area-inset-top))] inset-x-4 sm:inset-x-auto sm:right-4 sm:left-auto sm:max-w-sm animate-slide-up"
          role="alert"
        >
          <div className="glass-card p-3 flex items-center gap-3 shadow-ambient-lg">
            <RefreshCw className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm flex-1 text-[var(--ezo-fg)]">A new version of Enzo is ready.</p>
            <button type="button" onClick={applyUpdate} className="glass-btn py-1.5 px-3 text-xs shrink-0">
              Reload
            </button>
            <button
              type="button"
              onClick={dismissUpdate}
              className="p-1.5 rounded-ezo text-on-surface-variant hover:text-[var(--ezo-fg)] shrink-0"
              aria-label="Dismiss update"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
