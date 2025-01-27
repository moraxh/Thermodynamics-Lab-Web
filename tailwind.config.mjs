/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'background': '#010101',
				'text': '#FFFFFF',
				'primary': '#2E3192',
				'accent': '#F6C308',
				'gray0': '#161A25',
				'gray1': '#272D39',
				'gray2': '#444B53',
				'gray3': '#7B848D',
			},
			fontFamily: {
				sans: ['lato', 'sans-serif'],
				serif: ['montserrat', 'serif'],
			}
		},
	},
	plugins: [],
}