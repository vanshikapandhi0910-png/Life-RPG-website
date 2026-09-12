/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rpg: {
          bg: 'var(--rpg-bg)',
          card: 'var(--rpg-card)',
          border: 'var(--rpg-border)',
          primary: 'var(--rpg-primary)',
          accent: 'var(--rpg-accent)',
          gold: '#f59e0b',
          gems: '#06b6d4',
          hp: '#ef4444',
          mana: '#3b82f6',
          xp: '#8b5cf6',
          str: '#f97316',
          int: '#3b82f6',
          agi: '#10b981',
          vit: '#ec4899',
          cha: '#eab308',
          spi: '#a855f7',
        }
      },
      fontFamily: {
        fantasy: ['Cinzel', 'Cinzel Decorative', 'serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glowPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'floating 4s ease-in-out infinite',
        'level-shine': 'shine 1.5s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.2))' },
        },
        floating: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shine: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        }
      }
    },
  },
  plugins: [],
}
