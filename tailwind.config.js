/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        bangers: ['Bangers', 'cursive'],
        comic: ['"Comic Neue"', 'cursive']
      },
      colors: {
        comic: {
          yellow: '#FFD23F',
          red: '#EE4266',
          blue: '#3BCEAC',
          dark: '#0D1B2A',
          paper: '#FFF8E7'
        }
      },
      boxShadow: {
        comic: '6px 6px 0 0 #000',
        comicLg: '10px 10px 0 0 #000'
      },
      keyframes: {
        popIn: {
          '0%': { transform: 'scale(0) rotate(-15deg)', opacity: '0' },
          '60%': { transform: 'scale(1.1) rotate(2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        }
      },
      animation: {
        popIn: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        wiggle: 'wiggle 0.6s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
