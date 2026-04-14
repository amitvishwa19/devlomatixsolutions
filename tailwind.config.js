/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssTypography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      // fontFamily: {
      //   sans: ["DM Sans", "system-ui", "sans-serif"],
      // },

      borderRadius: {
        lg: '10px',
        md: '6px',
        sm: '4px'
      },
      colors: {
        darkPrimaryBackground: '#0E141B',
        darkSecondaryBackground: '#171F26',
        darkFocusColor: '#1C2736',
        darkfocus: '#181716',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        darkbackground: '#0C0E12',
        darkcontent: '#111318',
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
        card2: {
          DEFAULT: "hsl(var(--card2))",
          foreground: "hsl(var(--card-foreground2))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        healthcare: {
          blue: "hsl(var(--healthcare-blue))",
          light: "hsl(var(--healthcare-light))",
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
        "n8n-success": "hsl(var(--n8n-success))",
        "n8n-warning": "hsl(var(--n8n-warning))",
        "n8n-sidebar": {
          bg: "hsl(var(--n8n-sidebar-bg))",
          fg: "hsl(var(--n8n-sidebar-fg))",
          active: "hsl(var(--n8n-sidebar-active))",
          hover: "hsl(var(--n8n-sidebar-hover))",
        },
        "n8n-canvas": {
          bg: "hsl(var(--n8n-canvas-bg))",
          dot: "hsl(var(--n8n-canvas-dot))",
        },
        "n8n-node": {
          bg: "hsl(var(--n8n-node-bg))",
          border: "hsl(var(--n8n-node-border))",
          shadow: "hsl(var(--n8n-node-shadow))",
        },
        "n8n-header": {
          bg: "hsl(var(--n8n-header-bg))",
          border: "hsl(var(--n8n-header-border))",
        },
        "n8n-connection": "hsl(var(--n8n-connection))",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
      },
      fontSize: {
        'sm': '14px', // Overrides the default text-sm (0.875rem) to 1rem
        'custom-small': '0.75rem', // Adds a new custom size
      }
    }
  },
  plugins: [tailwindcssAnimate, tailwindcssTypography],
}
