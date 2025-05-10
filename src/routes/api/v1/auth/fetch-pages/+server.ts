import { notes } from '$lib/schema'
import { and, eq, isNull, or } from 'drizzle-orm'
import type { RequestHandler } from './$types'
import { getAllowedUsersFilter } from '$lib/utils'
import { json } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ locals: { db, user } }) => {
	let authorized
	if (user) {
		authorized = or(isNull(notes.allowed_users), getAllowedUsersFilter(user.username, 'notes'))
	} else {
		authorized = isNull(notes.allowed_users)
	}

	const pages = await db
		.select()
		.from(notes)
		.where(and(eq(notes.frontpage, false), authorized))

	return json(pages, {
		headers: {
			'cache-control': 'public, max-age=21600',
			vary: 'cookie'
		}
	})
}
