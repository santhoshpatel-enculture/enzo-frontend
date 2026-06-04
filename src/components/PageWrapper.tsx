import { useState, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface PageWrapperProps {
  children: ReactNode;
  /** Chat-style layout: edge-to-edge, fills space below header */
  fullBleed?: boolean;
}

export default function PageWrapper({ children, fullBleed = false }: PageWrapperProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className={`flex bg-[var(--ezo-bg)] w-full ${
        fullBleed ? 'h-dvh max-h-dvh overflow-hidden' : 'min-h-dvh'
      }`}
    >
      {/* Desktop / tablet sidebar (768px+) */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-[min(280px,85vw)] z-50 md:hidden bg-surface-container-lowest border-r border-outline-variant/20 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setMobileOpen(false)} />
      </div>

      <div
        className={`flex-1 flex flex-col min-w-0 w-full ${
          fullBleed ? 'min-h-0 h-full' : ''
        }`}
      >
        <Header onMenuClick={() => setMobileOpen(true)} />

        <main
          className={`relative pb-safe page-enter ${
            fullBleed
              ? 'flex flex-1 flex-col min-h-0 overflow-hidden'
              : 'flex-1'
          }`}
        >
          {!fullBleed && (
            <>
              <div className="absolute top-[8%] right-[4%] w-[min(400px,50vw)] h-[min(400px,40vh)] rounded-full bg-primary/5 blur-[120px] pointer-events-none hidden sm:block" />
              <div className="absolute bottom-[8%] left-[4%] w-[min(400px,50vw)] h-[min(400px,40vh)] rounded-full bg-secondary/5 blur-[120px] pointer-events-none hidden sm:block" />
            </>
          )}

          <div
            className={
              fullBleed
                ? 'relative z-10 flex flex-1 flex-col min-h-0 w-full h-full'
                : 'relative z-10 container-ezo py-4 sm:py-6 md:py-8 w-full'
            }
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
