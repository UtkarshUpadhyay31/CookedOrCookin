/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        // Theme variables mapped to CSS custom properties
        background: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        cardBg: "var(--bg-card)",
        borderPrimary: "var(--border-primary)",
        textMain: "var(--text-main)",
        textMuted: "var(--text-muted)",
        accentPrimary: "var(--accent-primary)",
        accentGlow: "var(--accent-glow)",
        
        // Static warnings & states
        warning: "#FFC857",
        danger: "#FF4D6D",
      },
      boxShadow: {
        accent: "0 0 20px var(--accent-glow)",
        soft: "0 10px 30px -10px rgba(0, 0, 0, 0.15)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
}
