/** @type {import('tailwindcss').Config} */
export default {
  // No need for content array in v4 as it's auto-detected
  // Dark mode is enabled by class
  darkMode: 'class',
  theme: {
    extend: {
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
    },
  },
  plugins: []
}
