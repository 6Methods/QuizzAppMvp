import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#5E72A8",
          dark: "#4A5B8A",
          light: "#EBEFF8",
        },
        "app-bg": "#DDE2F0",
        "body-text": "#2D3142",
        "body-muted": "#858AA0",
        "green-soft": "#E8F5E9",
        "green-bold": "#2E7D32",
        "purple-soft": "#F3E5F5",
        "purple-bold": "#7B1FA2",
        "yellow-soft": "#FFF9C4",
        "yellow-bold": "#FBC02D",
        "coral-soft": "#FFEBEE",
        "coral-bold": "#D32F2F",
      },
      borderRadius: {
        "q-sm": "12px",
        "q-md": "20px",
        "q-lg": "32px",
        "q-xl": "40px",
        pill: "100px",
      },
      boxShadow: {
        soft: "0 8px 24px -6px rgba(94, 114, 168, 0.12)",
        hover: "0 16px 32px -8px rgba(94, 114, 168, 0.18)",
        card: "0 2px 12px rgba(94, 114, 168, 0.06)",
        "btn-primary": "0 10px 20px -5px rgba(94, 114, 168, 0.4)",
        "btn-primary-hover": "0 15px 30px -5px rgba(94, 114, 168, 0.5)",
      },
      transitionTimingFunction: {
        quiz: "cubic-bezier(0.25, 0.8, 0.25, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
