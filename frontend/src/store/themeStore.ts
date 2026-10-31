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

    // Automatically adapt system settings & native browser controls
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

    // Adapt mobile browser address bar / system chrome
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', isDark ? '#0f172a' : '#ffffff');
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
        const currentlyDark = get().isDarkMode;
        // Direct toggle between light and dark with single button
        const nextMode: ThemeMode = currentlyDark ? 'light' : 'dark';
        const isDark = nextMode === 'dark';
        applyDocumentTheme(isDark);
        set({ themeMode: nextMode, isDarkMode: isDark });
      },

      initializeTheme: () => {
        const mode = get().themeMode;
        const isDark = mode === 'system' ? getSystemPrefersDark() : mode === 'dark';
        applyDocumentTheme(isDark);
        set({ isDarkMode: isDark });

        // Listen for OS system settings changes and adapt automatically
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
