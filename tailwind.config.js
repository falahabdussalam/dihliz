/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './features/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {

      colors: {
        'primary': '#289942',
        dihliz:{

          50: '#efe7ea',
          100: '#ceb7c0',
          200: '#bd9fab',
          300: '#8c566c',
          400: '#6b2642',
          500:'#289942',
          600:'#207a35',
          700:'#400a1f',
          800:'#2e0717',
          900:'#240612',
        },
        lime:{

          50: '#f3f9ec',
          100: '#ceb7c0',
          200: '#bd9fab',
          300: '#8c566c',
          400: '#6b2642',
          500:'#83C143',
          600:'#699a36',
          700:'#400a1f',
          800:'#2e0717',
          900:'#240612',
        },
        pale:{

          50: '#fff6f2',
          100: '#ffdccd',
          200: '#ffc1a7',
          300: '#ffb99a',
          400: '#ffb08e',
          500:'#ffa781',
          600:'#e69674',
          700:'#cc8667',
          800:'#b3755a',
          900:'#99644d',
        }
      }
    },
  },
  plugins: [require("daisyui")],
    daisyui: {
    themes: [
      {
        dihlizTheme: {
          primary: "#289942",
          secondary: "#83C143",
          accent: "#37cdbe",
          neutral: "#3d4451",
          "base-100": "#ffffff",
        },
      },
   
    ],
  }
}
