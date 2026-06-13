/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        ink: 'var(--ink)',
        sub: 'var(--sub)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        primary: 'var(--primary)',
        'primary-ink': 'var(--primary-ink)',
        'primary-soft': 'var(--primary-soft)',
        'primary-hover': 'var(--primary-hover)',
        hover: 'var(--hover)',
        positive: 'var(--positive)',
        'positive-soft': 'var(--positive-soft)',
        negative: 'var(--negative)',
        'negative-soft': 'var(--negative-soft)',
        warning: 'var(--warning)',
        'warning-soft': 'var(--warning-soft)',
        // Category accents (icon chips). Use solid for icon/text, /10–/15 alpha for chip bg.
        'cat-food': 'var(--cat-food)',
        'cat-transport': 'var(--cat-transport)',
        'cat-shopping': 'var(--cat-shopping)',
        'cat-bills': 'var(--cat-bills)',
        'cat-coffee': 'var(--cat-coffee)',
        'cat-fun': 'var(--cat-fun)',
        'cat-health': 'var(--cat-health)',
        'cat-home': 'var(--cat-home)',
        'cat-education': 'var(--cat-education)',
        'cat-income': 'var(--cat-income)',
        'cat-other': 'var(--cat-other)',
        'cat-credit': 'var(--cat-credit)',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '4.5': '18px',
      },
      borderRadius: {
        xs: '5px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '16px',
      },
      boxShadow: {
        button: 'var(--shadow-button)',
        fab: 'var(--shadow-fab)',
        pop: 'var(--shadow-pop)',
        modal: 'var(--shadow-modal)',
      },
      letterSpacing: {
        widest: '0.12em',
      },
    },
  },
  plugins: [],
}
