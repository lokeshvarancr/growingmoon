import type { Config } from "tailwindcss";

const rgb = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const warmGray = {
  50: "#FAF7F1",
  100: "#F3EEE5",
  200: "#E7E0D4",
  300: "#D4CBBC",
  400: "#A79E90",
  500: "#7B7468",
  600: "#5E584F",
  700: "#46413A",
  800: "#2D2A26",
  900: "#1A1917",
  950: "#100F0E",
};

const ember = {
  50: "#FDF3EE",
  100: "#FBE4D8",
  200: "#F6C6AF",
  300: "#F0A281",
  400: "#E97A52",
  500: "#E2552C",
  600: "#C9431D",
  700: "#A63418",
  800: "#842B17",
  900: "#6B2516",
  950: "#3A1008",
};

const config: Config = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: warmGray,
        slate: warmGray,
        indigo: ember,
        purple: ember,
        violet: ember,
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
          accent:         rgb("--gm-accent-rgb"),
          "accent-deep":  rgb("--gm-accent-deep-rgb"),
          "accent-soft":  rgb("--gm-accent-soft-rgb"),
          "accent-line":  rgb("--gm-accent-line-rgb"),
          ink:            rgb("--gm-ink-rgb"),
          paper:          rgb("--gm-paper-rgb"),
          moss:           rgb("--gm-moss-rgb"),
          surface:        rgb("--gm-surface-rgb"),
        },
      },
      fontFamily: {
        sans: ["var(--font-text)", "ui-sans-serif", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1.1rem",
        "3xl": "1.6rem",
      },
      boxShadow: {
        "card": "0 1px 0 0 rgba(26, 25, 23, 0.04), 0 10px 30px -18px rgba(26, 25, 23, 0.18)",
        "card-hover": "0 1px 0 0 rgba(26, 25, 23, 0.05), 0 24px 48px -24px rgba(26, 25, 23, 0.28)",
        "modal": "0 40px 80px -30px rgba(26, 25, 23, 0.45)",
        "float": "0 18px 50px -20px rgba(26, 25, 23, 0.35), 0 2px 6px -2px rgba(26, 25, 23, 0.08)",
        "xs": "0 1px 2px 0 rgba(26, 25, 23, 0.05)",
        "2xs": "0 1px 1px 0 rgba(26, 25, 23, 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-up": "slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-in-right": "slideInRight 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "shimmer": "shimmer 1.6s ease-in-out infinite",
        "moon-wax": "moonWax 2.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(18px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        moonWax: {
          "0%, 100%": { transform: "translateX(-55%)" },
          "50%": { transform: "translateX(55%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
