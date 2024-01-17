import { join } from 'path'
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'
import { skeleton } from '@skeletonlabs/tw-plugin'
import { starry } from './themes/starry-theme'

export default {
	darkMode: 'class',
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
				custom: [starry],
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
		{
			pattern: /w-\d+(\.\d+)?/,
		},
		'blockquote',
		'list-disc',
		'list-decimal',
		'indent-cascade',
		'pl-5',
		'stroke-primary-400',
		'stroke-secondary-400',
		'stroke-tertiary-400',
		'stroke-success-400',
		'stroke-warning-400',
		'stroke-error-400',
		'stroke-surface-400',
		'codeblock-base',
		'codeblock-header',
		'codeblock-pre',
	]
} satisfies Config
