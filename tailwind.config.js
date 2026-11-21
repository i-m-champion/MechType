/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mech: {
          bg: '#0a0d14',
          surface: '#111726',
          panel: '#161f33',
          border: '#23304a',
          accent: '#00f0ff',
          neonPink: '#ff0077',
          neonAmber: '#ffaa00',
          neonGreen: '#00ff88',
          crtGreen: '#33ff33',
          beigeBg: '#e6ded1',
          beigeKey: '#d9cdbb',
          beigeDark: '#b8a892',
          beigeAccent: '#d2572b',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Space Grotesk"', '"Syne"', 'sans-serif'],
        arcade: ['"Press Start 2P"', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'crt-flicker': 'crtFlicker 0.15s infinite',
        'combustion': 'combustion 0.8s ease-out infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.6))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 5px rgba(0, 240, 255, 0.2))' },
        },
        crtFlicker: {
          '0%': { opacity: '0.98' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.99' },
        },
        combustion: {
          '0%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 8px #ff4500)' },
          '100%': { transform: 'scale(1.05)', filter: 'drop-shadow(0 0 18px #ff0055)' },
        }
      }
    },
  },
  plugins: [],
};
