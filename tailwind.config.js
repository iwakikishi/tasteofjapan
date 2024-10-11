/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class', // これをthemeの外に移動
  theme: {
    extend: {
      fontFamily: {
        DMSans: ['DMSans', 'sans-serif'],
        DMSansItalic: ['DMSansItalic', 'sans-serif'],
        NotoSans: ['NotoSans', 'sans-serif'],
        NotoSansBold: ['NotoSansBold', 'sans-serif'],
        NotoSandsItalic: ['NotoSandsItalic', 'sans-serif'],
      },
      colors: {
        light: {
          background: '#ffffff',
          text: '#000000',
        },
        dark: {
          background: '#010511',
          text: '#ffffff',
        },
      },
      textShadow: {
        text: '2px 2px 4px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.shadow-text': {
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
