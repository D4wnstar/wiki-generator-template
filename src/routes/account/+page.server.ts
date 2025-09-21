import { error, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { API } from '$lib/api'

export const load = (async ({ locals: { user }, fetch, parent }) => {
	const layoutData = await parent()
	if (!layoutData.settings.allow_logins) error(403, 'This wiki does not allow user accounts.')
	if (!user) redirect(303, '/login')

	// Get secret pages to make a list for the user
	const secretPages = await API.secretPages(fetch)

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
