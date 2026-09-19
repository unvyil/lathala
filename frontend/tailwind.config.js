export default {
  content: ['./**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        onyx: '#070D0D',
        espresso: '#302E2F',
        sandbar: '#DBD6D0',
        parchment: '#F1EEE9',
        base: '#F2F2F2',
        accent: '#0062FF',
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        artboard: '0 24px 60px -18px rgba(7, 13, 13, 0.28)',
        panel: '0 1px 2px rgba(7, 13, 13, 0.06)',
      },
    },
  },
  plugins: [],
}
