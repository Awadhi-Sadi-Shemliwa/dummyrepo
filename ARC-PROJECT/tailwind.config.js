/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    safelist: [
      'animate-float',
      'animate-float-slow',
      'animate-drift',
      'animate-glow',
    ],
    theme: {
      extend: {
        fontFamily: {
          cursive: ['Great Vibes', 'cursive'],
        },
        colors: {
          brand: {
            black: '#0B0B0C',
            red: '#C0181F',
            gold: '#B8862B',
            sand: '#F5F1E8',
            slate: '#1F1F23',
          },
          // ARC system colors (aliases for compatibility)
          arc: {
            black: '#0B0B0C',
            red: '#C0181F',
            gold: '#B8862B',
            bronze: '#CD7F32',
            sand: '#F5F1E8',
            white: '#F5F1E8',
            slate: '#1F1F23',
          },
          primary: '#C0181F',
          'primary-dark': '#8F0F15',
          'primary-light': '#E06A6A',
          secondary: '#1F1F23',
          'secondary-light': '#2E2E34',
          text: {
            light: '#F5F1E8',
            dark: '#0B0B0C',
          },
          // User Role Colors
          user: {
            primary: '#03624C',    // Bangladesh Green
            secondary: '#F8FBFF',  // Zircon
            dark: '#042222',       // Rich Black
            accent: '#2CC295',     // Meadow
            highlight: '#00DF82',  // Caribbean Green
            light: '#FFE4D0',      // Snow
          },
          // Admin Role Colors
          admin: {
            primary: '#16151A',    // Dark Void
            secondary: '#F67011',  // Liquid Lova
            dark: '#873800',       // Gloun Lova
            accent: '#262626',     // Slate Grey
            highlight: '#878787',  // Dusty Grey
            light: '#FFE4D0',      // Liquid Lova Light
          },
          // Support Role Colors
          support: {
            primary: '#0F214D',    // College Blue
            secondary: '#0B5FB0',  // Persian Blue
            dark: '#AAF1FF',       // Middle Blue
            accent: '#EFEDCE',     // Yellow Banana
            highlight: '#EBFCFF',  // Morning Blue
            light: '#2BA3EC',      // Picton Blue
          },
          // Common Colors
          BangladeshiGreen: '#03624C',
          emerald: '#024751',
          creamyYellow: '#FFF0B5',
          mint: '#AFF9C7',
          green: '#00D47E',
          crystal: '#EDFFF8',
          pink: {
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
          }
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-12px)' },
          },
          drift: {
            '0%, 100%': { transform: 'translateX(0px)' },
            '50%': { transform: 'translateX(16px)' },
          },
          glow: {
            '0%, 100%': { opacity: '0.45' },
            '50%': { opacity: '0.85' },
          },
        },
        animation: {
          float: 'float 6s ease-in-out infinite',
          'float-slow': 'float 10s ease-in-out infinite',
          drift: 'drift 12s ease-in-out infinite',
          glow: 'glow 4s ease-in-out infinite',
        },
        screens: {
          'xs': '320px',
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1536px',
        },
      },
    },
    plugins: [],
  }
  