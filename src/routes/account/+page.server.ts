import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load = (async ({ locals: { user } }) => {
	if (!user) {
		redirect(303, '/login')
	}
	return {}
}) satisfies PageServerLoad

export const actions = {
	logout: async ({ cookies, locals }) => {
		cookies.delete('authToken', {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict'
		})
		locals.user = null

		return { message: 'Logged out successfully', success: true }
	}
} satisfies Actions
