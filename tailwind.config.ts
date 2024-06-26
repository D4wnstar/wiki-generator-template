import { join } from 'path'
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'
import { skeleton } from '@skeletonlabs/tw-plugin'
import { cosmos } from './themes/cosmos'

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {}
	},
	plugins: [
		forms,
		typography,
		skeleton({
			themes: {
				custom: [cosmos],
				preset: [
					{
						name: 'skeleton',
						enhancements: true
					},
					{
						name: 'wintry',
						enhancements: true
					},
					{
						name: 'modern',
						enhancements: true
					},
					{
						name: 'rocket',
						enhancements: true
					},
					{
						name: 'seafoam',
						enhancements: true
					},
					{
						name: 'vintage',
						enhancements: true
					},
					{
						name: 'sahara',
						enhancements: true
					},
					{
						name: 'hamlindigo',
						enhancements: true
					},
					{
						name: 'gold-nouveau',
						enhancements: true
					},
					{
						name: 'crimson',
						enhancements: true
					}
				]
			}
		})
	],
	safelist: [
		'w-px',
		{ pattern: /w-\d+(\.\d+)?/ },
		'mx-auto',
		'pl-5',
		'py-2',
		'px-4',
		'pb-2',
		'space-y-2',
		'flex',

		'anchor',
		'card',
		'blockquote',
		'list-disc',
		'list-decimal',
		'code',
		'popup',

		'text-center',
		'not-italic',
		'line-through',
		'text-surface-700-200-token',
		'bg-tertiary-50-900-token',
		'text-slate-500',
		'border',
		'border-collapse',
		'border-surface-400-500-token',

		{ pattern: /stroke-(primary|secondary|tertiary|success|warning|error|surface)-400/ },
		{ pattern: /variant-soft-.+/ },
		'variant-outline-surface'
	]
} satisfies Config
