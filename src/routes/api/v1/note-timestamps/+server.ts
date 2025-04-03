import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { notes } from '$lib/schema'
import { eq } from 'drizzle-orm'

export const GET: RequestHandler = async ({ url, locals: { db } }) => {
	const noteSlug = url.searchParams.get('note_slug')
	const frontpage = url.searchParams.get('frontpage')
	if (!frontpage && !noteSlug) {
		return json({ message: 'Missing note paths' }, { status: 400 })
	}

	let condition
	if (frontpage) {
		condition = eq(notes.frontpage, true)
	} else if (noteSlug) {
		condition = eq(notes.slug, decodeURIComponent(noteSlug))
	}

	const timestamps = await db
		.select({
			slug: notes.slug,
			last_updated: notes.last_updated
		})
		.from(notes)
		.where(condition)
		.get()

	return json({ timestamps })
}
