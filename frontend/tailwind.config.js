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
        background: "#0B0F17",
        canvas: "#0B0F17",
        surface: "#111826",
        panel: "#111826",
        raised: "#162033",
        border: "#243044",
        primary: "#F8FAFC",
        "text-primary": "#F8FAFC",
        muted: "#94A3B8",
        "text-muted": "#94A3B8",
        accent: "#38BDF8",
        "accent-cyan": "#38BDF8",
        status: {
          ok: "#34D399",
          warn: "#FBBF24",
          error: "#F87171",
          danger: "#F87171",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        heading: ['"Source Serif 4"', "Georgia", "serif"],
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        panel: "8px",
        card: "8px",
        btn: "6px",
      },
      maxWidth: {
        content: "1120px",
      },
      boxShadow: {
        none: "none",
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
}
