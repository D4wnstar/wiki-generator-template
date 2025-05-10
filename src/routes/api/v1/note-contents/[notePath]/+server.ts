import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { noteContents } from '$lib/schema'
import { and, eq, isNull, or } from 'drizzle-orm'
import { getAllowedUsersFilter } from '$lib/utils'

/**
 * Get the contents of a note, if the current user is authorized.
 */
export const GET: RequestHandler = async ({ params: { notePath }, locals: { db, user } }) => {
	let authorized
	if (user) {
		authorized = or(
			isNull(noteContents.allowed_users),
			getAllowedUsersFilter(user.username, 'noteContents')
		)
	} else {
		authorized = isNull(noteContents.allowed_users)
	}

	const contents = await db
		.select()
		.from(noteContents)
		.where(and(eq(noteContents.note_path, decodeURIComponent(notePath)), authorized))

	if (!contents) {
		return json({ message: 'No contents found' }, { status: 404 })
	} else {
		return json(
			{ message: 'Retrieved contents', contents },
			{
				headers: {
					'cache-control': 'public, max-age=21600',
					vary: 'cookie'
				}
			}
		)
	}
}
