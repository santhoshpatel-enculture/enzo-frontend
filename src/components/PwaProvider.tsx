import { Capacitor } from '@capacitor/core';
import { lazy, Suspense, type ReactNode } from 'react';

const isNativeShell =
  Boolean(import.meta.env.TAURI_ENV_PLATFORM) || Capacitor.isNativePlatform();

const PwaProviderWeb = lazy(() => import('./PwaProvider.web'));

interface PwaProviderProps {
  children: ReactNode;
}

export default function PwaProvider({ children }: PwaProviderProps) {
  if (isNativeShell) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={<>{children}</>}>
      <PwaProviderWeb>{children}</PwaProviderWeb>
    </Suspense>
  );
}
