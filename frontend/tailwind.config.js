/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: "#070B14",
        panel: "#0D1424",
        raised: "#131C31",
        border: "#1F2B45",
        "text-primary": "#E6EDF7",
        "text-muted": "#8B9BB4",
        "accent-cyan": "#22D3EE",
        "accent-blue": "#3B82F6",
        "accent-violet": "#8B5CF6",
        "status-ok": "#34D399",
        "status-warn": "#FBBF24",
        "status-bad": "#F87171",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        panel: "12px",
        btn: "8px",
      },
      transitionDuration: {
        DEFAULT: "200ms",
        fast: "150ms",
        slow: "250ms",
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(34, 211, 238, 0.25)",
        "glow-blue": "0 0 20px -5px rgba(59, 130, 246, 0.25)",
      },
    },
  },
  plugins: [],
}
