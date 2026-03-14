import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        zuki: {
          cream:        '#FFFAF8',
          pink:         '#F4A7B9',
          'pink-deep':  '#E07A93',
          blue:         '#5B8DEF',
          'blue-deep':  '#3A6FD8',
          charcoal:     '#2D2D2D',
          muted:        '#8A8A8A',
          border:       '#F0E8E8',
          success:      '#6BCB8B',
          warning:      '#F6C85F',
          error:        '#F47B7B',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        zuki:     '0 4px 24px rgba(244, 167, 185, 0.15)',
        'zuki-lg':'0 8px 40px rgba(244, 167, 185, 0.25)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
