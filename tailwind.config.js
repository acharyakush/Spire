/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./pages/**/*.{js,ts,jsx,tsx,mdx}"],
	corePlugins: {
		// Remove the Tailwind CSS preflight styles so it can use Material UI's preflight instead (CssBaseline).
		preflight: false,
	},
	darkMode: "class",
	plugins: [],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
			},
		},
	},
};
