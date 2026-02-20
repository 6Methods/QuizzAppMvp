import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EEF0FF",
          100: "#E0E4FF",
          200: "#C7CDFE",
          300: "#A3ADFB",
          400: "#7D8AF8",
          500: "#5664F5",
          600: "#3D4BDB",
          700: "#2F3AB8",
          800: "#283295",
          900: "#252E76",
        },
        ink: {
          DEFAULT: "#293250",
          dark: "#1E2336",
          light: "#4D5B8C",
        },
        page: "#F4F6F9",
        success: {
          DEFAULT: "#4CD964",
          soft: "#E8F9EB",
        },
        error: {
          DEFAULT: "#FF3B30",
          soft: "#FFEBEC",
        },
        coral: "#FF9F5A",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 12px 40px rgba(41, 50, 80, 0.08)",
        float: "0 8px 24px rgba(86, 100, 245, 0.25)",
        "float-lg": "0 12px 28px rgba(86, 100, 245, 0.35)",
        soft: "0 4px 12px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
};

export default config;
