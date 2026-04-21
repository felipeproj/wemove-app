/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#0A0A0F',
          2: '#111118',
          3: '#16161F',
        },
        card: {
          DEFAULT: '#1A1A24',
          2: '#1F1F2C',
          3: '#242433',
        },
        border: {
          DEFAULT: '#2A2A3C',
          2: '#333348',
        },
        wm: {
          blue: '#3B82F6',
          blue2: '#60A5FA',
          pink: '#EC4899',
          pink2: '#F472B6',
          purple: '#8B5CF6',
          green: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
        },
      },
      animation: {
        'pulse-slow': 'pulse 1.2s ease-in-out infinite',
        'toast-in': 'toastIn 0.25s ease',
      },
      keyframes: {
        toastIn: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
