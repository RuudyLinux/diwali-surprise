/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ivory: '#FFF8ED',
        cream: '#FFFCF6',
        gold: { DEFAULT: '#D6AD62', light: '#E8C785', dark: '#B38B39' },
        saffron: '#E8A13A',
        marigold: '#F3A52F',
        rose: { DEFAULT: '#DFA5A0', soft: '#F5D3D0' },
        wine: '#633B48',
        warmbrown: '#382A2B',
        flame: { DEFAULT: '#E8A13A', dark: '#B38B39' },
        parchment: { DEFAULT: '#FFF8ED', dim: '#F3E5D0' },
        void: { DEFAULT: '#382A2B', mid: '#633B48', deep: '#211516' },
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 5s ease-in-out infinite alternate',
        'flicker': 'flicker 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 1.2s ease forwards',
        'slide-up': 'slideUp 0.8s ease forwards',
      },
      keyframes: {
        float: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-10px)' } },
        flicker: {
          '0%, 100%': { opacity: '0.92', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '75%': { opacity: '0.88', transform: 'scale(0.98)' },
        },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
