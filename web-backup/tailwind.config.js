/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary theme color - rgba(23, 133, 209, 1) = #1785d1
          primary: '#1785d1',
          // Secondary theme color - rgba(27, 188, 230, 1) = #1bbce6
          secondary: '#1bbce6',
          // Background - rgba(20, 20, 20, 1) = #141414
          background: '#141414',
          // Background inverse - rgb(245, 245, 245) = #f5f5f5
          backgroundInverse: '#f5f5f5',
          // Text - rgba(248, 248, 248, 1) = #f8f8f8
          text: '#f8f8f8',
          // Text grey - rgba(141, 141, 141, 1) = #8d8d8d
          textGrey: '#8d8d8d',
          // Input field background - rgba(29, 29, 29, 1) = #1d1d1d
          inputBackground: '#1d1d1d',
          // Placeholder text - rgba(146, 146, 146, 1) = #929292
          placeholder: '#929292',
          // Dark blue - rgba(24, 72, 127, 1) = #18487f
          darkBlue: '#18487f',
          // Disabled - rgba(210, 210, 210, 1) = #d2d2d2
          disabled: '#d2d2d2',
          // Error/red - rgba(255, 0, 0, 1) = #ff0000
          error: '#ff0000',
          // Orange gradient start - rgba(188, 75, 0, 0.74)
          gradientOrange: 'rgba(188, 75, 0, 0.74)',
          // Purple gradient - rgba(69, 42, 124, 0.1)
          gradientPurple: 'rgba(69, 42, 124, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        nunito: ['Nunito', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};
