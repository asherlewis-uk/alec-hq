import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.12)',
          dark: 'rgba(0, 0, 0, 0.25)',
        },
        accent: '#FF6B00',
      },
      backdropFilter: {
        'glass': 'blur(24px) saturate(180%)',
      },
      borderRadius: {
        'glass': '20px',
        'glass-lg': '28px',
      },
    },
  },
  plugins: [],
}

export default config