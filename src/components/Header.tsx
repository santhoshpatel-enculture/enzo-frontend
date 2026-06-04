import { Link } from 'react-router-dom';
import { Moon, Sun, Bell, Menu } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useThemeStore();
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-14 sm:h-16 lg:h-20 pt-safe border-b border-outline-variant/20 bg-[var(--ezo-glass-bg)] backdrop-blur-[20px] flex items-center justify-between px-4 sm:px-6 md:px-6 lg:px-8 sticky top-0 z-40 shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 md:hidden rounded-ezo-lg bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-[var(--ezo-fg)] transition-colors shrink-0 touch-manipulation"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs text-on-surface-variant font-medium truncate">
            Enculture AI Workspace
          </p>
          <h1 className="text-sm sm:text-base font-headline font-semibold truncate text-[var(--ezo-fg)]">
            Hello, {user?.firstName || 'User'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          to="/notifications"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-ezo-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-[var(--ezo-fg)] transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-[var(--ezo-glass-bg)]" />
        </Link>

        <button
          onClick={toggleTheme}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-ezo-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-[var(--ezo-fg)] transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        {user && (
          <div className="hidden md:flex h-9 sm:h-10 px-3 sm:px-4 rounded-ezo-lg bg-surface-container border border-outline-variant/30 items-center gap-2 max-w-[140px] lg:max-w-none">
            <span className="w-2 h-2 rounded-full bg-tertiary-container shrink-0 animate-pulse-soft" />
            <span className="text-xs font-semibold text-on-surface-variant truncate">
              {user.department}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
