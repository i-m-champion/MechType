import React, { createContext, useContext, useState, useEffect } from 'react';
import { KeycapTheme, THEME_CONFIGS, ThemeColors } from '../types/theme';

interface ThemeContextType {
  theme: KeycapTheme;
  themeConfig: ThemeColors;
  setTheme: (theme: KeycapTheme) => void;
  scanlinesEnabled: boolean;
  toggleScanlines: () => void;
  volume: number;
  setVolume: (val: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<KeycapTheme>(() => {
    const saved = localStorage.getItem('mechtype_theme');
    return (saved as KeycapTheme) || 'cyberpunk';
  });

  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('mechtype_scanlines');
    return saved !== null ? saved === 'true' : false;
  });

  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem('mechtype_volume');
    return saved !== null ? parseFloat(saved) : 0.8;
  });

  const setTheme = (newTheme: KeycapTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('mechtype_theme', newTheme);
    if (newTheme === 'crt') {
      setScanlinesEnabled(true);
    }
  };

  const toggleScanlines = () => {
    setScanlinesEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('mechtype_scanlines', String(next));
      return next;
    });
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    localStorage.setItem('mechtype_volume', String(clamped));
  };

  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.cyberpunk;

  useEffect(() => {
    // Apply CSS variables to root
    const root = document.documentElement;
    root.style.setProperty('--color-bg', themeConfig.bg);
    root.style.setProperty('--color-surface', themeConfig.surface);
    root.style.setProperty('--color-panel', themeConfig.panel);
    root.style.setProperty('--color-border', themeConfig.border);
    root.style.setProperty('--color-accent', themeConfig.accent);
    root.style.setProperty('--color-text', themeConfig.text);
    root.style.setProperty('--color-glow', themeConfig.glow);
  }, [themeConfig]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig,
        setTheme,
        scanlinesEnabled,
        toggleScanlines,
        volume,
        setVolume,
      }}
    >
      <div
        className="min-h-screen transition-colors duration-300 relative"
        style={{
          backgroundColor: themeConfig.bg,
          color: themeConfig.text,
        }}
      >
        {scanlinesEnabled && (
          <div className="fixed inset-0 pointer-events-none z-50 crt-overlay opacity-70" />
        )}
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
