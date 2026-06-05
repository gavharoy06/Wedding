import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#fff7ff',
        surface: '#fff7ff',
        'surface-variant': '#e8e0e8',
        primary: '#6a5188',
        'on-primary': '#ffffff',
        secondary: '#6c4ab2',
        'on-secondary': '#ffffff',
        'secondary-fixed': '#eaddff',
        tertiary: '#5f596b',
        'on-surface': '#1d1a20',
        'on-surface-variant': '#4a454e',
        outline: '#7b757f',
        error: '#ba1a1a',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      spacing: {
        'section-gap': '120px',
        gutter: '24px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
        'container-padding': '40px',
      },
      borderRadius: { lg: '0.5rem', xl: '0.75rem', full: '9999px' },
    },
  },
  plugins: [],
} satisfies Config;
