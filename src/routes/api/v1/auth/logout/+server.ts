import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ cookies, locals }) => {
	cookies.delete('authToken', {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict'
	})
	locals.user = null

	return json({ message: 'Logged out successfully' })
}
