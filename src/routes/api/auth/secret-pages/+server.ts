import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { notes } from '$lib/schema'
import { getAllowedUsersFilter } from '$lib/utils'
import { and, eq } from 'drizzle-orm'

/**
 * Get all pages marked as secret that the user is allowed to see.
 */
export const GET: RequestHandler = async ({ locals: { db, user } }) => {
	if (!user) return json([])

	const authorized = getAllowedUsersFilter(user.username, 'notes')

	const pages = await db
		.select({
			title: notes.title,
			route: notes.route,
			path: notes.path,
			search_terms: notes.search_terms
		})
		.from(notes)
		.where(and(eq(notes.frontpage, false), authorized))

	return json(pages, {
		headers: {
			'cache-control': 'public, max-age=21600',
			vary: 'cookie'
		}
	})
}
