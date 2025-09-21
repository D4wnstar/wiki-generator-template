import { notes } from '$lib/schema'
import { and, eq, isNull } from 'drizzle-orm'
import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ locals: { db } }) => {
	// let authorized
	// if (user) {
	// 	authorized = or(isNull(notes.allowed_users), getAllowedUsersFilter(user.username, 'notes'))
	// } else {
	// 	authorized = isNull(notes.allowed_users)
	// }

	const pages = await db
		.select({
			title: notes.title,
			route: notes.route,
			path: notes.path,
			search_terms: notes.search_terms
		})
		.from(notes)
		.where(and(eq(notes.frontpage, false), isNull(notes.allowed_users)))

	return json(pages, {
		headers: {
			'cache-control': 'public, max-age=21600',
			vary: 'cookie'
		}
	})
}
