import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Custom breathwork colors
        breath: {
          inhale: "hsl(var(--breath-inhale))",
          hold: "hsl(var(--breath-hold))",
          exhale: "hsl(var(--breath-exhale))",
          glow: "hsl(var(--breath-glow))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "breathe-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        // Breath rhythm visualization keyframes
        "box-pulse": {
          "0%, 100%": { transform: "scale(0.85)", opacity: "0.4" },
          "25%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1)", opacity: "0.6" },
          "75%": { transform: "scale(0.9)", opacity: "0.5" },
        },
        "circle-breathe": {
          "0%": { transform: "scale(0.7)", opacity: "0.3" },
          "40%": { transform: "scale(1)", opacity: "0.8" },
          "60%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(0.7)", opacity: "0.3" },
        },
        "wave-flow": {
          "0%, 100%": { transform: "translateX(0) scaleY(1)" },
          "25%": { transform: "translateX(-5px) scaleY(1.3)" },
          "50%": { transform: "translateX(0) scaleY(1.1)" },
          "75%": { transform: "translateX(5px) scaleY(0.8)" },
        },
        "infinity-trace": {
          "0%": { strokeDashoffset: "200" },
          "100%": { strokeDashoffset: "0" },
        },
        "recommended-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(var(--primary) / 0.15), 0 8px 32px hsl(var(--primary) / 0.1)" 
          },
          "50%": { 
            boxShadow: "0 0 35px hsl(var(--primary) / 0.25), 0 12px 48px hsl(var(--primary) / 0.15)" 
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "breathe-pulse": "breathe-pulse 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "box-pulse": "box-pulse 4s ease-in-out infinite",
        "circle-breathe": "circle-breathe 10s ease-in-out infinite",
        "wave-flow": "wave-flow 6s ease-in-out infinite",
        "infinity-trace": "infinity-trace 8s linear infinite",
        "recommended-glow": "recommended-glow 4s ease-in-out infinite",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
