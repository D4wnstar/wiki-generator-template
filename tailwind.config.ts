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
			pattern: /preset-filled-\w+-\d+-\d+/
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
		'blockquote',
		'table-cell',
		'code',
		// For lists
		'list-outside',
		'list-disc',
		'list-decimal',
		'pl-4',
		'space-y-1',
		'text-surface-600-400',
		'checkbox'
	]
} satisfies Config
