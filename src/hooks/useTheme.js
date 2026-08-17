import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pa_standards_theme';

/**
 * Safely retrieves stored theme from localStorage, or detects OS system preference ('light' | 'dark').
 * @returns {'dark' | 'light'}
 */
export function getStoredTheme() {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    // Fall back to system / OS color scheme preference if no explicit user selection
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch (e) {
    // localStorage might not be accessible in restricted iframe/sandbox
  }
  return 'dark';
}

/**
 * Custom React hook to manage application theme with localStorage persistence,
 * HTML root data-theme attribute synchronization, OS prefers-color-scheme adaptation,
 * dynamic theme-color meta tag updates, and real-time cross-tab sync.
 */
export function useTheme() {
  const [theme, setThemeState] = useState(() => getStoredTheme());

  // Synchronize DOM attributes, body classes, meta tags, and localStorage whenever theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      if (document.body) {
        if (theme === 'light') {
          document.body.classList.add('light-theme');
        } else {
          document.body.classList.remove('light-theme');
        }
      }

      // Update mobile browser status bar theme color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'light' ? '#f4f6f8' : '#00234b');
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
      localStorage.setItem('theme', theme);
    } catch (e) {
      // Ignore storage errors in restricted environments
    }
  }, [theme]);

  // Listen for storage events from other browser tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY || e.key === 'theme') {
        if (e.newValue === 'light' || e.newValue === 'dark') {
          setThemeState(e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for OS prefers-color-scheme changes when user hasn't explicitly locked a preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleSystemThemeChange = (e) => {
      try {
        const explicit = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('theme');
        if (!explicit) {
          setThemeState(e.matches ? 'light' : 'dark');
        }
      } catch (err) {
        setThemeState(e.matches ? 'light' : 'dark');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    }
  }, []);

  return {
    theme,
    toggleTheme,
    setTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark'
  };
}

export default useTheme;
