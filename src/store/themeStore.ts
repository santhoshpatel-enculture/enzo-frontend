import { create } from 'zustand';

const THEME_STORAGE_KEY = 'enzo.theme';

export type ThemeMode = 'dark' | 'light';

export function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme: ThemeMode): void {
  document.documentElement.classList.toggle('light-theme', theme === 'light');
  document.documentElement.style.colorScheme = theme;
}

export function initTheme(): ThemeMode {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}

interface ThemeState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getStoredTheme(),

  toggleTheme: () => {
    const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setTheme: (theme) => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    set({ theme });
  },
}));
