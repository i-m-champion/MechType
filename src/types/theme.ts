export type KeycapTheme = 'industrial' | 'cyberpunk' | 'retro1984' | 'nordic' | 'crt';

export interface ThemeColors {
  id: KeycapTheme;
  name: string;
  subtitle: string;
  bg: string;
  surface: string;
  panel: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSecondary: string;
  keycapBase: string;
  keycapTop: string;
  keycapText: string;
  keycapActive: string;
  modKeyBase: string;
  modKeyTop: string;
  glow: string;
  scanlines: boolean;
  isLight?: boolean;
}

export const THEME_CONFIGS: Record<KeycapTheme, ThemeColors> = {
  industrial: {
    id: 'industrial',
    name: 'Pristine White Architectural',
    subtitle: 'Minimal pure white architectural canvas with stark typography & international orange',
    bg: '#ffffff',
    surface: '#ffffff',
    panel: '#fbfbfb',
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#6b7280',
    accent: '#ff5500',
    accentSecondary: '#ff2626',
    keycapBase: '#e5e7eb',
    keycapTop: '#ffffff',
    keycapText: '#111827',
    keycapActive: '#ff5500',
    modKeyBase: '#d1d5db',
    modKeyTop: '#f3f4f6',
    glow: 'rgba(255, 85, 0, 0.2)',
    scanlines: false,
    isLight: true,
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    subtitle: 'High-contrast nocturnal arcade with electric cyan & hot magenta',
    bg: '#0a0d14',
    surface: '#111726',
    panel: '#151e33',
    border: '#202f4a',
    text: '#e2e8f0',
    textMuted: '#64748b',
    accent: '#00f0ff',
    accentSecondary: '#ff0077',
    keycapBase: '#121829',
    keycapTop: '#1b233a',
    keycapText: '#38bdf8',
    keycapActive: '#00f0ff',
    modKeyBase: '#1a1d2e',
    modKeyTop: '#252942',
    glow: 'rgba(0, 240, 255, 0.5)',
    scanlines: false,
  },
  retro1984: {
    id: 'retro1984',
    name: 'Retro 1984 Beige',
    subtitle: 'Classic IBM Model M & vintage mechanical keyboard aesthetics',
    bg: '#25211c',
    surface: '#332d26',
    panel: '#3d362e',
    border: '#544b40',
    text: '#e8decb',
    textMuted: '#9e917e',
    accent: '#e66b27',
    accentSecondary: '#d4883b',
    keycapBase: '#c2b69f',
    keycapTop: '#ded4c1',
    keycapText: '#2e2720',
    keycapActive: '#e66b27',
    modKeyBase: '#9a8d77',
    modKeyTop: '#b3a58e',
    glow: 'rgba(230, 107, 39, 0.4)',
    scanlines: false,
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic Minimal Slate',
    subtitle: 'Frosty Scandinavian minimalism with matte slate & crisp ice white',
    bg: '#0f172a',
    surface: '#1e293b',
    panel: '#28364f',
    border: '#334155',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    accent: '#38bdf8',
    accentSecondary: '#818cf8',
    keycapBase: '#334155',
    keycapTop: '#475569',
    keycapText: '#f8fafc',
    keycapActive: '#38bdf8',
    modKeyBase: '#1e293b',
    modKeyTop: '#334155',
    glow: 'rgba(56, 189, 248, 0.35)',
    scanlines: false,
  },
  crt: {
    id: 'crt',
    name: 'CRT Phosphor Green',
    subtitle: '1982 Cyberdeck VT100 green terminal with scanlines & bloom',
    bg: '#040b04',
    surface: '#081708',
    panel: '#0c240c',
    border: '#144214',
    text: '#44ff44',
    textMuted: '#1d821d',
    accent: '#00ff44',
    accentSecondary: '#88ff00',
    keycapBase: '#061a06',
    keycapTop: '#0d2d0d',
    keycapText: '#39ff14',
    keycapActive: '#00ff66',
    modKeyBase: '#081c08',
    modKeyTop: '#103310',
    glow: 'rgba(57, 255, 20, 0.6)',
    scanlines: true,
  },
};
