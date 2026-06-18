/**
 * Theme provider for dark/light mode support
 * Integrates with system preferences and localStorage
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'matisa-theme';
const DARK_MODE_CLASS = 'dark';

function getSystemTheme(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    return stored;
  }
  return 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
  const [isDark, setIsDark] = useState(() => {
    if (theme === 'system') {
      return getSystemTheme();
    }
    return theme === 'dark';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  // Update when theme changes
  useEffect(() => {
    let isDarkMode = theme === 'dark';
    if (theme === 'system') {
      isDarkMode = getSystemTheme();
    }
    setIsDark(isDarkMode);

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add(DARK_MODE_CLASS);
    } else {
      root.classList.remove(DARK_MODE_CLASS);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add(DARK_MODE_CLASS);
      } else {
        root.classList.remove(DARK_MODE_CLASS);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
