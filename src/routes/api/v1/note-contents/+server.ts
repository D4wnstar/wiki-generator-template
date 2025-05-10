import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { noteContents } from '$lib/schema'
import { eq } from 'drizzle-orm'

export const GET: RequestHandler = async ({ url, locals: { db } }) => {
	const notePath = url.searchParams.get('note_path')
	if (!notePath) {
		return json({ message: 'Missing note path' }, { status: 400 })
	}

	const contents = await db.select().from(noteContents).where(eq(noteContents.note_path, notePath))

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
