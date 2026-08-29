/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'kobac-theme';

// NOTE: default is 'dark' while pages are still being migrated to tokens.
// Flip DEFAULT_THEME to 'light' in the final theming phase.
const DEFAULT_THEME = 'dark';

const ThemeContext = createContext({ theme: DEFAULT_THEME, toggleTheme: () => {}, setTheme: () => {} });

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
};

const apply = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    apply(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next === 'light' || next === 'dark' ? next : DEFAULT_THEME);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
