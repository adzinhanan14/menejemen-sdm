/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 3-WARNA PALET FORMAL: Deep Sapphire · Gold · Warm Ivory
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      colors: {
        // PRIMARY — Deep Sapphire (sidebar, header, CTA utama)
        primary: {
          DEFAULT: '#1A3A6B',
          50:  '#EEF2FB',
          100: '#D4DFF5',
          200: '#A9BFEB',
          300: '#7E9EE0',
          400: '#537ED6',
          500: '#2B5DBF',
          600: '#1A3A6B',
          700: '#142E56',
          800: '#0E2140',
          900: '#08142A',
        },
        // ACCENT — Antique Gold (badge, highlight, active state)
        accent: {
          DEFAULT: '#C8830A',
          50:  '#FEF7E6',
          100: '#FDECC0',
          200: '#FAD882',
          300: '#F7C344',
          400: '#E8A80E',
          500: '#C8830A',
          600: '#A36508',
          700: '#7D4C06',
          800: '#573304',
          900: '#311B02',
        },
        // SURFACE — Warm Ivory (background, card surface)
        surface: {
          DEFAULT: '#F4F5F9',
          50:  '#FFFFFF',
          100: '#F9FAFC',
          200: '#F4F5F9',
          300: '#E8EAF2',
          400: '#D5D9E8',
          500: '#B8BECE',
          600: '#8892A8',
          700: '#5A6478',
          800: '#2D3448',
          900: '#1C2233',
        },
        // STATUS COLORS (disesuaikan palet formal)
        success: {
          DEFAULT: '#1A6B4A',
          light: '#EAF5EF',
          text: '#145C3E',
        },
        warning: {
          DEFAULT: '#B07400',
          light: '#FEF5E4',
          text: '#8F5F00',
        },
        danger: {
          DEFAULT: '#8B1A1A',
          light: '#FBECEC',
          text: '#721414',
        },
        info: {
          DEFAULT: '#1A4A6B',
          light: '#EAF0F5',
          text: '#14395A',
        },
      },
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // TIPOGRAFI — Plus Jakarta Sans (heading) + Inter (body)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // GOLDEN RATIO SPACING — Base 8px unit, rasio φ = 1.618
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      spacing: {
        '4.5':  '1.125rem',
        '13':   '3.25rem',
        '18':   '4.5rem',
        'sidebar': '16rem',    // 256px — sidebar width
        'navbar': '3.75rem',   // 60px  — navbar height
      },
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SHADOWS — Premium layered shadows
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      boxShadow: {
        'card':    '0 1px 3px 0 rgba(28,34,51,0.08), 0 1px 2px -1px rgba(28,34,51,0.04)',
        'card-md': '0 4px 6px -1px rgba(28,34,51,0.08), 0 2px 4px -2px rgba(28,34,51,0.04)',
        'card-lg': '0 10px 15px -3px rgba(28,34,51,0.10), 0 4px 6px -4px rgba(28,34,51,0.06)',
        'card-xl': '0 20px 25px -5px rgba(28,34,51,0.12), 0 8px 10px -6px rgba(28,34,51,0.06)',
        'primary': '0 4px 14px 0 rgba(26,58,107,0.30)',
        'accent':  '0 4px 14px 0 rgba(200,131,10,0.30)',
        'inset':   'inset 0 2px 4px 0 rgba(28,34,51,0.06)',
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1A3A6B 0%, #0E2140 100%)',
        'gradient-accent':  'linear-gradient(135deg, #E8A80E 0%, #C8830A 100%)',
        'gradient-surface': 'linear-gradient(135deg, #F9FAFC 0%, #F4F5F9 100%)',
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
      },
      animation: {
        'fade-in':       'fadeIn 0.3s ease-out',
        'slide-up':      'slideUp 0.35s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-soft':    'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

