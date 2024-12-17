import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { noteContents, notes } from '$lib/schema'
import { eq } from 'drizzle-orm'
import { getAllowedUsersFilter } from '$lib/utils'

/**
 * Get all pages marked as secred that the user is allowed to see.
 */
export const GET: RequestHandler = async ({ locals: { db, user } }) => {
	if (!user) {
		return json({ message: 'No user is logged in' })
	}

	const conditionPages = getAllowedUsersFilter(user.username, 'notes')
	const conditionChunks = getAllowedUsersFilter(user.username, 'noteContents')

	const pages = await db.select().from(notes).where(conditionPages)
	const chunks = await db
		.select()
		.from(noteContents)
		.where(conditionChunks)
		.rightJoin(notes, eq(noteContents.note_id, notes.id))

	return json({ pages, chunks })
}
