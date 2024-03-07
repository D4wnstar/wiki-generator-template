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
		'max-w-px',
		{
			pattern: /max-w-\d+(\.\d+)?/,
		},
		'mx-auto',
		'pl-5',
		'py-2',
		'px-4',
		'pb-2',
		'space-y-2',
		'indent-cascade',
		'flex',

		'anchor',
		'card',
		'blockquote',
		'list-disc',
		'list-decimal',
		'list-inside',
		'code',
		'codeblock-base',
		'codeblock-header',
		'codeblock-pre',
		'callout-primary',
		'callout-secondary',
		'callout-tertiary',
		'callout-success',
		'callout-warning',
		'callout-error',
		'callout-surface',
		'popup',
		'task-checkbox',

		'text-center',
		'not-italic',
		'line-through',
		'text-surface-700-200-token',
		'bg-tertiary-50-900-token',
		'text-slate-500',

		'stroke-primary-400',
		'stroke-secondary-400',
		'stroke-tertiary-400',
		'stroke-success-400',
		'stroke-warning-400',
		'stroke-error-400',
		'stroke-surface-400',
		'variant-outline-surface',
	]
} satisfies Config
