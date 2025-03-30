/** @type {import('tailwindcss').Config} */
export default {
  // Content is automatically detected in v4.0
  darkMode: 'class', // Enable dark mode by default
  theme: {
    extend: {
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px', // Max width supported is 1280px as per requirements
        },
      },
    },
  },
  plugins: []
}
