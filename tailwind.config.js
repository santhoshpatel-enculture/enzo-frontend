/** @type {import('tailwindcss').Config} */
/** Ezo tokens — see stitch/ezo/DESIGN.md and src/index.css @theme */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#f9f9fb',
        'surface-container': '#edeef0',
        'surface-container-low': '#f3f3f5',
        'surface-container-high': '#e8e8ea',
        'surface-container-lowest': '#ffffff',
        'surface-variant': '#e2e2e4',
        'on-surface': '#1a1c1d',
        'on-surface-variant': '#464554',
        'inverse-surface': '#2f3132',
        'inverse-on-surface': '#f0f0f2',
        outline: '#767586',
        'outline-variant': '#c7c4d7',
        primary: '#4648d4',
        'on-primary': '#ffffff',
        'primary-container': '#6063ee',
        'inverse-primary': '#c0c1ff',
        secondary: '#674bb5',
        'secondary-container': '#ab8ffe',
        tertiary: '#006c49',
        'tertiary-container': '#00885d',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        background: '#f9f9fb',
      },
      maxWidth: {
        'container-max': '1200px',
      },
      spacing: {
        'margin-mobile': '16px',
        gutter: '24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        headline: ['Geist', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        ezo: '1rem',
        'ezo-lg': '1.5rem',
      },
    },
  },
  plugins: [],
};
