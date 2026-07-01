/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        space: ["Space Grotesk", "sans-serif"],
        mono: ["IBM Plex Sans", "monospace"],
      },
      colors: {
        background: "#06070A",
        secondary: "#0E1015",
        accent: {
          blue: "#00D4FF",
          purple: "#7B61FF",
          emerald: "#00FFA3",
        },
        warning: "#FFC857",
        danger: "#FF4D6D",
        muted: "#A7AAB8",
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 212, 255, 0.25)",
        purple: "0 0 20px rgba(123, 97, 255, 0.25)",
        emerald: "0 0 20px rgba(0, 255, 163, 0.25)",
      },
    },
  },
  plugins: [],
}
