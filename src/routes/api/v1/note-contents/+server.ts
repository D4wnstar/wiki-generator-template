import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { noteContents } from '$lib/schema'
import { eq } from 'drizzle-orm'

export const GET: RequestHandler = async ({ url, locals: { db } }) => {
	const noteIdStr = url.searchParams.get('note_id')

	if (!noteIdStr) {
		return json({ message: 'Missing note id' }, { status: 400 })
	}

	let noteId
	try {
		noteId = parseInt(noteIdStr)
	} catch (error) {
		return json({ message: 'Could not parse note id' }, { status: 400 })
	}

	const contents = await db.select().from(noteContents).where(eq(noteContents.note_id, noteId))

	if (!contents) {
		return json({ message: 'No contents found' }, { status: 404 })
	} else {
		return json({ message: 'Retrieved contents', contents })
	}
}
