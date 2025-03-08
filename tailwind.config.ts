/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  "./pages/**/*.{ts,tsx}",
	  "./components/**/*.{ts,tsx}",
	  "./app/**/*.{ts,tsx}",
	  "./src/**/*.{ts,tsx}",
	  "*.{js,ts,jsx,tsx,mdx}",
	],
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
		  strawberry: {
			50: "#fff0f3",
			100: "#ffe2e8",
			200: "#ffcad5",
			300: "#ff9fb0",
			400: "#ff6683",
			500: "#ff3358",
			600: "#ff0a38",
			700: "#db0026",
			800: "#b50026",
			900: "#960026",
		  },
		  cream: {
			50: "#fffbf0",
			100: "#fff6dc",
			200: "#ffeab8",
			300: "#ffda8a",
			400: "#ffc04f",
			500: "#ffa726",
			600: "#ff8c0a",
			700: "#cc6a00",
			800: "#a35400",
			900: "#854600",
		  },
		  crust: {
			50: "#faf6f2",
			100: "#f2e9df",
			200: "#e6d4c0",
			300: "#d8ba9a",
			400: "#c79c73",
			500: "#bb8656",
			600: "#a66c45",
			700: "#8a563a",
			800: "#724733",
			900: "#603c2d",
		  },
		},
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
		keyframes: {
		  "accordion-down": {
			from: { height: 0 },
			to: { height: "var(--radix-accordion-content-height)" },
		  },
		  "accordion-up": {
			from: { height: "var(--radix-accordion-content-height)" },
			to: { height: 0 },
		  },
		},
		animation: {
		  "accordion-down": "accordion-down 0.2s ease-out",
		  "accordion-up": "accordion-up 0.2s ease-out",
		},
		backgroundImage: {
		  'tart-pattern': "url('/tart-pattern.svg')",
		},
	  },
	},
	plugins: [require("tailwindcss-animate")],
  }