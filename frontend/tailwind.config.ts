import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#08080d',
          surface: 'rgba(255,255,255,0.03)',
          'surface-hover': 'rgba(255,255,255,0.06)',
          'surface-active': 'rgba(255,255,255,0.09)',
          elevated: 'rgba(255,255,255,0.04)',
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          medium: 'rgba(255,255,255,0.1)',
          strong: 'rgba(255,255,255,0.15)',
        },
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255,255,255,0.55)',
          tertiary: 'rgba(255,255,255,0.35)',
          muted: 'rgba(255,255,255,0.2)',
        },
        accent: {
          blue: 'rgba(56,120,200,0.8)',
          green: 'rgba(68,255,136,0.8)',
          amber: 'rgba(255,180,50,0.8)',
          red: 'rgba(255,68,68,0.8)',
        },
      },
      fontFamily: {
        sans: ['Outfit', '-apple-system', 'sans-serif'],
        mono: ['DM Mono', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
