/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-2': '#F1F5F9',
        primary: '#0F172A',
        secondary: '#334155',
        muted: '#94A3B8',
        border: '#E2E8F0',
        accent: '#0EA5E9',
        positive: '#10B981',
        negative: '#F43F5E',
        warning: '#F59E0B',
        // Dark mode aliases (for direct class use)
        'dark-bg': '#0F172A',
        'dark-surface': '#1E293B',
        'dark-surface-2': '#334155',
        'dark-primary': '#F8FAFC',
        'dark-secondary': '#CBD5E1',
        'dark-muted': '#64748B',
        'dark-border': '#334155',
        'dark-accent': '#38BDF8',
        'dark-positive': '#34D399',
        'dark-negative': '#FB7185',
        'dark-warning': '#FBBF24',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '4.5': '18px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 12px rgba(0,0,0,0.08)',
        lg: '0 8px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
