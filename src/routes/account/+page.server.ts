import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { NoteMeta } from '$lib/notes'

export const load = (async ({ locals: { user }, fetch }) => {
	if (!user) redirect(303, '/login')

	const res = await fetch('/api/v1/auth/secret-pages')
	const secretPages = (await res.json()) as NoteMeta[]
	return { user, secretPages }
}) satisfies PageServerLoad

export const actions = {
	logout: async ({ cookies, locals }) => {
		cookies.delete('authToken', {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax'
		})
		locals.user = null

		return { message: 'Logged out successfully', success: true }
	}
} satisfies Actions

export const prerender = false
