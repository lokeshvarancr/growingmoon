import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gm: {
          midnight:       "var(--gm-midnight)",
          lavender:       "var(--gm-lavender)",
          ivory:          "var(--gm-ivory)",
          white:          "var(--gm-white)",
          mist:           "var(--gm-mist)",
          mint:           "var(--gm-mint)",
          indigo:         "var(--gm-indigo)",
          "indigo-hover": "var(--gm-indigo-hover)",
          "lavender-soft":"var(--gm-lavender-soft)",
          "text-secondary":"var(--gm-text-secondary)",
          success:        "var(--gm-success)",
          border:         "var(--gm-border)",
          danger:         "var(--gm-danger)",
          warning:        "var(--gm-warning)",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "Plus Jakarta Sans", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgba(23, 26, 46, 0.04), 0 1px 2px -1px rgba(23, 26, 46, 0.03)",
        "card-hover": "0 4px 12px -2px rgba(23, 26, 46, 0.08), 0 2px 6px -2px rgba(23, 26, 46, 0.04)",
        "modal": "0 16px 48px -8px rgba(23, 26, 46, 0.16)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.25s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
