/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0D0907',
          card: '#161210',
          elevated: '#1E1914',
        },
        border: {
          DEFAULT: '#2A2320',
          hover: '#3A322C',
        },
        text: {
          primary: '#F5EDE6',
          secondary: '#C9B9AA',
          muted: '#7A6C60',
        },
        accent: {
          orange: '#F2994A',
          green: '#6FCF97',
          purple: '#BB6BD9',
          red: '#EB5757',
          blue: '#56CCF2',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
      },
    },
  },
  plugins: [],
};
