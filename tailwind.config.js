/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F6F1E7',
          soft: '#FBF8F2',
          line: '#E4DBC8',
        },
        ink: {
          DEFAULT: '#1C1A17',
          soft: '#4A453D',
        },
        seal: {
          DEFAULT: '#7A1F2B',
          dark: '#5C1720',
          light: '#9C3140',
        },
        brass: {
          DEFAULT: '#B08D57',
          light: '#D3B482',
        },
        navy: {
          DEFAULT: '#0F1A2B',
          surface: '#16233A',
          line: '#28374F',
          soft: '#9AAAC4',
        },
      },
      fontFamily: {
        display: ['"Spectral"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,26,23,0.06), 0 1px 12px rgba(28,26,23,0.04)',
      },
      backgroundImage: {
        'seal-ring': 'repeating-conic-gradient(from 0deg, currentColor 0deg 2deg, transparent 2deg 12deg)',
      },
    },
  },
  plugins: [],
}
