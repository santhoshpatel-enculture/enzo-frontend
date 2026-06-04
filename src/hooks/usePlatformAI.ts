import { useCallback, useEffect, useState } from 'react';
import { getPlatformAI, type PublicAIConfig } from '../services/api';

const POLL_MS = 20_000;

export function usePlatformAI() {
  const [aiConfig, setAiConfig] = useState<PublicAIConfig | null>(null);

  const refresh = useCallback(async () => {
    try {
      setAiConfig(await getPlatformAI());
    } catch {
      /* keep last known config */
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, POLL_MS);
    const onFocus = () => refresh();
    const onConfigChange = () => refresh();
    window.addEventListener('focus', onFocus);
    window.addEventListener('enzo:ai-config-changed', onConfigChange);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('enzo:ai-config-changed', onConfigChange);
    };
  }, [refresh]);

  return { aiConfig, refresh };
}
