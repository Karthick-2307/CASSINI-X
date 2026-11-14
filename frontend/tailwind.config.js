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
        canvas: "#030712",
        panel: "#0f172a",
        raised: "#1e293b",
        border: "rgba(255, 255, 255, 0.12)",
        "text-primary": "#F8FAFC",
        "text-muted": "#94A3B8",
        "accent-cyan": "#38BDF8",
        "accent-blue": "#60A5FA",
        "accent-violet": "#A78BFA",
        "status-ok": "#34D399",
        "status-warn": "#FBBF24",
        "status-bad": "#F87171",
        "status-danger": "#F87171",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
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
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
        panel: "0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 2px 6px -1px rgba(0, 0, 0, 0.5)",
        card: "0 10px 30px -5px rgba(0, 0, 0, 0.8)",
        globe: "0 10px 35px -5px rgba(56, 189, 248, 0.3), 0 8px 15px -6px rgba(59, 130, 246, 0.25)",
        glow: "0 0 25px -4px rgba(56, 189, 248, 0.35)",
        "glow-blue": "0 0 25px -4px rgba(59, 130, 246, 0.35)",
      },
    },
  },
  plugins: [],
}
