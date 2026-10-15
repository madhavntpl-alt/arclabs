/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../shared/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ARC LABS Brand Colors from arc-labs-cbir.vercel.app
        'arc-navy': {
          50: '#e8ebf1',
          100: '#d1dbe8',
          200: '#a3b7d1',
          300: '#7593c4',
          400: '#476fb8',
          500: '#1A2332', // Secondary dark
          600: '#0A0F1A', // Dark navy background
          600: '#0A0F1A',
          700: '#080C14',
          800: '#060910',
          900: '#04060C',
          950: '#020306',
        },
        'arc-teal': {
          50: '#e6fffa',
          100: '#b2f5ea',
          200: '#81e6d9',
          300: '#4fd1c5',
          400: '#38b2ac',
          500: '#00D4AA', // Primary teal
          600: '#00b894',
          600: '#00D4AA',
          700: '#00907a',
          800: '#007560',
          900: '#005a44',
          950: '#003D2D',
        },
        'arc-orange': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF6B35', // Orange-red - critical alerts
          600: '#ea580c',
          600: '#FF6B35',
          700: '#c2410c',
          800: '#9a340c',
          900: '#7c2d12',
        },
        'arc-amber': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFD600', // Amber - warnings
          600: '#d97706',
          600: '#FFD600',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Semantic color aliases for the design system
        primary: {
          50: '#e6fffa',
          100: '#b2f5ea',
          200: '#81e6d9',
          300: '#4fd1c5',
          400: '#38b2ac',
          500: '#00D4AA', // Primary teal
          600: '#00b894',
          600: '#00D4AA',
          700: '#00907a',
          800: '#007560',
          900: '#005a44',
          950: '#003D2D',
        },
        surface: {
          light: '#ffffff',
          dark: '#0A0F1A',
          card: {
            light: '#ffffff',
            dark: '#1A2332',
          },
          border: {
            light: '#e2e8f0',
            dark: '#2D3A4F',
          },
        },
        text: {
          primary: {
            light: '#0A0F1A',
            dark: '#F8FAFC',
          },
          secondary: {
            light: '#475569',
            dark: '#94A3B8',
          },
          muted: {
            light: '#94A3B8',
            dark: '#64748B',
          },
        },
        status: {
          normal: '#22c55e',
          warning: '#FFD600',
          critical: '#FF6B35',
          unknown: '#64748B',
        },
        online: '#00D4AA',
        offline: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'elevated': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      transitionDuration: {
        '0': '0ms',
        '2000': '2000ms',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
}