/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#f5f5f5',
        surface: '#ffffff',
        'surface-hover': '#f2f3f5',
        primary: '#4e6ef2',
        'primary-hover': '#3d5bd6',
        'primary-light': '#edf1ff',
        'primary-bg': '#e8f0fe',
        'text-primary': '#1d2129',
        'text-secondary': '#4e5969',
        'text-tertiary': '#86909c',
        'text-placeholder': '#c9cdd4',
        border: '#e5e6eb',
        'border-light': '#f2f3f5',
        danger: '#f53f3f',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
