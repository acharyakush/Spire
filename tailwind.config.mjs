/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./dialogs/**/*.{js,ts,jsx,tsx,mdx}",
		"./modals/**/*.{js,ts,jsx,tsx,mdx}",
		"./modules/**/*.{js,ts,jsx,tsx,mdx}",
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {},
	},
	plugins: [],
};
