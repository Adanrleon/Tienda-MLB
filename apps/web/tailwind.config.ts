import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        mlb: {
          navy: '#002D72',
          red: '#E31937',
          blue: '#041E42',
        },
        premium: {
          gold: '#C5A963',
          slate: '#0F172A',
          cream: '#F8FAFC',
        },
        ink: '#0F172A',
        cream: '#F8FAFC',
        diamond: '#FFFFFF',
        seam: '#E31937',
        dugout: '#002D72',
        scoreboard: '#0F172A',
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        sans: ['var(--font-manrope)', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 20px 50px rgba(0, 45, 114, 0.1)',
        'luxury-hover': '0 30px 60px rgba(0, 45, 114, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
