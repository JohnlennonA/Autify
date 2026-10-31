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
        dark: {
          bg: '#0B0C0E',
          surface: '#141619',
          elevated: '#1E2025',
          border: 'rgba(255, 255, 255, 0.07)',
          borderSubtle: 'rgba(255, 255, 255, 0.05)',
        },
        emerald: {
          500: '#10B981',
          400: '#34D399',
          600: '#059669',
        },
        electric: {
          500: '#2563EB',
          400: '#3B82F6',
          600: '#1D4ED8',
        },
        amber: {
          500: '#F59E0B',
          400: '#FBBF24',
          600: '#D97706',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glow-electric': '0 0 25px -5px rgba(37, 99, 235, 0.25)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
      }
    },
  },
  plugins: [],
}
