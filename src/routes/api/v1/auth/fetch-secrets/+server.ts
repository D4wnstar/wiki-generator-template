import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { notes } from '$lib/schema'
import { getAllowedUsersFilter } from '$lib/utils'

/**
 * Get all pages marked as secret that the user is allowed to see.
 */
export const GET: RequestHandler = async ({ locals: { db, user } }) => {
	if (!user) {
		return json({ message: 'No user is logged in' })
	}

	const conditionPages = getAllowedUsersFilter(user.username, 'notes')

	const pages = await db.select().from(notes).where(conditionPages)

	return json(pages, {
		headers: {
			'cache-control': 'public, max-age=21600',
			vary: 'cookie'
		}
	})
}
