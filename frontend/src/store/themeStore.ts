import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const getSystemPrefersDark = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

const applyDocumentTheme = (isDark: boolean) => {
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      isDarkMode: getSystemPrefersDark(),

      setThemeMode: (mode: ThemeMode) => {
        const isDark = mode === 'system' ? getSystemPrefersDark() : mode === 'dark';
        applyDocumentTheme(isDark);
        set({ themeMode: mode, isDarkMode: isDark });
      },

      toggleTheme: () => {
        const currentMode = get().themeMode;
        // Cycle: system -> dark -> light -> system
        let nextMode: ThemeMode;
        if (currentMode === 'light') {
          nextMode = 'dark';
        } else if (currentMode === 'dark') {
          nextMode = 'system';
        } else {
          nextMode = 'light';
        }
        const isDark = nextMode === 'system' ? getSystemPrefersDark() : nextMode === 'dark';
        applyDocumentTheme(isDark);
        set({ themeMode: nextMode, isDarkMode: isDark });
      },

      initializeTheme: () => {
        const mode = get().themeMode;
        const isDark = mode === 'system' ? getSystemPrefersDark() : mode === 'dark';
        applyDocumentTheme(isDark);
        set({ isDarkMode: isDark });

        if (typeof window !== 'undefined' && window.matchMedia) {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const listener = (e: MediaQueryListEvent) => {
            if (get().themeMode === 'system') {
              applyDocumentTheme(e.matches);
              set({ isDarkMode: e.matches });
            }
          };
          mediaQuery.removeEventListener('change', listener);
          mediaQuery.addEventListener('change', listener);
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ themeMode: state.themeMode }),
    }
  )
);
