/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:   '#1B2F5E',
        teal:   '#1A7F8E',
        orange: '#E8630A',
        gold:   '#F5A623',
        green:  '#4CAF50',
        light:  '#F0F6FA',
        text:   '#1A1A2E',
        muted:  '#6B7280',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        accent:  ['"Oswald"', 'Impact', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
