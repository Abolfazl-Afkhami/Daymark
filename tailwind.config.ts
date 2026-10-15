import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Estedad',
          'Vazirmatn RD',
          'Vazirmatn',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Estedad', 'Vazirmatn RD', 'monospace'],
      },
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        'text-main': 'var(--text-primary)',
        'text-muted': 'var(--text-secondary)',
        'border-subtle': 'var(--border-subtle)',
        accent: 'var(--accent-primary)',
        'status-complete': 'var(--status-complete)',
        'status-partial': 'var(--status-partial)',
        'status-skipped': 'var(--status-skipped)',
        'status-missed': 'var(--status-missed)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
};

export default config;
