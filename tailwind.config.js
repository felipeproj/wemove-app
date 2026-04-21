/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        // Fundo — branco com toque levíssimo de azul
        bg: {
          DEFAULT: '#F4F6FF',
          2:       '#EEF0FB',
          3:       '#FFFFFF',
        },
        // Cards
        card: {
          DEFAULT: '#FFFFFF',
          2:       '#F8F9FF',
          3:       '#EEF0FB',
        },
        // Bordas suaves
        border: {
          DEFAULT: '#E2E6F4',
          2:       '#C8CEEA',
        },
        // Texto
        ink: {
          DEFAULT: '#1A1B2E',  // título/corpo
          2:       '#4B4F6B',  // secundário
          3:       '#9396B0',  // muted
        },
        // Marca WeMove
        wm: {
          blue:    '#3B82F6',
          blue2:   '#60A5FA',
          purple:  '#8B5CF6',
          pink:    '#EC4899',
          pink2:   '#F472B6',
          green:   '#10B981',
          amber:   '#F59E0B',
          red:     '#EF4444',
        },
      },
      boxShadow: {
        card:  '0 1px 4px 0 rgba(59,80,180,0.07), 0 0 0 1px rgba(59,80,180,0.05)',
        modal: '0 8px 40px 0 rgba(59,80,180,0.15)',
        btn:   '0 2px 8px 0 rgba(59,130,246,0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 1.2s ease-in-out infinite',
        'toast-in':   'toastIn 0.25s ease',
        'fade-in':    'fadeIn 0.2s ease',
      },
      keyframes: {
        toastIn: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
