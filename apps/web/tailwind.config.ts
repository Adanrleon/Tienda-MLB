import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#09111F',
        cream: '#F7F3EB',
        diamond: '#FDFCF9',
        seam: '#D7263D',
        dugout: '#143D7A',
        scoreboard: '#111827',
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        sans: ['var(--font-manrope)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 24px 60px rgba(9, 17, 31, 0.14)',
      },
      backgroundImage: {
        pinstripes:
          'linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 12px)',
      },
    },
  },
  plugins: [],
};

export default config;
