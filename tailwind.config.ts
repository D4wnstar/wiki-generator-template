import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'
import { contentPath, skeleton } from '@skeletonlabs/skeleton/plugin'
import cosmos from './static/themes/cosmos'

export default {
	content: ['./src/**/*.{html,js,svelte,ts}', contentPath(import.meta.url, 'svelte')],
	theme: {
		extend: {}
	},
	darkMode: 'selector',
	plugins: [
		forms,
		typography,
		skeleton({
			themes: [cosmos]
		})
	],

	safelist: [
		{
			pattern: /h[1-6]/
		},
		{
			pattern: /preset-filled-(primary|secondary|tertiary)-600-400/
		},
		{
			pattern: /preset-filled-(primary|secondary|tertiary)-400-600/
		},
		{
			pattern: /preset-filled-(primary|secondary|tertiary)-200-800/
		},
		'code-highlight',
		'code-line',
		'inserted',
		'deleted',
		'highlight-line',
		'line-number',
		'callout',
		'callout-title',
		'callout-title-inner',
		'callout-icon',
		'callout-collapsible',
		'break-words',
		{
			pattern: /pl-(3|6|9|12|15|18)/
		}
	]
} satisfies Config
