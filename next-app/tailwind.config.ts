import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-subtle": "var(--muted-subtle)",
        border: "var(--border)",
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--gold-light)",
          dark: "var(--gold-dark)",
        },
        vibe: {
          DEFAULT: "var(--vibe)",
          light: "var(--vibe-light)",
          dark: "var(--vibe-dark)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          overlay: "var(--surface-overlay)",
          card: "var(--surface-card)",
        },
      },
      fontFamily: {
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        body: ["var(--font-figtree)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 20px color-mix(in srgb, var(--gold) 25%, transparent)",
        vibe: "0 0 24px color-mix(in srgb, var(--vibe) 35%, transparent)",
        "vibe-sm": "0 0 12px color-mix(in srgb, var(--vibe) 20%, transparent)",
      },
      backgroundImage: {
        "gold-metallic":
          "linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 45%, var(--gold-dark) 100%)",
        "vibe-wave":
          "linear-gradient(90deg, var(--gold) 0%, var(--vibe) 50%, var(--vibe-light) 100%)",
        "dark-radial":
          "radial-gradient(ellipse at top, color-mix(in srgb, var(--gold) 8%, transparent) 0%, transparent 50%), radial-gradient(ellipse at bottom, color-mix(in srgb, var(--vibe) 6%, transparent) 0%, transparent 45%)",
      },
    },
  },
  plugins: [],
};

export default config;
