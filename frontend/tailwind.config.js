/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4169E1",
          dark: "#314fb3",
          light: "#6687eb",
          darker: "#243a8a",
          gold: "#f5c842",
        },
        slate: {
          850: "#1e293b",
          950: "#0f172a",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["DM Mono", "Monaco", "Menlo", "Ubuntu Mono", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        in: "in 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-in-from-bottom-4": "slideInFromBottom 0.4s ease-out",
      },
      keyframes: {
        in: {
          "0%": { opacity: "0", transform: "scale(0.95) translateY(10px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInFromBottom: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
